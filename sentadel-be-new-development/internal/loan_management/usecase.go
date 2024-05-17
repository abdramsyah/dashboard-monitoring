package loan_management

import (
	"context"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/coordinator"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/partnership"

	"go.uber.org/zap"
)

type LoanManagementUsecases interface {
	AddNewLoan(ctx context.Context, dto ManageLoanRequestDto, userID int64) (res bool, err error)
	UpdateLoan(ctx context.Context, dto ManageLoanRequestDto, userID int64) (res bool, err error)
	GetLoanList(ctx context.Context, dto GetLoanListDto) (response *LoanListDataModel, err error)
	AddNewRepayment(ctx context.Context, dto AddNewRepaymentDto, userID int64) (res bool, err error)
}

type loanManagementUsecase struct {
	database.TxManager
	LoanManagementRepository
	coordinator.CoordinatorRepository
	partnership.PartnershipRepository
}

func NewLoanManagementUsecase(conn database.TxManager, loanManagementRepository LoanManagementRepository,
	coordinatorRepository coordinator.CoordinatorRepository, partnershipRepository partnership.PartnershipRepository) *loanManagementUsecase {
	return &loanManagementUsecase{
		conn,
		loanManagementRepository,
		coordinatorRepository,
		partnershipRepository,
	}
}

func (lmu loanManagementUsecase) AddNewLoan(ctx context.Context, dto ManageLoanRequestDto, userID int64) (res bool, err error) {
	model, err := dto.MapToModel()
	if err != nil {
		return false, err
	}

	err = lmu.RunTx(ctx, func(ctx context.Context) error {
		if model.ReferenceType == constants.LoanCoordinator {
			_, err = lmu.CoordinatorRepository.GetByID(ctx, model.ReferenceID)
			if err != nil {
				logger.ContextLogger(ctx).Error("Coordinator doesn't exist", zap.Error(err))
				return err
			}
		}
		if model.ReferenceType == constants.LoanPartner {
			_, err = lmu.PartnershipRepository.GetByID(ctx, model.ReferenceID)
			if err != nil {
				logger.ContextLogger(ctx).Error("Partner doesn't exist", zap.Error(err))
				return err
			}
		}

		isSuccess, err := lmu.LoanManagementRepository.AddNewLoan(ctx, model, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("Error when add new loan", zap.Error(err))
			return err
		}

		res = isSuccess
		return nil
	})

	return res, err
}

func (lmu loanManagementUsecase) UpdateLoan(ctx context.Context, dto ManageLoanRequestDto, userID int64) (res bool, err error) {
	model, err := dto.MapToUpdateModel()
	if err != nil {
		return false, err
	}

	err = lmu.RunTx(ctx, func(ctx context.Context) error {
		if model.ReferenceType == constants.LoanCoordinator {
			_, err = lmu.CoordinatorRepository.GetByID(ctx, model.ReferenceID)
			if err != nil {
				logger.ContextLogger(ctx).Error("Coordinator doesn't exist", zap.Error(err))
				return err
			}
		}
		if model.ReferenceType == constants.LoanPartner {
			_, err = lmu.PartnershipRepository.GetByID(ctx, model.ReferenceID)
			if err != nil {
				logger.ContextLogger(ctx).Error("Partner doesn't exist", zap.Error(err))
				return err
			}
		}

		isSuccess, err := lmu.LoanManagementRepository.UpdateLoan(ctx, model, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("Error when update loan", zap.Error(err))
			return err
		}

		res = isSuccess
		return nil
	})

	return res, err
}

func (lmu loanManagementUsecase) GetLoanList(ctx context.Context, dto GetLoanListDto) (response *LoanListDataModel, err error) {
	listResponse, err := lmu.LoanManagementRepository.GetLoanList(ctx, dto)
	if err != nil {
		return nil, err
	}

	response = &LoanListDataModel{
		Meta: Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		List: []LoanModel{},
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

func (lmu loanManagementUsecase) AddNewRepayment(ctx context.Context, dto AddNewRepaymentDto, userID int64) (res bool, err error) {
	model, invoiceID, err := dto.MapToRepaymentModel()
	if err != nil {
		return false, err
	}

	err = lmu.RunTx(ctx, func(ctx context.Context) error {
		isSuccess, err := lmu.LoanManagementRepository.AddNewRepayment(ctx, model, invoiceID, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("Error when add new repayment", zap.Error(err))
			return err
		}

		res = isSuccess
		return nil
	})

	return res, err
}
