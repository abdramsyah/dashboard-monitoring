package http

import (
	"fmt"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/constants/roles_modules"
	queuerequest "sentadel-backend/internal/queue_request"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	QueueRequestRoute = "/queue-request"
)

type QueueRequestRoutes struct {
	config              Config
	queueRequestUsecase queuerequest.QueueRequestUsecases
}

func NewQueueRequestRoutes(config Config, QueueRequestUsecases queuerequest.QueueRequestUsecases) *QueueRequestRoutes {
	return &QueueRequestRoutes{
		config:              config,
		queueRequestUsecase: QueueRequestUsecases,
	}
}

func (c *QueueRequestRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)
	route.POST(QueueRequestRoute, c.createQueueRequest)
	route.PUT(QueueRequestRoute+"/approve", c.approveStatusQueue)
	route.PUT(QueueRequestRoute+"/reject", c.rejectStatusQueue)
	route.GET(QueueRequestRoute, c.getQueueList)
	route.GET(QueueRequestRoute+"/group", c.getQueueGroup)
	route.GET(QueueRequestRoute+"/group-detail", c.getQueueGroupDetail)
	route.GET(QueueRequestRoute+"/bucket", c.getBucketListByQueueIds)
	route.POST(QueueRequestRoute+"/pour-out", c.pourOutBucket)
	route.GET(QueueRequestRoute+"/bucket/:barcode", c.getBarcodeDetail)
}

func (c *QueueRequestRoutes) createQueueRequest(ctx *gin.Context) {
	var dto queuerequest.QueueRequestDataDto
	reqInfo := getReqInfo(ctx)

	readQM, isQueueManagement := reqInfo.Modules[string(roles_modules.QueueManagement)]
	readQR, isQueueRequest := reqInfo.Modules[string(roles_modules.QueueRequest)]
	if (!readQM && isQueueManagement) || (!readQR && isQueueRequest) {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		fmt.Println("createQueueRequest - dto", dto)

		isNotMember := false
		if dto.IsNotMember != nil {
			isNotMember = *dto.IsNotMember
		}

		Coordinator, err := c.queueRequestUsecase.CreateQueue(contextWithReqInfo(ctx),
			dto.Queues, reqInfo.UserId, isNotMember && (!readQM && isQueueManagement),
			dto.CoordinatorID, dto.CoordinatorUserData)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(Coordinator).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *QueueRequestRoutes) approveStatusQueue(ctx *gin.Context) {
	var dto queuerequest.UpdateStatusQueueDto
	reqInfo := getReqInfo(ctx)

	readQM, isQueueManagement := reqInfo.Modules[string(roles_modules.QueueManagement)]
	readQH, isQueueHistory := reqInfo.Modules[string(roles_modules.QueueHistory)]
	if (!readQM && isQueueManagement) || (!readQH && isQueueHistory) {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		Coordinator, err := c.queueRequestUsecase.UpdateStatusQueue(
			contextWithReqInfo(ctx), dto, constants.Approved, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(Coordinator).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *QueueRequestRoutes) rejectStatusQueue(ctx *gin.Context) {
	var dto queuerequest.UpdateStatusQueueDto
	reqInfo := getReqInfo(ctx)

	readQM, isQueueManagement := reqInfo.Modules[string(roles_modules.QueueManagement)]
	readQH, isQueueHistory := reqInfo.Modules[string(roles_modules.QueueHistory)]
	if (!readQM && isQueueManagement) || (!readQH && isQueueHistory) {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		Coordinator, err := c.queueRequestUsecase.UpdateStatusQueue(
			contextWithReqInfo(ctx), dto, constants.Rejected, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(Coordinator).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *QueueRequestRoutes) getQueueList(ctx *gin.Context) {
	var searchDto queuerequest.QueueRequestListDto

	reqInfo := getReqInfo(ctx)

	_, isQueueManagement := reqInfo.Modules[string(roles_modules.QueueManagement)]
	_, isQueueHistory := reqInfo.Modules[string(roles_modules.QueueHistory)]
	_, isQueueRequest := reqInfo.Modules[string(roles_modules.QueueRequest)]
	if isQueueManagement || isQueueHistory || isQueueRequest {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		//if len(searchDto.Filter) > 0 {
		//	searchDto.Filter = strings.Split(searchDto.Filter[0], ",")
		//}

		if len(searchDto.SortBy) > 0 {
			searchDto.SortBy = strings.Split(searchDto.SortBy[0], ",")
		}

		if searchDto.Mode == "ASC" {
			searchDto.UserID = -99
		} else {
			searchDto.UserID = reqInfo.UserId
		}

		data, err := c.queueRequestUsecase.GetQueueList(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *QueueRequestRoutes) getQueueGroup(ctx *gin.Context) {
	var searchDto queuerequest.QueueRequestListDto

	reqInfo := getReqInfo(ctx)

	_, isQueueManagement := reqInfo.Modules[string(roles_modules.QueueManagement)]
	_, isQueueHistory := reqInfo.Modules[string(roles_modules.QueueHistory)]
	_, isQueueRequest := reqInfo.Modules[string(roles_modules.QueueRequest)]

	if isQueueManagement || isQueueHistory || isQueueRequest {
		if err := ctx.ShouldBindQuery(&searchDto); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}
		searchDto.Filter, _ = ctx.GetQueryMap("filter")

		fmt.Println("getQueueGroup - searchDto", searchDto)

		//if len(searchDto.Filter) > 0 {
		//	searchDto.Filter = strings.Split(searchDto.Filter[0], ",")
		//}

		if len(searchDto.SortBy) > 0 {
			searchDto.SortBy = strings.Split(searchDto.SortBy[0], ",")
		}

		var userID *int64
		if isQueueRequest {
			userID = &reqInfo.UserId
		}

		data, err := c.queueRequestUsecase.GetQueueGroup(contextWithReqInfo(ctx), searchDto, userID)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *QueueRequestRoutes) getBucketListByQueueIds(ctx *gin.Context) {
	var queueIdsDto queuerequest.QueueIdsDto

	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.PourOut)]; ok {
		if err := ctx.BindQuery(&queueIdsDto); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		data, err := c.queueRequestUsecase.GetBucketListByQueueIds(contextWithReqInfo(ctx), queueIdsDto.QueueIds)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *QueueRequestRoutes) pourOutBucket(ctx *gin.Context) {
	var request queuerequest.CreateGoodsReqModel
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.PourOut)]; ok && !ro {
		if err := bindBody(&request, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		buckets, err := c.queueRequestUsecase.PourOutBucket(contextWithReqInfo(ctx), request, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(buckets).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)

}

func (c *QueueRequestRoutes) getQueueGroupDetail(ctx *gin.Context) {
	var dto queuerequest.QueueGroupDetailDto

	reqInfo := getReqInfo(ctx)
	_, isQueueRequest := reqInfo.Modules[string(roles_modules.QueueRequest)]

	if isQueueRequest {
		if err := ctx.BindQuery(&dto); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		if len(dto.DeliveryNumber) == 0 {
			var err error
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		fmt.Println("getQueueGroupDetail - dto", dto)

		data, err := c.queueRequestUsecase.GetQueueGroupDetail(contextWithReqInfo(ctx), dto)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *QueueRequestRoutes) getBarcodeDetail(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.PourOut)]; ok {
		barcode := ctx.Param("barcode")

		data, err := c.queueRequestUsecase.GetBarcodeDetail(contextWithReqInfo(ctx), barcode)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}
