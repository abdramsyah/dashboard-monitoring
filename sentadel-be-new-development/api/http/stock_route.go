package http

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/operational"
	"sentadel-backend/internal/stock"

	"github.com/gin-gonic/gin"
)

const (
	StockRoute = "stock"
)

type StockRoutes struct {
	config             Config
	stockUsecase       stock.StockUsecases
	operationalUsecase operational.OperationalUsecases
}

func NewStockRoutes(config Config, usecases stock.StockUsecases, operationalUsecase operational.OperationalUsecases) *StockRoutes {
	return &StockRoutes{
		config:             config,
		stockUsecase:       usecases,
		operationalUsecase: operationalUsecase,
	}
}

func (str *StockRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix + StockRoute)
	route.GET("/list", str.getStockList)
	route.GET("/list/:serial_number", str.getStockDetailBySerialNumber)
	route.PUT("/list/grade-info", str.updateGradingQueue)
	route.GET("/summary", str.getStockSummary)
}

func (str *StockRoutes) getStockList(ctx *gin.Context) {
	var searchDto stock.GetStockListDto

	reqInfo := getReqInfo(ctx)

	_, isPaymentMgmt := reqInfo.Modules[string(roles_modules.GoodsTable)]
	if isPaymentMgmt {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, str.config.DetailedError()).reply(ctx)
			return
		}

		data, err := str.stockUsecase.GetStockList(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, str.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, str.config.DetailedError()).reply(ctx)
}

func (str *StockRoutes) getStockDetailBySerialNumber(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	_, isPaymentMgmt := reqInfo.Modules[string(roles_modules.GoodsTable)]
	if isPaymentMgmt {
		serialNumber := ctx.Param("serial_number")

		data, err := str.stockUsecase.GetStockDetailBySerialNumber(contextWithReqInfo(ctx), serialNumber)
		if err != nil {
			errorResponse(err, nil, str.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, str.config.DetailedError()).reply(ctx)
}

func (str *StockRoutes) updateGradingQueue(ctx *gin.Context) {
	var dto operational.GradingDataRequestDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.GoodsTable)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, str.config.DetailedError()).reply(ctx)
			return
		}

		GradeDictionary, err := str.operationalUsecase.Update(contextWithReqInfo(ctx), dto.Data, reqInfo.UserId, true)
		if err != nil {
			errorResponse(err, nil, str.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(GradeDictionary).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, str.config.DetailedError()).reply(ctx)
}

func (str *StockRoutes) getStockSummary(ctx *gin.Context) {
	var searchDto stock.GetStockListDto

	reqInfo := getReqInfo(ctx)

	_, isPaymentMgmt := reqInfo.Modules[string(roles_modules.GoodsTable)]
	if isPaymentMgmt {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, str.config.DetailedError()).reply(ctx)
			return
		}

		data, err := str.stockUsecase.GetStockSummary(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, str.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, str.config.DetailedError()).reply(ctx)
}
