package http

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/invoice"

	"github.com/gin-gonic/gin"
)

const (
	Invoice = "invoice"
)

type InvoiceRoutes struct {
	config         Config
	invoiceUsecase invoice.InvoiceUsecases
}

func NewInvoiceRoutes(config Config,
	invoice invoice.InvoiceUsecases,
) *InvoiceRoutes {
	return &InvoiceRoutes{
		config,
		invoice,
	}
}

func (ivr *InvoiceRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix + Invoice)

	route.GET("/invoice-id/:invoice-id", ivr.getInvoiceDetailByID)
	route.GET("/invoice-number/:invoice-number", ivr.getInvoiceDetailByInvoiceNumber)
	route.GET("", ivr.getInvoiceList)
	route.POST("", ivr.manageInvoiceStatus)
}

func (ivr *InvoiceRoutes) manageInvoiceStatus(ctx *gin.Context) {
	var dto invoice.ManageInvoiceStatusDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.PaymentManagement)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, ivr.config.DetailedError()).reply(ctx)
			return
		}

		GradeDictionary, err := ivr.invoiceUsecase.ManageInvoiceStatus(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, ivr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(GradeDictionary).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, ivr.config.DetailedError()).reply(ctx)
}

func (ivr *InvoiceRoutes) getInvoiceDetailByID(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	_, isPaymentMgmt := reqInfo.Modules[string(roles_modules.PaymentManagement)]
	_, isInvApproval := reqInfo.Modules[string(roles_modules.InvoiceApproval)]
	_, isCoordinatorInv := reqInfo.Modules[string(roles_modules.CoordinatorInvoice)]
	if isPaymentMgmt || isInvApproval || isCoordinatorInv {
		invoiceIdString := ctx.Param("invoice-id")

		data, err := ivr.invoiceUsecase.GetInvoiceDetail(contextWithReqInfo(ctx), invoiceIdString, false)
		if err != nil {
			errorResponse(err, nil, ivr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, ivr.config.DetailedError()).reply(ctx)
}

func (ivr *InvoiceRoutes) getInvoiceDetailByInvoiceNumber(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	_, isPaymentMgmt := reqInfo.Modules[string(roles_modules.PaymentManagement)]
	_, isInvApproval := reqInfo.Modules[string(roles_modules.InvoiceApproval)]
	_, isCoordinatorInv := reqInfo.Modules[string(roles_modules.CoordinatorInvoice)]
	if isPaymentMgmt || isInvApproval || isCoordinatorInv {
		invoiceIdString := ctx.Param("invoice-number")

		data, err := ivr.invoiceUsecase.GetInvoiceDetail(contextWithReqInfo(ctx), invoiceIdString, true)
		if err != nil {
			errorResponse(err, nil, ivr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, ivr.config.DetailedError()).reply(ctx)
}

func (ivr *InvoiceRoutes) getInvoiceList(ctx *gin.Context) {
	var searchDto invoice.ParamsDto

	reqInfo := getReqInfo(ctx)

	_, isPaymentMgmt := reqInfo.Modules[string(roles_modules.PaymentManagement)]
	_, isInvApproval := reqInfo.Modules[string(roles_modules.InvoiceApproval)]
	_, isCoordinatorInv := reqInfo.Modules[string(roles_modules.CoordinatorInvoice)]
	if isPaymentMgmt || isInvApproval || isCoordinatorInv {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, ivr.config.DetailedError()).reply(ctx)
			return
		}
		searchDto.Filter, _ = ctx.GetQueryMap("filter")
		searchDto.SortBy, _ = ctx.GetQueryMap("sortby")

		data, err := ivr.invoiceUsecase.GetInvoiceList(contextWithReqInfo(ctx), searchDto, &reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, ivr.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, ivr.config.DetailedError()).reply(ctx)
}
