package barcode_system

import (
	"context"
	"go.uber.org/zap"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/logger"
)

type BarcodeSystemUseCase interface {
	CreateClientBarcode(ctx context.Context, userID int64, params CreateClientBarcodeRequest) (response *ClientBarcodeGroupModel, err error)
	GetClientBarcode(ctx context.Context, dto ClientBarcodeRequestDto, userID *int64) (response *ClientBarcodeGroupDataModel, err error)
}

type barcodeSystemUseCase struct {
	database.TxManager
	BarcodeSystemRepository
}

func NewBarcodeSystemUseCase(manager database.TxManager, repository BarcodeSystemRepository) *barcodeSystemUseCase {
	return &barcodeSystemUseCase{
		manager,
		repository,
	}
}

func (bsu barcodeSystemUseCase) CreateClientBarcode(ctx context.Context, userID int64, params CreateClientBarcodeRequest) (response *ClientBarcodeGroupModel, err error) {
	err = bsu.RunTx(ctx, func(ctx context.Context) error {
		response, err = bsu.BarcodeSystemRepository.CreateClientBarcode(ctx, userID, params)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when approve queue", zap.Error(err))
			return err
		}

		return nil
	})

	return response, err
}

func (bsu barcodeSystemUseCase) GetClientBarcode(ctx context.Context, dto ClientBarcodeRequestDto, userID *int64) (response *ClientBarcodeGroupDataModel, err error) {
	listResponse, err := bsu.BarcodeSystemRepository.GetClientBarcode(ctx, dto, userID)
	if err != nil {
		return nil, err
	}

	response = &ClientBarcodeGroupDataModel{
		Meta: Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		List: []ClientBarcodeGroupModel{},
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
