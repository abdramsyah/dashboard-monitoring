package coordinator

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"go.uber.org/zap"
	"math"
	"sentadel-backend/internal/base/crypto"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/base/uploader"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/models"
	"sentadel-backend/internal/user"
	"sentadel-backend/internal/utils"
)

type CoordinatorUsecases interface {
	Create(ctx context.Context, in CoordinatorUserDto) (response CoordinatorResponse, err error)
	Update(ctx context.Context, in CoordinatorDto) (response CoordinatorResponse, err error)
	Delete(ctx context.Context, id int64) error
	GetList(ctx context.Context, listDto models.SearchRequest) (CoordinatorListResponse, error)

	MarkAsPaid(ctx context.Context, invoiceId int64, userId int64) (response bool, err error)
}

type coordinatorUsecase struct {
	database.TxManager
	CoordinatorRepository
	user.UserRepository
	crypto.Crypto
	uploader.Uploader
}

func NewUsecase(manager database.TxManager, crypto crypto.Crypto, Uploader uploader.Uploader, repository CoordinatorRepository, userRepository user.UserRepository) *coordinatorUsecase {
	return &coordinatorUsecase{
		manager,
		repository,
		userRepository,
		crypto,
		Uploader,
	}
}

func (c coordinatorUsecase) Create(ctx context.Context, in CoordinatorUserDto) (response CoordinatorResponse, err error) {
	userModel, err := in.UserParam.MapToModel()
	if err != nil {
		return CoordinatorResponse{}, err
	}

	if err := userModel.HashPassword(c.Crypto); err != nil {
		return CoordinatorResponse{}, err
	}

	if len(in.UserParam.Roles) == 0 {
		return CoordinatorResponse{}, errors.New(errors.Status(errors.ErrValidationRole))
	}

	if len(userModel.Photo) > 0 {
		// decode image from base64 to slice of bytes
		decoded, err := base64.StdEncoding.DecodeString(userModel.Photo)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when decode str", zap.Error(err))
			return CoordinatorResponse{}, err
		}

		//validate the mime type
		mimeType := ""
		if len(decoded) > 4 && bytes.Equal(decoded[:4], []byte{0x89, 0x50, 0x4e, 0x47}) {
			mimeType = "image/png"
		} else if len(decoded) > 2 && bytes.Equal(decoded[:2], []byte{0xff, 0xd8}) {
			mimeType = "image/jpeg"
		} else {
			return CoordinatorResponse{}, errors.New(errors.InvalidDataError)
		}

		fileName := fmt.Sprintf("%s_%s", userModel.Username, utils.RandStringBytesMaskImpr(6))

		imageUrl, err := c.Uploader.Upload(fileName, mimeType, decoded)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when upload to s3", zap.Error(err))
			return CoordinatorResponse{}, err
		}

		userModel.Photo = imageUrl
	}

	err = c.RunTx(ctx, func(ctx context.Context) error {
		userID, err := c.UserRepository.Add(ctx, userModel)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add to db", zap.Error(err))
			return err
		}

		in.CoordinatorParam.UserID = userID

		model, err := in.CoordinatorParam.MapToModel()
		if err != nil {
			return err
		}

		dataResponse, err := c.CoordinatorRepository.Create(ctx, model)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add coordinator weight to db", zap.Error(err))
			return err
		}

		response = c.modelToResponse(dataResponse)

		return nil
	})

	return response, err
}

func (c coordinatorUsecase) Update(ctx context.Context, in CoordinatorDto) (clientResponseData CoordinatorResponse, err error) {
	model, err := c.CoordinatorRepository.GetByID(ctx, in.ID)
	if err != nil {
		return clientResponseData, err
	}

	model.Quota = in.Quota
	model.Code = in.Code

	model, err = c.CoordinatorRepository.Update(ctx, *model)
	if err != nil {
		return clientResponseData, err
	}

	clientResponseData = c.modelToResponse(model)

	return clientResponseData, err
}

func (c coordinatorUsecase) Delete(ctx context.Context, id int64) error {
	coordinator, err := c.CoordinatorRepository.GetByID(ctx, id)
	if err != nil {
		return err
	}

	_, err = c.CoordinatorRepository.Delete(ctx, id)

	if err != nil {
		logger.ContextLogger(ctx).Error("delete coordinator failed", zap.Error(err))
		return err
	}

	_, err = c.UserRepository.Delete(ctx, coordinator.UserID)

	if err != nil {
		logger.ContextLogger(ctx).Error("delete coordinator failed", zap.Error(err))
		return err
	}

	return nil
}

func (c coordinatorUsecase) GetList(ctx context.Context, listDto models.SearchRequest) (CoordinatorListResponse, error) {
	searchResponse, err := c.CoordinatorRepository.GetList(ctx, listDto)
	if err != nil {
		return CoordinatorListResponse{}, err
	}

	response := CoordinatorListResponse{
		List: []CoordinatorModel{},
		Meta: user.Meta{
			Page:  int(listDto.Page),
			Limit: int(listDto.Limit),
			Pages: 0,
		},
	}

	if len(searchResponse) < 1 || searchResponse == nil {
		return response, nil
	}

	total := float64(searchResponse[0].Total)
	limit := float64(listDto.Limit)

	response.List = searchResponse
	response.Meta.Pages = int(math.Ceil(total / limit))

	return response, err
}

func (c coordinatorUsecase) MarkAsPaid(ctx context.Context, invoiceId int64, userId int64) (response bool, err error) {
	err = c.RunTx(ctx, func(ctx context.Context) error {
		res, err := c.CoordinatorRepository.MarkAsPaidCoordinator(ctx, invoiceId, userId)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add coordinator weight to db", zap.Error(err))
			return err
		}

		response = res

		return nil
	})

	return response, err
}

func (c coordinatorUsecase) modelToResponse(clientModel *CoordinatorModel) CoordinatorResponse {
	response := CoordinatorResponse{
		ID:        clientModel.ID,
		UserID:    clientModel.UserID,
		Quota:     clientModel.Quota,
		CreatedAt: clientModel.CreatedAt,
		UpdatedAt: clientModel.UpdatedAt,
	}

	return response
}
