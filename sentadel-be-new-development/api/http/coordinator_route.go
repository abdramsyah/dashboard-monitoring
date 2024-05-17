package http

import (
	"fmt"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/coordinator"
	"sentadel-backend/internal/models"
	"sentadel-backend/internal/user"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	CoordinatorRoute = "/coordinator"
)

type CoordinatorRoutes struct {
	config             Config
	coordinatorUsecase coordinator.CoordinatorUsecases
	userUseCase        user.UserUsecases
}

func NewCoordinatorRoutes(config Config, CoordinatorUsecases coordinator.CoordinatorUsecases, UserUseCase user.UserUsecases) *CoordinatorRoutes {
	return &CoordinatorRoutes{
		config:             config,
		coordinatorUsecase: CoordinatorUsecases,
		userUseCase:        UserUseCase,
	}
}

func (c *CoordinatorRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)

	//route.POST(CoordinatorRoute, c.createCoordinator)
	route.POST(CoordinatorRoute, c.createCoordinator)
	route.PUT(CoordinatorRoute, c.updateCoordinator)
	route.GET(CoordinatorRoute, c.findAllCoordinator)
	route.DELETE(CoordinatorRoute+"/:id", c.deleteCoordinator)

	//route.GET(CoordinatorRoute+"/performance", c.getCoordinatorPerformance)
	//route.PUT(CoordinatorRoute+"/mark-as-paid-by-coordinator", c.markAsPaid)
	//
	//route.GET(CoordinatorRoute+"/goods-history", c.getGoodsHistory)
}

func (c *CoordinatorRoutes) createCoordinator(ctx *gin.Context) {
	var CoordinatorUserRequest coordinator.CoordinatorUserDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.CoordinatorManagement)]; ok && !ro {
		if err := bindBody(&CoordinatorUserRequest, ctx); err != nil {
			fmt.Println(err.Error())
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		Coordinator, err := c.coordinatorUsecase.Create(contextWithReqInfo(ctx), CoordinatorUserRequest)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(Coordinator).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *CoordinatorRoutes) updateCoordinator(ctx *gin.Context) {
	var CoordinatorRequest coordinator.CoordinatorDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.CoordinatorManagement)]; ok && !ro {
		if err := bindBody(&CoordinatorRequest, ctx); err != nil {
			fmt.Println(err.Error())
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		Coordinator, err := c.coordinatorUsecase.Update(contextWithReqInfo(ctx), CoordinatorRequest)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(Coordinator).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *CoordinatorRoutes) deleteCoordinator(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)
	if ro, ok := reqInfo.Modules[string(roles_modules.CoordinatorManagement)]; ok && !ro {
		ID := ctx.Param("id")
		fmt.Println("deleteCoordinator - ID", ID)
		if ID == "" {
			errorResponse(errors.New(errors.BadRequestError),
				nil, c.config.DetailedError()).reply(ctx)
		}

		id, _ := strconv.ParseInt(ID, 10, 64)

		err := c.coordinatorUsecase.Delete(contextWithReqInfo(ctx), id)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse("coordinator deleted").reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *CoordinatorRoutes) findAllCoordinator(ctx *gin.Context) {
	var searchDto models.SearchRequest

	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.CoordinatorManagement)]; ok {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		if len(searchDto.Filter) > 0 {
			searchDto.Filter = strings.Split(searchDto.Filter[0], ",")
		}

		if len(searchDto.SortBy) > 0 {
			searchDto.SortBy = strings.Split(searchDto.SortBy[0], ",")
		}

		data, err := c.coordinatorUsecase.GetList(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

//func (c *CoordinatorRoutes) getCoordinatorPerformance(ctx *gin.Context) {
//	var searchDto models.SearchRequest
//
//	if err := ctx.BindQuery(&searchDto); err != nil {
//		errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
//		return
//	}
//
//	if len(searchDto.Filter) > 0 {
//		searchDto.Filter = strings.Split(searchDto.Filter[0], ",")
//	}
//
//	if len(searchDto.SortBy) > 0 {
//		searchDto.SortBy = strings.Split(searchDto.SortBy[0], ",")
//	}
//
//	data, err := c.coordinatorUsecase.GetCoordinatorPerformance(contextWithReqInfo(ctx), searchDto)
//	if err != nil {
//		errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
//		return
//	}
//
//	searchResponse(data.Meta, data.List).reply(ctx)
//	return
//}
//
//func (c *CoordinatorRoutes) markAsPaid(ctx *gin.Context) {
//	var idObj *coordinator_supplies.SuppliesRequestModel
//	reqInfo := getReqInfo(ctx)
//
//	if _, ok := reqInfo.Permissions[string(constants.COORDINATORMANAGEMENT_UPDATE)]; ok {
//		if err := bindBody(&idObj, ctx); err != nil {
//			fmt.Println(err.Error())
//			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
//			return
//		}
//		resData, err := c.coordinatorUsecase.MarkAsPaid(contextWithReqInfo(ctx), idObj)
//		if err != nil {
//			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
//			return
//		}
//
//		message := "Data " + strconv.FormatInt(resData.ID, 10) + " is paid"
//
//		okResponseWithoutData(message).reply(ctx)
//		return
//	}
//
//	return
//}

//func (c *CoordinatorRoutes) getGoodsHistory(ctx *gin.Context) {
//	var dto models.SearchRequest
//	reqInfo := getReqInfo(ctx)
//
//	if err := ctx.BindQuery(&dto); err != nil {
//		fmt.Println(err.Error())
//		errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
//		return
//	}
//	resData, err := c.coordinatorUsecase.GetGoodsHistory(contextWithReqInfo(ctx), dto, reqInfo.UserId)
//	if err != nil {
//		errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
//		return
//	}
//
//	okResponse(resData).reply(ctx)
//	return
//}
