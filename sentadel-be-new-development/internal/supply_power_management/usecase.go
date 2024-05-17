package supply_power_management

import (
	"context"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/models"
	"sentadel-backend/internal/user"
)

type SupplyPowerManagementUsecases interface {
	GetList(ctx context.Context, searchRequest models.SearchRequest) (PowerSupplyManagementListResponse, error)
	GetRecap(ctx context.Context) (PowerSupplyModel, error)
}

type PowerSupplyManagementUsecasesOpts struct {
	TxManager                       database.TxManager
	PowerSupplyManagementRepository PowerSupplyManagementRepository
}

func NewPowerSupplyManagementUsecases(opts PowerSupplyManagementUsecasesOpts) *powerSupplyManagementUsecases {
	return &powerSupplyManagementUsecases{
		TxManager:                       opts.TxManager,
		PowerSupplyManagementRepository: opts.PowerSupplyManagementRepository,
	}
}

type powerSupplyManagementUsecases struct {
	database.TxManager
	PowerSupplyManagementRepository
}

func (psu *powerSupplyManagementUsecases) GetList(ctx context.Context, searchRequest models.SearchRequest) (PowerSupplyManagementListResponse, error) {
	searchResponse, err := psu.PowerSupplyManagementRepository.GetList(ctx, searchRequest)
	if err != nil {
		return PowerSupplyManagementListResponse{}, err
	}

	response := PowerSupplyManagementListResponse{
		List: []PowerSupplyModel{},
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

func (psu *powerSupplyManagementUsecases) GetRecap(ctx context.Context) (PowerSupplyModel, error) {
	searchResponse, err := psu.PowerSupplyManagementRepository.GetRecap(ctx)
	if err != nil {
		return PowerSupplyModel{}, err
	}

	return PowerSupplyModel{
		Quota:        searchResponse.Quota,
		SupplyFilled: searchResponse.SupplyFilled,
	}, err
}
