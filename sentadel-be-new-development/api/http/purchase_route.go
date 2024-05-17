package http

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/purchase"

	"github.com/gin-gonic/gin"
)

const (
	PurchaseRoute     = "purchase"
	PaymentManagement = "/payment-management"
	PendingValidation = "/pending-validation"
)

type PurchaseRoutes struct {
	config          Config
	purchaseUseCase purchase.PurchaseUsecases
}

func NewPurchaseRoutes(config Config, purchaseUsecase purchase.PurchaseUsecases) *PurchaseRoutes {
	return &PurchaseRoutes{
		config:          config,
		purchaseUseCase: purchaseUsecase,
	}
}

func (pcr *PurchaseRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix + PurchaseRoute)
	route.GET(PaymentManagement, pcr.getDeliveryWithStatusAccum)
	route.GET(PaymentManagement+"/:delivery-number", pcr.getDeliveryDetail)
	route.POST(PaymentManagement, pcr.validateData)
	route.GET(PendingValidation, pcr.getPendingValidation)
}

func (pcr *PurchaseRoutes) getDeliveryWithStatusAccum(ctx *gin.Context) {
	var searchDto purchase.ParamsDto

	reqInfo := getReqInfo(ctx)

	_, isPaymentMgmt := reqInfo.Modules[string(roles_modules.PaymentManagement)]
	if isPaymentMgmt {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, pcr.config.DetailedError()).reply(ctx)
			return
		}
		searchDto.Filter, _ = ctx.GetQueryMap("filter")
		searchDto.SortBy, _ = ctx.GetQueryMap("sortby")

		data, err := pcr.purchaseUseCase.GetDeliveryWithStatusAccum(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, pcr.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, pcr.config.DetailedError()).reply(ctx)
}

func (pcr *PurchaseRoutes) getDeliveryDetail(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	_, isPaymentMgmt := reqInfo.Modules[string(roles_modules.PaymentManagement)]
	if isPaymentMgmt {
		deliveryNumber := ctx.Param("delivery-number")

		data, err := pcr.purchaseUseCase.GetDeliveryDetail(contextWithReqInfo(ctx), deliveryNumber)
		if err != nil {
			errorResponse(err, nil, pcr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, pcr.config.DetailedError()).reply(ctx)
}

func (pcr *PurchaseRoutes) validateData(ctx *gin.Context) {
	var dto purchase.ValidatePurchaseDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.PaymentManagement)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, pcr.config.DetailedError()).reply(ctx)
			return
		}

		GradeDictionary, err := pcr.purchaseUseCase.ValidateData(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, pcr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(GradeDictionary).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, pcr.config.DetailedError()).reply(ctx)
}

func (pcr *PurchaseRoutes) getPendingValidation(ctx *gin.Context) {
	var searchDto purchase.ParamsDto

	reqInfo := getReqInfo(ctx)

	_, isPaymentMgmt := reqInfo.Modules[string(roles_modules.PendingValidation)]
	if isPaymentMgmt {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, pcr.config.DetailedError()).reply(ctx)
			return
		}
		searchDto.Filter, _ = ctx.GetQueryMap("filter")
		searchDto.SortBy, _ = ctx.GetQueryMap("sortby")

		data, err := pcr.purchaseUseCase.GetPendingValidation(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, pcr.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, pcr.config.DetailedError()).reply(ctx)
}
