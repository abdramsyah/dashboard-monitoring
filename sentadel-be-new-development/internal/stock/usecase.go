package stock

import (
	"context"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/purchase"
	"sentadel-backend/internal/user"
)

type StockUsecases interface {
	GetStockList(ctx context.Context, dto GetStockListDto) (response *GetStockListDataModel, err error)
	GetStockDetailBySerialNumber(ctx context.Context, serialNumber string) (response *GetStockDetailModel, err error)
	GetStockSummary(ctx context.Context, dto GetStockListDto) (response *GetStockSummaryModel, err error)
}

type stockUsecases struct {
	database.TxManager
	StockRepository
}

func NewStockUsecase(manager database.TxManager, repository StockRepository) *stockUsecases {
	return &stockUsecases{
		manager, repository,
	}
}

func (stu stockUsecases) GetStockList(ctx context.Context, dto GetStockListDto) (response *GetStockListDataModel, err error) {
	listResponse, err := stu.StockRepository.GetStockList(ctx, dto)
	if err != nil {
		return nil, err
	}

	response = &GetStockListDataModel{
		Meta: user.Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		List: []purchase.BucketDataModel{},
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

func (stu stockUsecases) GetStockDetailBySerialNumber(ctx context.Context, serialNumber string) (response *GetStockDetailModel, err error) {
	listResponse, err := stu.StockRepository.GetStockDetailBySerialNumber(ctx, serialNumber)
	if err != nil {
		return nil, err
	}

	return listResponse, err
}

func (stu stockUsecases) GetStockSummary(ctx context.Context, dto GetStockListDto) (response *GetStockSummaryModel, err error) {
	listResponse, err := stu.StockRepository.GetStockSummary(ctx, dto)
	if err != nil {
		return nil, err
	}

	return listResponse, err
}
