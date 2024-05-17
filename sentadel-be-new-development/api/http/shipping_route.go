package http

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/models"
	"sentadel-backend/internal/shipping"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	Shipping = "/bucket-shipping"
)

type ShippingRoutes struct {
	config Config
	//grouping grouping.GroupingUsecases
	shipping shipping.ShippingUsecases
}

func NewShippingRoutes(config Config,
	//groupingUsecase grouping.GroupingUsecases,
	shippingUsecase shipping.ShippingUsecases,
) *ShippingRoutes {
	return &ShippingRoutes{
		config: config,
		//grouping: groupingUsecase,
		shipping: shippingUsecase,
	}
}

func (slr *ShippingRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)
	//Shipping
	route.POST(Shipping+"/:client_id", slr.createShipping)
	route.GET(Shipping, slr.getListShipping)
	//route.GET(Shipping+"/:id", slr.GetDetailShipping)
	route.PUT(Shipping+"/:shipping_id", slr.UpdateShipping)
	route.PUT(Shipping+"/mark-as-ship/:shipping_id", slr.markAsShip)
	//route.GET(Shipping+"/grouping", slr.getListGrouping)
	route.GET(Shipping+"/address/:client_id", slr.getListAddress)
}

func (slr *ShippingRoutes) createShipping(ctx *gin.Context) {
	var request shipping.ReqShippingGroupDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Shipment)]; ok && !ro {
		ID, err := strconv.Atoi(ctx.Param("client_id"))
		if err != nil {
			errorResponse(errors.New(errors.BadRequestError), nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		if err := bindBody(&request, ctx); err != nil {
			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		resData, err := slr.shipping.CreateShipping(contextWithReqInfo(ctx), request, int64(ID))
		if err != nil {
			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(resData).reply(ctx)
		return
	}
	errorResponse(errors.New(errors.UnauthorizedError), nil, slr.config.DetailedError()).reply(ctx)
}

func (slr *ShippingRoutes) getListShipping(ctx *gin.Context) {
	var request models.SearchRequest

	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.Shipment)]; ok {
		if err := ctx.BindQuery(&request); err != nil {
			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		if len(request.Filter) > 0 {
			request.Filter = strings.Split(request.Filter[0], ",")
		}

		if len(request.SortBy) > 0 {
			request.SortBy = strings.Split(request.SortBy[0], ",")
		}

		data, err := slr.shipping.GetList(contextWithReqInfo(ctx), request)
		if err != nil {
			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, slr.config.DetailedError()).reply(ctx)

}

func (slr *ShippingRoutes) getListAddress(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	_, isShipment := reqInfo.Modules[string(roles_modules.Shipment)]
	_, isClientManagement := reqInfo.Modules[string(roles_modules.ClientManagement)]
	if isShipment || isClientManagement {
		ID, err := strconv.Atoi(ctx.Param("client_id"))
		if err != nil {
			errorResponse(errors.New(errors.BadRequestError), nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		resData, err := slr.shipping.GetAddress(contextWithReqInfo(ctx), int64(ID))
		if err != nil {
			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(resData).reply(ctx)
		return
	}
	errorResponse(errors.New(errors.UnauthorizedError), nil, slr.config.DetailedError()).reply(ctx)
}

//func (slr *ShippingRoutes) getListGrouping(ctx *gin.Context) {
//	var request models.SearchRequest
//
//	reqInfo := getReqInfo(ctx)
//
//	_, asc := reqInfo.Roles[string(constants.ASC)]
//	_, coordinator := reqInfo.Roles[string(constants.Coordinator)]
//	if asc || coordinator {
//		if err := ctx.BindQuery(&request); err != nil {
//			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
//			return
//		}
//
//		if len(request.Filter) > 0 {
//			request.Filter = strings.Split(request.Filter[0], ",")
//		}
//
//		if len(request.SortBy) > 0 {
//			request.SortBy = strings.Split(request.SortBy[0], ",")
//		}
//
//		data, err := slr.grouping.GetQueueList(contextWithReqInfo(ctx), request, "SHIPPING")
//		if err != nil {
//			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
//			return
//		}
//
//		searchResponse(data.Meta, data.List).reply(ctx)
//		return
//	}
//
//	errorResponse(errors.New(errors.UnauthorizedError), nil, slr.config.DetailedError()).reply(ctx)
//}
//
//func (slr *ShippingRoutes) GetDetailShipping(ctx *gin.Context) {
//	reqInfo := getReqInfo(ctx)
//
//	if _, ok := reqInfo.Roles[string(constants.ASC)]; ok {
//		ID, err := strconv.Atoi(ctx.Param("id"))
//		if err != nil {
//			errorResponse(errors.New(errors.BadRequestError), nil, slr.config.DetailedError()).reply(ctx)
//			return
//		}
//		resData, err := slr.shipping.GetDetail(contextWithReqInfo(ctx), int64(ID))
//		if err != nil {
//			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
//			return
//		}
//		detailData, err := slr.grouping.GetDetailShipping(contextWithReqInfo(ctx), int64(ID))
//		if err != nil {
//			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
//			return
//		}
//		resData.Detail = detailData
//
//		okResponse(resData).reply(ctx)
//		return
//	}
//	errorResponse(errors.New(errors.UnauthorizedError), nil, slr.config.DetailedError()).reply(ctx)
//
//}

func (slr *ShippingRoutes) UpdateShipping(ctx *gin.Context) {
	var request shipping.ReqShippingGroupDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Shipment)]; ok && !ro {
		ID, err := strconv.Atoi(ctx.Param("shipping_id"))
		if err != nil {
			errorResponse(errors.New(errors.BadRequestError), nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		if err := bindBody(&request, ctx); err != nil {
			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		resData, err := slr.shipping.UpdateShipping(contextWithReqInfo(ctx), request, int64(ID), reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(resData).reply(ctx)
		return
	}
	errorResponse(errors.New(errors.UnauthorizedError), nil, slr.config.DetailedError()).reply(ctx)
}

func (slr *ShippingRoutes) markAsShip(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.Shipment)]; ok && !ro {
		ID, err := strconv.Atoi(ctx.Param("shipping_id"))
		if err != nil {
			errorResponse(errors.New(errors.BadRequestError), nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		Coordinator, err := slr.shipping.UpdateMarkAsShip(contextWithReqInfo(ctx), int64(ID))
		if err != nil {
			errorResponse(err, nil, slr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(Coordinator).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, slr.config.DetailedError()).reply(ctx)

}
