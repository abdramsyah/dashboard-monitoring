package impl

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"math"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/base/uploader"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/roles"
	"sentadel-backend/internal/utils"

	"go.uber.org/zap"

	"sentadel-backend/internal/base/crypto"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/user"
)

type UserUsecasesOpts struct {
	TxManager      database.TxManager
	UserRepository user.UserRepository
	Crypto         crypto.Crypto
	Uploader       uploader.Uploader
}

func NewUserUsecases(opts UserUsecasesOpts, roleRepository roles.RoleRepository) user.UserUsecases {
	return &userUsecases{
		TxManager:      opts.TxManager,
		UserRepository: opts.UserRepository,
		Crypto:         opts.Crypto,
		RoleRepository: roleRepository,
		Uploader:       opts.Uploader,
	}
}

type userUsecases struct {
	database.TxManager
	user.UserRepository
	crypto.Crypto
	uploader.Uploader
	roles.RoleRepository
}

func (u *userUsecases) Add(ctx context.Context, userDto user.AddUserDto) (response int64, err error) {
	model, err := userDto.MapToModel()
	if err != nil {
		return 0, err
	}
	if err := model.HashPassword(u.Crypto); err != nil {
		return 0, err
	}

	if len(userDto.Roles) == 0 {
		return 0, errors.New(errors.Status(errors.ErrValidationRole))
	}

	if len(model.Photo) > 0 {
		// decode image from base64 to slice of bytes
		decoded, err := base64.StdEncoding.DecodeString(model.Photo)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when decode str", zap.Error(err))
			return 0, err
		}

		//validate the mime type
		mimeType := ""
		if len(decoded) > 4 && bytes.Equal(decoded[:4], []byte{0x89, 0x50, 0x4e, 0x47}) {
			mimeType = "image/png"
		} else if len(decoded) > 2 && bytes.Equal(decoded[:2], []byte{0xff, 0xd8}) {
			mimeType = "image/jpeg"
		} else {
			return 0, errors.New(errors.InvalidDataError)
		}

		fileName := fmt.Sprintf("%s_%s", model.Username, utils.RandStringBytesMaskImpr(6))

		imageUrl, err := u.Uploader.Upload(fileName, mimeType, decoded)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when upload to s3", zap.Error(err))
			return 0, err
		}

		model.Photo = imageUrl
	}

	// Transaction demonstration
	err = u.RunTx(ctx, func(ctx context.Context) error {
		res, err := u.UserRepository.Add(ctx, model)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add to db", zap.Error(err))
			return err
		}

		response = res

		return nil
	})

	return response, err
}

func (u *userUsecases) Update(ctx context.Context, in user.UpdateUserDto) (err error) {
	model, err := u.UserRepository.GetById(ctx, in.Id)
	if err != nil {
		return err
	}

	err = model.Update(in.Name, in.Email, in.PhoneNumber, in.Username, in.Password, in.Roles, in.Modules)

	if err != nil {
		return err
	}

	if len(in.Password) > 0 {
		if err := model.HashPassword(u.Crypto); err != nil {
			return err
		}
	}

	if len(in.Roles) == 0 {
		return errors.New(errors.Status(errors.ErrValidationRole))
	}

	err = u.RunTx(ctx, func(ctx context.Context) error {
		_, err = u.UserRepository.Update(ctx, model)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when update user", zap.Error(err))
			return err
		}

		return nil
	})

	return err
}

func (u *userUsecases) Search(ctx context.Context, in user.UserSearchDto, isSuper bool) (*user.UserSearchResponse, error) {
	searchResponse, err := u.UserRepository.Search(ctx, in, isSuper)
	if err != nil {
		return nil, err
	}

	response := &user.UserSearchResponse{
		Users: []user.UserModel{},
		Meta: user.Meta{
			Page:  int(in.Page),
			Limit: int(in.Limit),
			Pages: 0,
		},
	}

	if len(searchResponse) < 1 || searchResponse == nil {
		return response, nil
	}

	total := float64(searchResponse[0].Total)
	limit := float64(in.Limit)

	response.Users = searchResponse
	response.Meta.Pages = int(math.Ceil(total / limit))

	return response, err
}

func (u *userUsecases) Delete(ctx context.Context, in user.DeleteUserDto) (err error) {
	model, err := u.UserRepository.GetById(ctx, in.Id)
	if err != nil {
		return err
	}

	err = u.RunTx(ctx, func(ctx context.Context) error {
		_, err = u.UserRepository.Delete(ctx, model.Id)

		if err != nil {
			logger.ContextLogger(ctx).Error("error when delete user", zap.Error(err))
			return err
		}

		return nil
	})

	return err
}

func (u *userUsecases) ChangePassword(ctx context.Context, in user.ChangeUserPasswordDto) (err error) {
	user, err := u.UserRepository.GetById(ctx, in.Id)

	if err != nil {
		return err
	}

	if !user.ComparePassword(in.OldPassword, u.Crypto) {
		return errors.New(errors.WrongCredentialsError)
	}

	if err = user.ChangePassword(in.NewPassword, u.Crypto); err != nil {
		return err
	}
	_, err = u.UserRepository.Update(ctx, user)

	return err
}

func (u *userUsecases) GetById(ctx context.Context, userId int64) (out user.UserDto, err error) {
	model, err := u.UserRepository.GetById(ctx, userId)
	if err != nil {
		return out, err
	}

	return out.MapFromModel(model), nil
}
