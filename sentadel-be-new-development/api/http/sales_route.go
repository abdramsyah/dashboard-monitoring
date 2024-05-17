package http

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/clients"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/sales"

	"github.com/gin-gonic/gin"
)

const (
	SalesRoute     = "/sales"
	FinalGoods     = "/final-goods"
	Grouping       = "/grouping"
	RequestPayment = "/request-payment"
	// Shipment       = "/shipment"
)

type SalesRoutes struct {
	config Config
	sales  sales.SalesUsecases
	client clients.ClientUsecases
}

func NewSalesRoutes(config Config,
	sales sales.SalesUsecases,
	client clients.ClientUsecases,
) *SalesRoutes {
	return &SalesRoutes{
		config: config,
		sales:  sales,
		client: client,
	}
}

func (sar *SalesRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix + SalesRoute)
	route.GET(FinalGoods+"/client-dropdown", sar.getClientDropdown)
	route.GET(Grouping, sar.getGroupingList)
	route.PUT(Grouping, sar.updateGroupingList)
	route.GET(Grouping+"/:key-param", sar.getGroupingDetail)
	// route.POST(Shipment+Grouping, sar.createShipmentGrouping)
}

func (sar *SalesRoutes) updateGroupingList(ctx *gin.Context) {
	var dto sales.UpdateGroupingParamsDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.GroupingManagement)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, sar.config.DetailedError()).reply(ctx)
			return
		}

		GradeDictionary, err := sar.sales.UpdateGroupingList(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, sar.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(GradeDictionary).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, sar.config.DetailedError()).reply(ctx)
}

func (sar *SalesRoutes) getClientDropdown(ctx *gin.Context) {
	var clientListDto clients.ClientListDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Grouping)]; ok && !ro {
		if err := ctx.BindQuery(&clientListDto); err != nil {
			errorResponse(err, nil, sar.config.DetailedError()).reply(ctx)
			return
		}

		ClientDropdown, err := sar.client.GetList(contextWithReqInfo(ctx), clientListDto)
		if err != nil {
			errorResponse(err, nil, sar.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(ClientDropdown).reply(ctx)
		return
	}
	errorResponse(errors.New(errors.UnauthorizedError), nil, sar.config.DetailedError()).reply(ctx)
}

func (sar *SalesRoutes) getGroupingList(ctx *gin.Context) {
	var searchDto sales.GroupingListDto
	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.GroupingManagement)]; ok {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, sar.config.DetailedError()).reply(ctx)
			return
		}

		searchDto.Filter, _ = ctx.GetQueryMap("filter")
		searchDto.SortBy, _ = ctx.GetQueryMap("sortby")

		groupingList, err := sar.sales.GetGroupingList(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, sar.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(groupingList.Meta, groupingList.List).reply(ctx)
		return
	}
	errorResponse(errors.New(errors.UnauthorizedError), nil, sar.config.DetailedError()).reply(ctx)
}

func (sar *SalesRoutes) getGroupingDetail(ctx *gin.Context) {
	var detailDto sales.GroupingDetailDto
	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.GroupingManagement)]; ok {
		if err := ctx.BindQuery(&detailDto); err != nil {
			errorResponse(err, nil, sar.config.DetailedError()).reply(ctx)
			return
		}
		keyParam := ctx.Param("key-param")

		detailDto.Filter, _ = ctx.GetQueryMap("filter")
		detailDto.SortBy, _ = ctx.GetQueryMap("sortby")

		groupingDetail, err := sar.sales.GetGroupingDetail(contextWithReqInfo(ctx), detailDto, keyParam)
		if err != nil {
			errorResponse(err, nil, sar.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(groupingDetail).reply(ctx)
		return
	}
	errorResponse(errors.New(errors.UnauthorizedError), nil, sar.config.DetailedError()).reply(ctx)
}
