package tax_and_fee

import (
	"context"
	"go.uber.org/zap"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/models"
	queuerequest "sentadel-backend/internal/queue_request"
	"sentadel-backend/internal/user"
)

type TaxAndFeeUsecases interface {
	GetTaxList(ctx context.Context, dto models.SearchRequest) (TaxListResponse, error)
	GetFeeList(ctx context.Context, dto models.SearchRequest) (FeeListResponse, error)
	SetNewTaxUseCase(ctx context.Context, newTax NewTaxReqParams, userID int64) (bool, error)
	SetNewFeeUseCase(ctx context.Context, newTax NewFeeReqParams, userID int64) (bool, error)
}

type TaxAndFeeUsecasesOpts struct {
	TxManager           database.TxManager
	TaxAndFeeRepository TaxAndFeeRepository
}

type taxAndFeeUsecase struct {
	database.TxManager
	TaxAndFeeRepository
	queuerequest.QueueRequestRepository
}

func NewTaxAndFeeUsecase(opts TaxAndFeeUsecasesOpts) *taxAndFeeUsecase {
	return &taxAndFeeUsecase{
		TxManager:           opts.TxManager,
		TaxAndFeeRepository: opts.TaxAndFeeRepository,
	}
}

func (tfu *taxAndFeeUsecase) GetTaxList(ctx context.Context, searchRequest models.SearchRequest) (TaxListResponse, error) {
	searchResponse, err := tfu.TaxAndFeeRepository.GetTaxList(ctx, searchRequest)
	if err != nil {
		return TaxListResponse{}, err
	}

	response := TaxListResponse{
		List: []TaxModel{},
		Meta: user.Meta{
			Page:  int(searchRequest.Page),
			Limit: int(searchRequest.Limit),
			Pages: 0,
		},
	}

	if len(searchResponse) < 1 || searchResponse == nil {
		return response, nil
	}

	total := float64(searchResponse[0].Total)
	limit := float64(searchRequest.Limit)

	response.List = searchResponse
	response.Meta.Pages = int(math.Ceil(total / limit))

	return response, err
}

func (tfu *taxAndFeeUsecase) GetFeeList(ctx context.Context, searchRequest models.SearchRequest) (FeeListResponse, error) {
	searchResponse, err := tfu.TaxAndFeeRepository.GetFeeList(ctx, searchRequest)
	if err != nil {
		return FeeListResponse{}, err
	}

	response := FeeListResponse{
		List: []FeeModel{},
		Meta: user.Meta{
			Page:  int(searchRequest.Page),
			Limit: int(searchRequest.Limit),
			Pages: 0,
		},
	}

	if len(searchResponse) < 1 || searchResponse == nil {
		return response, nil
	}

	total := float64(searchResponse[0].Total)
	limit := float64(searchRequest.Limit)

	response.List = searchResponse
	response.Meta.Pages = int(math.Ceil(total / limit))

	return response, err
}

func (tfu *taxAndFeeUsecase) SetNewTaxUseCase(ctx context.Context, newTax NewTaxReqParams, userID int64) (response bool, err error) {
	err = tfu.RunTx(ctx, func(ctx context.Context) error {
		_, err := tfu.TaxAndFeeRepository.CheckInvoiceBeforeSetNewTaxOrFee(ctx)
		if err != nil && err.Error() != "Data not found" {
			return errors.Wrap(err, errors.InvalidDataError, "There are some printed invoice that not yet marked as paid, please handle it first")
		}

		dataResponse, err := tfu.TaxAndFeeRepository.SetNewTax(ctx, newTax, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when set new tax", zap.Error(err))
			return err
		}

		response = dataResponse

		return nil
	})

	return response, err
}

func (tfu *taxAndFeeUsecase) SetNewFeeUseCase(ctx context.Context, newFee NewFeeReqParams, userID int64) (response bool, err error) {
	err = tfu.RunTx(ctx, func(ctx context.Context) error {
		_, err := tfu.TaxAndFeeRepository.CheckInvoiceBeforeSetNewTaxOrFee(ctx)
		if err != nil && err.Error() != "Data not found" {
			return errors.Wrap(err, errors.InvalidDataError, "There are some printed invoice that not yet marked as paid, please handle it first")
		}

		dataResponse, err := tfu.TaxAndFeeRepository.SetNewFee(ctx, newFee, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when set new tax", zap.Error(err))
			return err
		}

		response = dataResponse

		return nil
	})

	return response, err
}
