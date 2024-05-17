package shipping

import (
	"context"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/models"
	"sentadel-backend/internal/unique_code_generator"
	"sentadel-backend/internal/user"

	"go.uber.org/zap"
)

type ShippingUsecases interface {
	CreateShipping(ctx context.Context, in ReqShippingGroupDto, clientId int64) (response bool, err error)
	GetList(ctx context.Context, listDto models.SearchRequest) (models.SearchResponse, error)
	GetAddress(ctx context.Context, clientId int64) ([]AddressList, error)
	GetDetail(ctx context.Context, shippingId int64) (ShippingDetail, error)
	UpdateShipping(ctx context.Context, in ReqShippingGroupDto, shippingId int64, userID int64) (response bool, err error)
	UpdateMarkAsShip(ctx context.Context, shippingId int64) (response bool, err error)
}

type shippingUsecase struct {
	database.TxManager
	ShippingRepository
	user.UserRepository
	unique_code_generator.UniqueCodeRepository
}

func NewUsecase(manager database.TxManager, repository ShippingRepository, userRepository user.UserRepository, uniqueCode unique_code_generator.UniqueCodeRepository) *shippingUsecase {
	return &shippingUsecase{
		manager,
		repository,
		userRepository,
		uniqueCode,
	}
}

func (c *shippingUsecase) CreateShipping(ctx context.Context, in ReqShippingGroupDto, clientId int64) (response bool, err error) {

	// Transaction demonstration
	err = c.RunTx(ctx, func(ctx context.Context) error {
		invNumber, err := c.getGroupCode(ctx, in.ClientCode)
		if err != nil {
			return err
		}

		invoiceId, err := c.ShippingRepository.CreateShipping(ctx, clientId, in.AddressId, *invNumber)
		if err != nil {
			return err
		}

		dataResponse, err := c.ShippingRepository.CreateShippingGroup(ctx, *invoiceId, in)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add queue request to db", zap.Error(err))
			return err
		}

		response = dataResponse

		return nil
	})

	return true, err
}

func (c *shippingUsecase) GetList(ctx context.Context, listDto models.SearchRequest) (models.SearchResponse, error) {
	searchResponse, err := c.ShippingRepository.GetList(ctx, listDto)
	if err != nil {
		return models.SearchResponse{}, err
	}

	response := models.SearchResponse{
		List: []ShippingList{},
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

func (c *shippingUsecase) GetAddress(ctx context.Context, clientId int64) ([]AddressList, error) {
	searchResponse, err := c.ShippingRepository.GetAddress(ctx, clientId)
	if err != nil {
		return []AddressList{}, err
	}

	response := searchResponse
	return response, err
}

func (c *shippingUsecase) GetDetail(ctx context.Context, shippingId int64) (ShippingDetail, error) {
	data, err := c.ShippingRepository.GetDetail(ctx, shippingId)
	if err != nil {
		return ShippingDetail{}, err
	}

	return data, nil
}

func (c *shippingUsecase) UpdateShipping(ctx context.Context, in ReqShippingGroupDto, shippingId int64, userID int64) (response bool, err error) {

	// Transaction demonstration
	err = c.RunTx(ctx, func(ctx context.Context) error {

		_, err := c.ShippingRepository.DeleteShippingList(ctx, shippingId)
		if err != nil {
			return err
		}

		_, err = c.ShippingRepository.CreateShippingGroup(ctx, shippingId, in)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add queue request to db", zap.Error(err))
			return err
		}

		dataResponse, err := c.UniqueCodeRepository.BurnUniqueCode(ctx, in.UniqueCode, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when burn unique code", zap.Error(err))
			return err
		}

		response = dataResponse

		return nil
	})

	return true, err
}

func (c *shippingUsecase) UpdateMarkAsShip(ctx context.Context, shippingId int64) (response bool, err error) {

	// Transaction demonstration
	err = c.RunTx(ctx, func(ctx context.Context) error {
		dataResponse, err := c.ShippingRepository.UpdateAsShip(ctx, shippingId)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when update mark as ship", zap.Error(err))
			return err
		}

		response = dataResponse

		return nil
	})

	return response, err
}
