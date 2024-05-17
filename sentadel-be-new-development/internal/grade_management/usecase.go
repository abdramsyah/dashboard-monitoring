package grade_management

import (
	"context"
	"fmt"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/user"

	"go.uber.org/zap"
)

type GradeManagementUsecases interface {
	Create(ctx context.Context, GradeDictionaryRequest GradeManagementCreateRequest) (GradeManagementCreateModel, error)
	Update(ctx context.Context, GradeDictionaryRequest GradeManagementCreateRequest) (GradeManagementResponse, error)
	Delete(ctx context.Context, id int64) error
	FindOne(ctx context.Context, id int64) (GradeManagementResponse, error)
	GetGroupList(ctx context.Context, GradeDictionaryListDto GradeDictionaryListDto) (GradeDictionaryListResponse, error)

	GetAllGrade(ctx context.Context, dto GradeDictionaryListDto) ([]GradeModel, error)
}

func NewGradeDictionaryUsecases(manager database.TxManager, GradeDictionaryRepository GradeDictionaryRepository) *gradeDictionaryUsecase {
	return &gradeDictionaryUsecase{
		manager,
		GradeDictionaryRepository,
	}
}

func (g gradeDictionaryUsecase) Create(ctx context.Context, gradeDictionaryRequestData GradeManagementCreateRequest) (gdResponse GradeManagementCreateModel, err error) {
	model, err := gradeDictionaryRequestData.MapToModel()
	fmt.Println("GradeCreate - case - model", model)
	if err != nil {
		return GradeManagementCreateModel{}, err
	}

	// Transaction demonstration
	err = g.RunTx(ctx, func(ctx context.Context) error {
		created, err := g.GradeDictionaryRepository.SearchDuplicate(ctx, model.Grades)
		if err != nil && err.Error() != "Data not found" {
			logger.ContextLogger(ctx).Error("error when add grade dictionary to db", zap.Error(err))
			return err
		}
		var validGrade []GradeModel
		for _, grade := range model.Grades {
			if _, ok := created[grade.Index]; ok {
				model.Created = append(model.Created, grade)
			} else {
				validGrade = append(validGrade, grade)
			}
		}

		if len(validGrade) != 0 {
			_, err = g.GradeDictionaryRepository.Create(ctx, validGrade)
			if err != nil {
				logger.ContextLogger(ctx).Error("error when add grade dictionary to db", zap.Error(err))
				return err
			}
		}

		gdResponse = model

		return nil
	})

	return gdResponse, err
}

func (g gradeDictionaryUsecase) Update(ctx context.Context, in GradeManagementCreateRequest) (GradeDictionaryResponseData GradeManagementResponse, err error) {
	model := GradeManagementModel{
		ID:       1,
		ClientID: *in.ClientID,
		Quota:    0,
		Price:    0,
		Grade:    "",
	}

	if err != nil {
		return GradeDictionaryResponseData, err
	}

	err = g.RunTx(ctx, func(ctx context.Context) error {
		clientModel, err := g.GradeDictionaryRepository.Update(ctx, model)

		if err != nil {
			logger.ContextLogger(ctx).Error("error when update client to db", zap.Error(err))
			return err
		}

		GradeDictionaryResponseData = g.clientModelToGradeDictionaryResponse(clientModel)

		return nil
	})

	return GradeDictionaryResponseData, err
}

func (g gradeDictionaryUsecase) Delete(ctx context.Context, id int64) error {
	model, err := g.GradeDictionaryRepository.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if model == nil {
		logger.ContextLogger(ctx).Error("Grade Dictionary is not found")
		return errors.New(errors.BadRequestError)
	}

	err = g.RunTx(ctx, func(ctx context.Context) error {
		_, err = g.GradeDictionaryRepository.Delete(ctx, id)

		if err != nil {
			logger.ContextLogger(ctx).Error("error when delete grade dictionary", zap.Error(err))
			return err
		}

		return nil
	})

	return err
}

func (g gradeDictionaryUsecase) FindOne(ctx context.Context, id int64) (GradeManagementResponse, error) {
	model, err := g.GradeDictionaryRepository.GetByID(ctx, id)
	if err != nil {
		return GradeManagementResponse{}, err
	}

	if model == nil {
		logger.ContextLogger(ctx).Error("Grade Dictionary is not found")
		return GradeManagementResponse{}, errors.New(errors.BadRequestError)
	}

	return g.clientModelToGradeDictionaryResponse(model), nil
}

func (g gradeDictionaryUsecase) GetGroupList(ctx context.Context, GradeDictionaryListDto GradeDictionaryListDto) (GradeDictionaryListResponse, error) {
	searchResponse, err := g.GradeDictionaryRepository.GetGroupList(ctx, GradeDictionaryListDto)
	if err != nil {
		return GradeDictionaryListResponse{}, err
	}

	response := GradeDictionaryListResponse{
		GradeDictionaries: []ClientGroupResponseModel{},
		Meta: user.Meta{
			Page:  int(GradeDictionaryListDto.Page),
			Limit: int(GradeDictionaryListDto.Limit),
			Pages: 0,
		},
	}

	if len(searchResponse) < 1 || searchResponse == nil {
		return response, nil
	}

	total := float64(searchResponse[0].Total)
	limit := float64(GradeDictionaryListDto.Limit)

	response.GradeDictionaries = searchResponse
	response.Meta.Pages = int(math.Ceil(total / limit))

	return response, err
}

func (g gradeDictionaryUsecase) GetAllGrade(ctx context.Context, dto GradeDictionaryListDto) ([]GradeModel, error) {
	res, err := g.GradeDictionaryRepository.GetAllGrade(ctx, dto)
	if err != nil {
		return nil, err
	}

	return res, err
}

func (g gradeDictionaryUsecase) clientModelToGradeDictionaryResponse(clientModel *GradeManagementModel) GradeManagementResponse {
	gdResponse := GradeManagementResponse{
		ID:        clientModel.ID,
		ClientID:  clientModel.ClientID,
		Grade:     clientModel.Grade,
		Quota:     clientModel.Quota,
		Price:     clientModel.Price,
		CreatedAt: clientModel.CreatedAt,
		UpdatedAt: clientModel.UpdatedAt,
	}

	return gdResponse
}

// func (g gradeDictionaryUsecase) clientModelToGradePriceResponse(clientModel *GradePriceModel) GradePriceResponse {
// 	gdResponse := GradePriceResponse{
// 		ID:    clientModel.ID,
// 		Price: clientModel.Price,
// 	}

// 	return gdResponse
// }

type gradeDictionaryUsecase struct {
	database.TxManager
	GradeDictionaryRepository
}
