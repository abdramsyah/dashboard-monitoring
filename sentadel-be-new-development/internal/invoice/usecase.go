package invoice

import (
	"context"
	"go.uber.org/zap"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/purchase"
	"sentadel-backend/internal/user"
)

type InvoiceUsecases interface {
	ManageInvoiceStatus(ctx context.Context, dto ManageInvoiceStatusDto, userID int64) (res bool, err error)
	GetInvoiceDetail(ctx context.Context, invoiceParam string, isInvoiceNumber bool) (response *purchase.InvoiceDetailModel, err error)
	GetInvoiceList(ctx context.Context, dto ParamsDto, userID *int64) (response *InvoiceListDataModel, err error)
}

type invoiceUsecase struct {
	database.TxManager
	InvoiceRepository
}

func NewInvoiceUsecase(manager database.TxManager, invoiceRepository InvoiceRepository) *invoiceUsecase {
	return &invoiceUsecase{
		manager,
		invoiceRepository,
	}
}

func (ivu invoiceUsecase) ManageInvoiceStatus(ctx context.Context, dto ManageInvoiceStatusDto, userID int64) (res bool, err error) {
	model, err := dto.MapToManageInvoiceStatusModel()
	if err != nil {
		logger.ContextLogger(ctx).Error("Error when validate payload", zap.Error(err))
		return false, err
	}

	err = ivu.RunTx(ctx, func(ctx context.Context) error {
		isSuccess, err := ivu.InvoiceRepository.ManageInvoiceStatus(ctx, model, userID)
		if err != nil {
			logger.ContextLogger(ctx).Error("Error when manage purchase data", zap.Error(err))
			return err
		}

		res = isSuccess

		return nil
	})

	return res, err
}

func (ivu invoiceUsecase) GetInvoiceDetail(ctx context.Context, invoiceParam string, isInvoiceNumber bool) (response *purchase.InvoiceDetailModel, err error) {
	if len(invoiceParam) == 0 {
		logger.ContextLogger(ctx).Error("Params Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Invoice ID / Number Not Right")
	}

	return ivu.InvoiceRepository.GetInvoiceDetail(ctx, invoiceParam, isInvoiceNumber)
}

func (ivu invoiceUsecase) GetInvoiceList(ctx context.Context, dto ParamsDto, userID *int64) (response *InvoiceListDataModel, err error) {
	listResponse, err := ivu.InvoiceRepository.GetInvoiceList(ctx, dto, userID)
	if err != nil {
		return nil, err
	}

	response = &InvoiceListDataModel{
		Meta: user.Meta{
			Page:  int(dto.Page),
			Limit: int(dto.Limit),
			Pages: 0,
		},
		List: []purchase.InvoiceDetailModel{},
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
