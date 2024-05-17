package http

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/clients"
	"sentadel-backend/internal/constants/roles_modules"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	ClientManagementRoute = "/client-management"
	AddressRoute          = "/address"
)

type ClientRoutes struct {
	config         Config
	clientUsecases clients.ClientUsecases
}

func NewClientRoutes(config Config, clientUsecases clients.ClientUsecases) *ClientRoutes {
	return &ClientRoutes{
		config:         config,
		clientUsecases: clientUsecases,
	}
}

func (c *ClientRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix + ClientManagementRoute)

	route.POST("", c.createClient)
	route.PUT("", c.updateClient)
	route.GET("/:id", c.findOneClient)
	route.DELETE("/:id", c.deleteClient)
	route.GET("", c.findAllClient)

	route.POST(AddressRoute, c.createAddress)
}

func (c *ClientRoutes) createClient(ctx *gin.Context) {
	var clientRequest clients.ClientRequest
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.ClientManagement)]; ok && !ro {
		if err := bindBody(&clientRequest, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		client, err := c.clientUsecases.Create(contextWithReqInfo(ctx), clientRequest)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(client).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *ClientRoutes) updateClient(ctx *gin.Context) {
	var clientRequest clients.ClientRequest
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.ClientManagement)]; ok && !ro {
		if err := bindBody(&clientRequest, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		client, err := c.clientUsecases.Update(contextWithReqInfo(ctx), clientRequest)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(client).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *ClientRoutes) deleteClient(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.ClientManagement)]; ok && !ro {
		if ID, err := strconv.Atoi(ctx.Param("id")); err == nil {
			err := c.clientUsecases.Delete(contextWithReqInfo(ctx), int64(ID))
			if err != nil {
				errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
				return
			}

			okResponse(err).reply(ctx)
			return
		}

		errorResponse(errors.New(errors.BadRequestError), nil, c.config.DetailedError()).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *ClientRoutes) findOneClient(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.ClientManagement)]; ok {
		if ID, err := strconv.Atoi(ctx.Param("id")); err == nil {
			response, err := c.clientUsecases.FindOne(contextWithReqInfo(ctx), int64(ID))
			if err != nil {
				errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
				return
			}

			okResponse(response).reply(ctx)
			return
		}

		errorResponse(errors.New(errors.BadRequestError), nil, c.config.DetailedError()).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *ClientRoutes) findAllClient(ctx *gin.Context) {
	var searchDto clients.ClientListDto
	reqInfo := getReqInfo(ctx)

	_, clientMgmt := reqInfo.Modules[string(roles_modules.ClientManagement)]
	_, barcodeSS := reqInfo.Modules[string(roles_modules.BarcodeSellingSystem)]
	_, shipment := reqInfo.Modules[string(roles_modules.Shipment)]
	if clientMgmt || barcodeSS || shipment {
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

		data, err := c.clientUsecases.GetList(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.Clients).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *ClientRoutes) createAddress(ctx *gin.Context) {
	var dto clients.AddressDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.ClientManagement)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		isSuccess, err := c.clientUsecases.ManageAddress(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(isSuccess).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}
