package sales

import (
	"context"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/operational"

	"go.uber.org/zap"
)

type SalesUsecases interface {
	// CreateGrouping(ctx context.Context, params []GoodsDataForGroupingParams, userID int64) (res *GroupingQueueData, err error)
	GetGroupingList(ctx context.Context, dto GroupingListDto) (response *GetGroupingDataModel, err error)
	GetGroupingDetail(ctx context.Context, dto GroupingDetailDto, keyParam string) (response *GroupingDetailModel, err error)
	UpdateGroupingList(ctx context.Context, params UpdateGroupingParamsDto, userID int64) (res bool, err error)
	CreateShipment(ctx context.Context, params CreateShipmentDto, userID int64) (res *ShipmentQueueData, err error)
}

type salesUsecase struct {
	database.TxManager
	SalesRepository
	operational.OperationalRepository
}

func NewSalesUsecase(conn database.TxManager, salesRepository SalesRepository, operationalRepository operational.OperationalRepository) *salesUsecase {
	return &salesUsecase{
		conn,
		salesRepository,
		operationalRepository,
	}
}

func (sau salesUsecase) UpdateGroupingList(ctx context.Context, params UpdateGroupingParamsDto, userID int64) (res bool, err error) {
	err = sau.RunTx(ctx, func(ctx context.Context) error {
		updateData, err := sau.SalesRepository.UpdateGroupingList(ctx, params, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when update grouping list", zap.Error(err))
			return err
		}

		res = updateData

		return nil
	})

	return res, err
}

func (sau salesUsecase) GetGroupingList(ctx context.Context, dto GroupingListDto) (response *GetGroupingDataModel, err error) {
	listResponse, err := sau.SalesRepository.GetGroupingList(ctx, dto)
	if err != nil {
		return nil, err
	}

	response = &GetGroupingDataModel{
		Meta: Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		List: []GroupingModel{},
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

func (sau salesUsecase) GetGroupingDetail(ctx context.Context, dto GroupingDetailDto, keyParam string) (response *GroupingDetailModel, err error) {
	detail, err := sau.SalesRepository.GetGroupingDetail(ctx, dto, keyParam)
	if err != nil {
		return nil, err
	}

	response = &GroupingDetailModel{
		Meta: Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		GroupingDataJson: []GroupingAndGoodsModel{},
		GoodsDataJson:    []GroupingAndGoodsModel{},
	}

	if detail == nil {
		return response, nil
	}

	response = detail

	if len(detail.GoodsDataJson) > 0 {
		total := float64(detail.GoodsDataJson[0].Total)
		limit := float64(dto.Limit)
		response.Meta.Pages = int(math.Ceil(total / limit))
	}

	return response, err
}

func (sau salesUsecase) CreateShipment(ctx context.Context, params CreateShipmentDto, userID int64) (res *ShipmentQueueData, err error) {
	err = sau.RunTx(ctx, func(ctx context.Context) error {
		updateData, err := sau.SalesRepository.CreateShipment(ctx, params, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when create shipment grouping list", zap.Error(err))
			return err
		}

		res = updateData

		return nil
	})

	return res, err
}
