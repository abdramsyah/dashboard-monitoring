package impl

import (
	"context"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/unique_code_generator"
	"sentadel-backend/internal/utils"

	"go.uber.org/zap"
)

type UniqueCodeUsecasesOpts struct {
	TxManager            database.TxManager
	UniqueCodeRepository unique_code_generator.UniqueCodeRepository
}

func NewUniqueCodeUsecases(opts UniqueCodeUsecasesOpts) unique_code_generator.UniqueCodeUseCases {
	return &uniqueCodeUsecases{
		TxManager:            opts.TxManager,
		UniqueCodeRepository: opts.UniqueCodeRepository,
	}
}

type uniqueCodeUsecases struct {
	database.TxManager
	unique_code_generator.UniqueCodeRepository
}

func (us *uniqueCodeUsecases) Generate(ctx context.Context, userId int64) (response *unique_code_generator.UniqueCodeResponse, err error) {
	// Transaction demonstration
	err = us.RunTx(ctx, func(ctx context.Context) error {
		uniqueCodeModel, err := us.UniqueCodeRepository.GenerateUniqueCode(ctx, utils.RandUniqueCode(9), userId)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when generate unique code to db", zap.Error(err))
			return err
		}

		response = us.uniqueCodeModelToUniqueCodeResponse(uniqueCodeModel)

		return nil
	})

	return response, nil
}

func (us *uniqueCodeUsecases) GetUniqueCodeHistory(ctx context.Context) (response unique_code_generator.UniqueCodeHistoryResponse, err error) {
	uniqueCodeModel, err := us.UniqueCodeRepository.GetUniqueCodeHistory(ctx)
	if err != nil {
		return response, err
	}

	response = unique_code_generator.UniqueCodeHistoryResponse{
		UniqueCodes: []unique_code_generator.UniqueCodeModel{},
	}

	if len(uniqueCodeModel) < 1 || uniqueCodeModel == nil {
		return response, nil
	}

	response.UniqueCodes = uniqueCodeModel

	return response, err
}

func (us *uniqueCodeUsecases) ValidateUniqueCode(ctx context.Context, code string) (bool, error) {
	var response bool
	err := us.RunTx(ctx, func(ctx context.Context) error {

		validation, err := us.UniqueCodeRepository.ValidateUniqueCode(ctx, code)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add queue request to db", zap.Error(err))
			return err
		}

		response = validation

		return nil
	})

	return response, err
}

func (us *uniqueCodeUsecases) BurnUniqueCode(ctx context.Context, code string, userId int64) (bool, error) {
	var response bool
	err := us.RunTx(ctx, func(ctx context.Context) error {

		validation, err := us.UniqueCodeRepository.BurnUniqueCode(ctx, &code, userId)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add queue request to db", zap.Error(err))
			return err
		}

		response = validation

		return nil
	})

	return response, err
}

func (us *uniqueCodeUsecases) uniqueCodeModelToUniqueCodeResponse(uniqueCodeModel *unique_code_generator.UniqueCodeModel) *unique_code_generator.UniqueCodeResponse {
	uniqueCodeResponse := unique_code_generator.UniqueCodeResponse{
		ID:        uniqueCodeModel.ID,
		Code:      uniqueCodeModel.Code,
		CreatedAt: uniqueCodeModel.CreatedAt,
	}

	return &uniqueCodeResponse
}
