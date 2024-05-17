package partnership

import (
	"context"
	"go.uber.org/zap"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/coordinator"
	"sentadel-backend/internal/logger"
)

type PartnershipUsecases interface {
	AddNewPartner(ctx context.Context, dto ManagePartnerRequestDto) (res bool, err error)
	UpdatePartner(ctx context.Context, dto ManagePartnerRequestDto) (res bool, err error)
	GetGroupedPartners(ctx context.Context, dto GetPartnerListDto) (response *GroupedPartnersDataModel, err error)
	GetPartners(ctx context.Context, dto GetPartnerListDto) (response *PartnersDataModel, err error)
}

type partnershipUsecase struct {
	database.TxManager
	PartnershipRepository
	coordinator.CoordinatorRepository
}

func NewPartnershipUsecase(conn database.TxManager, partnershipRepository PartnershipRepository,
	coordinatorRepository coordinator.CoordinatorRepository) *partnershipUsecase {
	return &partnershipUsecase{
		conn,
		partnershipRepository,
		coordinatorRepository,
	}
}

func (psu partnershipUsecase) AddNewPartner(ctx context.Context, dto ManagePartnerRequestDto) (res bool, err error) {
	model, err := dto.MapToModel()
	if err != nil {
		return false, err
	}

	err = psu.RunTx(ctx, func(ctx context.Context) error {
		_, err = psu.CoordinatorRepository.GetByID(ctx, model.CoordinatorID)
		if err != nil {
			logger.ContextLogger(ctx).Error("Coordinator doesn't exist", zap.Error(err))
			return err
		}

		isSuccess, err := psu.PartnershipRepository.AddNewPartner(ctx, model)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add new partner", zap.Error(err))
			return err
		}

		res = isSuccess
		return nil
	})

	return res, err
}

func (psu partnershipUsecase) UpdatePartner(ctx context.Context, dto ManagePartnerRequestDto) (res bool, err error) {
	model, err := dto.MapToUpdateModel()
	if err != nil {
		return false, err
	}

	err = psu.RunTx(ctx, func(ctx context.Context) error {
		_, err = psu.CoordinatorRepository.GetByID(ctx, model.CoordinatorID)
		if err != nil {
			logger.ContextLogger(ctx).Error("Coordinator doesn't exist", zap.Error(err))
			return err
		}

		_, err = psu.PartnershipRepository.GetByID(ctx, model.PartnerID)
		if err != nil {
			logger.ContextLogger(ctx).Error("Partner doesn't exist", zap.Error(err))
			return err
		}

		isSuccess, err := psu.PartnershipRepository.UpdatePartner(ctx, model)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when update partner", zap.Error(err))
			return err
		}

		res = isSuccess
		return nil
	})

	return res, err
}

func (psu partnershipUsecase) GetGroupedPartners(ctx context.Context, dto GetPartnerListDto) (response *GroupedPartnersDataModel, err error) {
	listResponse, err := psu.PartnershipRepository.GetGroupedPartners(ctx, dto)
	if err != nil {
		return nil, err
	}

	response = &GroupedPartnersDataModel{
		Meta: Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		List: []GroupedPartnerListModel{},
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

func (psu partnershipUsecase) GetPartners(ctx context.Context, dto GetPartnerListDto) (response *PartnersDataModel, err error) {
	listResponse, err := psu.PartnershipRepository.GetPartners(ctx, dto)
	if err != nil {
		return nil, err
	}

	response = &PartnersDataModel{
		Meta: Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		List: []PartnerModel{},
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
