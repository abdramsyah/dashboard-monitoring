package operational

import (
	"context"
	"fmt"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"

	"go.uber.org/zap"
)

type OperationalUsecases interface {
	Create(ctx context.Context, dto ArrayOfGradingQueueDataDto, userID int64, isStockAdministrator bool) (res []GradingQueueResModel, err error)
	Update(ctx context.Context, dto ArrayOfGradingQueueDataDto, userID int64, isStockAdministrator bool) (res []GradingQueueResModel, err error)
	GetGoodsInformation(ctx context.Context, dto GoodsInformationListDto) (response *GetWeightDataModel, err error)
	GetGoodsDetail(ctx context.Context, param string) (response *GetGoodsModel, err error)
	SetWeight(ctx context.Context, dto SetWeightDto, userID int64) (res bool, err error)
	GetGoodsListForGrouping(ctx context.Context, params []GoodsDataForGroupingParams) (response []GoodsDataForGroupingModel, err error)
	CreateGrouping(ctx context.Context, params []GoodsDataForGroupingParams, userID int64) (res *GroupingQueueData, err error)
	GetGroupingList(ctx context.Context, dto GoodsInformationListDto) (response *GetGroupingDataModel, err error)
}

type operationalUsecase struct {
	database.TxManager
	OperationalRepository
}

func NewOperationalUsecase(conn database.TxManager, operationalRepository OperationalRepository) *operationalUsecase {
	return &operationalUsecase{
		conn,
		operationalRepository,
	}
}

func (opu operationalUsecase) Create(ctx context.Context, dto ArrayOfGradingQueueDataDto, userID int64, isStockAdministrator bool) (res []GradingQueueResModel, err error) {
	valid, res := dto.MapToModel()

	err = opu.RunTx(ctx, func(ctx context.Context) error {
		validRes, err := opu.OperationalRepository.CreateGradeInformation(ctx, valid, userID, isStockAdministrator)
		if err != nil && err.Error() != "Data not found" {
			logger.ContextLogger(ctx).Error("error when create grading data", zap.Error(err))
			return err
		}

		res = append(res, validRes...)

		return nil
	})

	return res, err
}

func (opu operationalUsecase) Update(ctx context.Context, dto ArrayOfGradingQueueDataDto, userID int64, isStockAdministrator bool) (res []GradingQueueResModel, err error) {
	valid, res := dto.MapToModel()

	err = opu.RunTx(ctx, func(ctx context.Context) error {
		_, err = opu.OperationalRepository.DeleteGradeInformation(ctx, valid)
		if err != nil && err.Error() != "Data not found" {
			logger.ContextLogger(ctx).Error("error when delete grading data", zap.Error(err))
			return err
		}

		validRes, err := opu.OperationalRepository.CreateGradeInformation(ctx, valid, userID, isStockAdministrator)
		if err != nil && err.Error() != "Data not found" {
			logger.ContextLogger(ctx).Error("error when create grading data", zap.Error(err))
			return err
		}

		res = append(res, validRes...)

		return nil
	})

	return res, err
}

func (opu operationalUsecase) GetGoodsInformation(ctx context.Context, dto GoodsInformationListDto) (response *GetWeightDataModel, err error) {
	listResponse, err := opu.OperationalRepository.GetGoodsInformation(ctx, dto)
	if err != nil {
		return nil, err
	}

	response = &GetWeightDataModel{
		Meta: Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		List: []GetGoodsModel{},
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

func (opu operationalUsecase) GetGoodsDetail(ctx context.Context, param string) (response *GetGoodsModel, err error) {
	response, err = opu.OperationalRepository.GetGoodsDetail(ctx, param)
	fmt.Println("GetGoodsDetail - response", response)
	if err != nil {
		return nil, err
	}

	if response.GoodsID == 0 {
		return nil, errors.Wrap(err, errors.DatabaseError, "Barcode salah atau belum ditumplek")
	}

	return response, err
}

func (opu operationalUsecase) SetWeight(ctx context.Context, dto SetWeightDto, userID int64) (res bool, err error) {
	model, err := dto.SetWeightMapToModel()
	if err != nil {
		return false, err
	}

	err = opu.RunTx(ctx, func(ctx context.Context) error {
		res, err = opu.OperationalRepository.SetWeight(ctx, model, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when set weight data", zap.Error(err))
			return err
		}

		return nil
	})

	return res, err
}

func (opu operationalUsecase) GetGoodsListForGrouping(ctx context.Context, params []GoodsDataForGroupingParams) (response []GoodsDataForGroupingModel, err error) {
	response, err = opu.OperationalRepository.GetGoodsListForGrouping(ctx, params)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error when try to get goods list for grouping", zap.Error(err))
		return nil, err
	}

	return response, err
}

func (opu operationalUsecase) CreateGrouping(ctx context.Context, params []GoodsDataForGroupingParams, userID int64) (res *GroupingQueueData, err error) {
	err = opu.RunTx(ctx, func(ctx context.Context) error {
		groupingList, err := opu.OperationalRepository.GetGoodsListForGrouping(ctx, params)

		currentClientId := int64(0)
		for _, goods := range groupingList {
			if goods.ClientID == nil {
				return errors.Wrap(err, errors.DatabaseError, "Client ID tidak ada")
			}

			if currentClientId == 0 {
				currentClientId = *goods.ClientID
			} else if currentClientId != *goods.ClientID {
				res.GroupingList = groupingList
				return errors.Wrap(err, errors.DatabaseError, "Client ID tidak ada")
			}
		}

		grp, err := opu.OperationalRepository.CreateGrouping(ctx, groupingList, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when set weight data", zap.Error(err))
			return err
		}

		res = grp
		res.GroupingList = groupingList

		return nil
	})

	return res, err
}

func (opu operationalUsecase) GetGroupingList(ctx context.Context, dto GoodsInformationListDto) (response *GetGroupingDataModel, err error) {
	listResponse, err := opu.OperationalRepository.GetGroupingList(ctx, dto)
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
