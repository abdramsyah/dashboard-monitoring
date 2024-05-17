package http

import (
	"fmt"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/operational"
	"sentadel-backend/internal/sales"

	"github.com/gin-gonic/gin"
)

const (
	OperationalRoute = "/operational"
	OpGrading        = "/grading"
	OpWeigh          = "/weigh-info"
	OpGoodsInfo      = "/goods-info"
	OpGrouping       = "/grouping"
)

type OperationalRoutes struct {
	config      Config
	operational operational.OperationalUsecases
	sales       sales.SalesUsecases
}

func NewOperationalRoutes(config Config, operational operational.OperationalUsecases,
	sales sales.SalesUsecases) *OperationalRoutes {
	return &OperationalRoutes{
		config:      config,
		operational: operational,
		sales:       sales,
	}
}

func (opr *OperationalRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix + OperationalRoute)
	route.POST(OpGrading, opr.createGradingQueue)
	route.PUT(OpGrading, opr.updateGradingQueue)
	route.GET(OpGoodsInfo, opr.getGoodsInformation)
	route.GET(OpGoodsInfo+"/:param", opr.getGoodsDetail)
	route.POST(OpWeigh, opr.setWeight)
	route.POST(OpGrouping+"/sync", opr.getGoodsListForGrouping)
	route.GET(OpGrouping, opr.getGroupingList)
	route.POST(OpGrouping, opr.createGrouping)
	route.GET(OpGrouping+"/:key-param", opr.getGroupingDetail)
}

func (opr *OperationalRoutes) createGradingQueue(ctx *gin.Context) {
	var dto operational.GradingDataRequestDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Grading)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		GradeDictionary, err := opr.operational.Create(contextWithReqInfo(ctx), dto.Data, reqInfo.UserId, false)
		if err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(GradeDictionary).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, opr.config.DetailedError()).reply(ctx)
}

func (opr *OperationalRoutes) updateGradingQueue(ctx *gin.Context) {
	var dto operational.GradingDataRequestDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Grading)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		GradeDictionary, err := opr.operational.Update(contextWithReqInfo(ctx), dto.Data, reqInfo.UserId, false)
		if err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(GradeDictionary).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, opr.config.DetailedError()).reply(ctx)
}

func (opr *OperationalRoutes) getGoodsInformation(ctx *gin.Context) {
	var searchDto operational.GoodsInformationListDto

	reqInfo := getReqInfo(ctx)

	_, isWeigh := reqInfo.Modules[string(roles_modules.Weigh)]
	_, isGrading := reqInfo.Modules[string(roles_modules.Grading)]
	_, isGoodsValidation := reqInfo.Modules[string(roles_modules.PendingValidation)]
	if isWeigh || isGrading || isGoodsValidation {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}
		searchDto.Filter, _ = ctx.GetQueryMap("filter")
		searchDto.SortBy, _ = ctx.GetQueryMap("sortby")

		data, err := opr.operational.GetGoodsInformation(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, opr.config.DetailedError()).reply(ctx)
}

func (opr *OperationalRoutes) getGoodsDetail(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	_, isWeigh := reqInfo.Modules[string(roles_modules.Weigh)]
	_, isGrading := reqInfo.Modules[string(roles_modules.Grading)]
	if isWeigh || isGrading {
		param := ctx.Param("param")

		fmt.Println("getGoodsDetail - param", param)

		data, err := opr.operational.GetGoodsDetail(contextWithReqInfo(ctx), param)
		if err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, opr.config.DetailedError()).reply(ctx)
}

func (opr *OperationalRoutes) setWeight(ctx *gin.Context) {
	var dto operational.SetWeightDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Grading)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		_, err := opr.operational.SetWeight(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		okResponseWithoutData("Sukses menambahkan data berat").reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, opr.config.DetailedError()).reply(ctx)
}

func (opr *OperationalRoutes) getGoodsListForGrouping(ctx *gin.Context) {
	var paramsData operational.GoodsDataForGroupingParamsData
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Grouping)]; ok && !ro {
		if err := bindBody(&paramsData, ctx); err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		res, err := opr.operational.GetGoodsListForGrouping(contextWithReqInfo(ctx), paramsData.Data)
		if err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(res).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, opr.config.DetailedError()).reply(ctx)
}

func (opr *OperationalRoutes) getGroupingList(ctx *gin.Context) {
	var searchDto operational.GoodsInformationListDto

	reqInfo := getReqInfo(ctx)

	_, isGrouping := reqInfo.Modules[string(roles_modules.Grouping)]
	_, isGroupingMgmt := reqInfo.Modules[string(roles_modules.GroupingManagement)]
	if isGrouping || isGroupingMgmt {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		searchDto.Filter, _ = ctx.GetQueryMap("filter")
		searchDto.SortBy, _ = ctx.GetQueryMap("sortby")

		data, err := opr.operational.GetGroupingList(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, opr.config.DetailedError()).reply(ctx)
}

func (opr *OperationalRoutes) createGrouping(ctx *gin.Context) {
	var paramsData operational.GoodsDataForGroupingParamsData
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Grouping)]; ok && !ro {
		if err := bindBody(&paramsData, ctx); err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		res, err := opr.operational.CreateGrouping(contextWithReqInfo(ctx), paramsData.Data, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(res).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, opr.config.DetailedError()).reply(ctx)
}

func (opr *OperationalRoutes) getGroupingDetail(ctx *gin.Context) {
	var detailDto sales.GroupingDetailDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Grouping)]; ok && !ro {
		if err := ctx.BindQuery(&detailDto); err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}
		keyParam := ctx.Param("key-param")

		detailDto.Filter, _ = ctx.GetQueryMap("filter")
		detailDto.SortBy, _ = ctx.GetQueryMap("sortby")

		groupingDetail, err := opr.sales.GetGroupingDetail(contextWithReqInfo(ctx), detailDto, keyParam)
		if err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(groupingDetail).reply(ctx)
		return
	}
	errorResponse(errors.New(errors.UnauthorizedError), nil, opr.config.DetailedError()).reply(ctx)
}

func (opr *OperationalRoutes) createShipment(ctx *gin.Context) {
	var dto sales.CreateShipmentDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Shipment)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		GradeDictionary, err := opr.sales.CreateShipment(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, opr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(GradeDictionary).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, opr.config.DetailedError()).reply(ctx)
}
