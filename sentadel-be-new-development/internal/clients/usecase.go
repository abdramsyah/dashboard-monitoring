package clients

import (
	"context"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/grade_management"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/user"

	"go.uber.org/zap"
)

type ClientUsecases interface {
	Create(ctx context.Context, clientRequest ClientRequest) (ClientResponse, error)
	Update(ctx context.Context, clientRequest ClientRequest) (ClientResponse, error)
	Delete(ctx context.Context, id int64) error
	FindOne(ctx context.Context, id int64) (ClientResponse, error)
	GetList(ctx context.Context, clientListDto ClientListDto) (ClientListResponse, error)
	ManageAddress(ctx context.Context, dto AddressDto, userID int64) (response bool, err error)
}

type clientUsecase struct {
	database.TxManager
	ClientRepository
}

func NewClientUsecases(manager database.TxManager, clientRepository ClientRepository) *clientUsecase {
	return &clientUsecase{
		manager,
		clientRepository,
	}
}

func (c clientUsecase) Create(ctx context.Context, clientRequest ClientRequest) (clientResponse ClientResponse, err error) {
	model, err := clientRequest.MapToModel()
	if err != nil {
		return ClientResponse{}, err
	}

	// Transaction demonstration
	err = c.RunTx(ctx, func(ctx context.Context) error {
		clientModel, err := c.ClientRepository.Create(ctx, model)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add to db", zap.Error(err))
			return err
		}

		if len(clientRequest.Grades) > 0 {
			gradeModels := []grade_management.GradeManagementModel{}

			err = c.ClientRepository.CreateBulkClientGrade(ctx, gradeModels)
			if err != nil {
				logger.ContextLogger(ctx).Error("error when add grade_management to db", zap.Error(err))
				return err
			}

		}

		clientResponse = c.clientModelToClientResponse(clientModel)

		return nil
	})

	return clientResponse, err
}

func (c clientUsecase) Update(ctx context.Context, in ClientRequest) (clientResponseData ClientResponse, err error) {
	model, err := c.ClientRepository.GetByID(ctx, in.ID)
	if err != nil {
		return clientResponseData, err
	}

	err = model.Update(in.ClientName, in.Code, in.Status, in.Company)

	if err != nil {
		return clientResponseData, err
	}

	err = c.RunTx(ctx, func(ctx context.Context) error {
		clientModel, err := c.ClientRepository.Update(ctx, *model)

		if err != nil {
			logger.ContextLogger(ctx).Error("error when update client to db", zap.Error(err))
			return err
		}

		if len(in.Grades) > 0 {
			err = c.ClientRepository.DeleteClientGrade(ctx, clientModel.ID)
			if err != nil {
				logger.ContextLogger(ctx).Error("error when delete grade_management from db", zap.Error(err))
				return err
			}

			gradeModels := []grade_management.GradeManagementModel{}

			err = c.ClientRepository.CreateBulkClientGrade(ctx, gradeModels)
			if err != nil {
				logger.ContextLogger(ctx).Error("error when add grade_management to db", zap.Error(err))
				return err
			}

		}

		clientResponseData = c.clientModelToClientResponse(clientModel)

		return nil
	})

	return clientResponseData, err
}

func (c clientUsecase) Delete(ctx context.Context, id int64) error {
	model, err := c.ClientRepository.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if model == nil {
		logger.ContextLogger(ctx).Error("Client is not found")
		return errors.New(errors.BadRequestError)
	}

	err = c.RunTx(ctx, func(ctx context.Context) error {
		_, err = c.ClientRepository.Delete(ctx, id)

		if err != nil {
			logger.ContextLogger(ctx).Error("error when delete user", zap.Error(err))
			return err
		}

		return nil
	})

	return err
}

func (c clientUsecase) FindOne(ctx context.Context, id int64) (ClientResponse, error) {
	model, err := c.ClientRepository.GetByID(ctx, id)
	if err != nil {
		return ClientResponse{}, err
	}

	if model == nil {
		logger.ContextLogger(ctx).Error("Client is not found")
		return ClientResponse{}, errors.New(errors.BadRequestError)
	}

	return c.clientModelToClientResponse(model), nil
}

func (c clientUsecase) GetList(ctx context.Context, clientListDto ClientListDto) (ClientListResponse, error) {
	searchResponse, err := c.ClientRepository.GetList(ctx, clientListDto)
	if err != nil {
		return ClientListResponse{}, err
	}

	response := ClientListResponse{
		Clients: []ClientModel{},
		Meta: user.Meta{
			Page:  int(clientListDto.Page),
			Limit: int(clientListDto.Limit),
			Pages: 0,
		},
	}

	if len(searchResponse) < 1 || searchResponse == nil {
		return response, nil
	}

	total := float64(searchResponse[0].Total)
	limit := float64(clientListDto.Limit)

	response.Clients = searchResponse
	response.Meta.Pages = int(math.Ceil(total / limit))

	return response, err
}

func (c clientUsecase) clientModelToClientResponse(clientModel *ClientModel) ClientResponse {
	clientResponse := ClientResponse{
		ID:         clientModel.ID,
		ClientName: clientModel.ClientName,
		Code:       clientModel.Code,
		Status:     clientModel.Status,
		Company:    clientModel.Company,
		CreatedAt:  clientModel.CreatedAt,
		UpdatedAt:  clientModel.UpdatedAt,
	}

	return clientResponse
}

func (c clientUsecase) ManageAddress(ctx context.Context, dto AddressDto, userID int64) (response bool, err error) {
	model, err := dto.MapAddressDtoToModel()
	if err != nil {
		return false, err
	}

	err = c.RunTx(ctx, func(ctx context.Context) error {
		var isSuccess bool
		if model.ID == 0 {
			isSuccess, err = c.ClientRepository.CreateAddress(ctx, model, userID)
		} else {
			isSuccess, err = c.ClientRepository.UpdateAddress(ctx, model, userID)
		}

		if err != nil {
			logger.ContextLogger(ctx).Error("error when add to db", zap.Error(err))
			return err
		}

		response = isSuccess

		return nil
	})

	return response, err
}
