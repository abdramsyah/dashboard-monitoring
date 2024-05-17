package purchase

import (
	"context"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/operational"
	"sentadel-backend/internal/user"

	"go.uber.org/zap"
)

type PurchaseUsecases interface {
	GetDeliveryWithStatusAccum(ctx context.Context, dto ParamsDto) (response *DeliveryWithStatusAccumDataModel, err error)
	GetDeliveryDetail(ctx context.Context, deliveryNumber string) (response *DeliveryDetailModel, err error)
	ValidateData(ctx context.Context, dto ValidatePurchaseDto, userID int64) (res bool, err error)
	GetPendingValidation(ctx context.Context, dto ParamsDto) (response *PendingValidationModel, err error)
}

type purchaseUsecase struct {
	database.TxManager
	PurchaseRepository
}

func NewPurchaseUsecase(manager database.TxManager, purchaseRepository PurchaseRepository) *purchaseUsecase {
	return &purchaseUsecase{
		manager,
		purchaseRepository,
	}
}

func (pcu purchaseUsecase) GetDeliveryWithStatusAccum(ctx context.Context, dto ParamsDto) (response *DeliveryWithStatusAccumDataModel, err error) {
	listResponse, err := pcu.PurchaseRepository.GetDeliveryWithStatusAccum(ctx, dto)
	if err != nil {
		return nil, err
	}

	response = &DeliveryWithStatusAccumDataModel{
		Meta: user.Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		List: []DeliveryWithStatusAccumModel{},
	}

	if len(listResponse) < 1 || listResponse == nil {
		return response, nil
	}

	total := float64(listResponse[0].Total)
	limit := float64(dto.Limit)

	response.List = listResponse
	response.Meta.Pages = int(math.Ceil(total / limit))

	return response, err
}

func (pcu purchaseUsecase) GetDeliveryDetail(ctx context.Context, deliveryNumber string) (response *DeliveryDetailModel, err error) {
	if len(deliveryNumber) == 0 {
		logger.ContextLogger(ctx).Error("Params Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Delivery Number Not Right")
	}

	return pcu.PurchaseRepository.GetDeliveryDetail(ctx, deliveryNumber)
}

func (pcu purchaseUsecase) ValidateData(ctx context.Context, dto ValidatePurchaseDto, userID int64) (res bool, err error) {
	model := dto.MapToManagePurchaseModel()

	err = pcu.RunTx(ctx, func(ctx context.Context) error {
		isSuccess, err := pcu.PurchaseRepository.ManagePurchaseData(ctx, model, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("Error when manage purchase data", zap.Error(err))
			return err
		}

		res = isSuccess

		return nil
	})

	return res, err
}

func (pcu purchaseUsecase) GetPendingValidation(ctx context.Context, dto ParamsDto) (response *PendingValidationModel, err error) {
	listResponse, err := pcu.PurchaseRepository.GetPendingValidation(ctx, dto)
	if err != nil {
		return nil, err
	}

	response = &PendingValidationModel{
		Meta: user.Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		List: []operational.GetGoodsModel{},
	}

	if len(listResponse) < 1 || listResponse == nil {
		return response, nil
	}

	total := float64(listResponse[0].Total)
	limit := float64(dto.Limit)

	response.List = listResponse
	response.Meta.Pages = int(math.Ceil(total / limit))

	return response, err
}
