package http

import (
	"fmt"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/partnership"

	"github.com/gin-gonic/gin"
)

const (
	PartnershipRoute = "/partnership"
)

type PartnershipRoutes struct {
	config             Config
	partnershipUseCase partnership.PartnershipUsecases
}

func NewPartnershipRoutes(config Config, partnershipUseCase partnership.PartnershipUsecases) *PartnershipRoutes {
	return &PartnershipRoutes{
		config:             config,
		partnershipUseCase: partnershipUseCase,
	}
}

func (psr *PartnershipRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)
	route.GET(PartnershipRoute+"/grouped", psr.getGroupedPartners)
	route.GET(PartnershipRoute, psr.getPartners)
	route.POST(PartnershipRoute, psr.addNewPartner)
	route.PUT(PartnershipRoute, psr.updatePartner)
}

func (psr *PartnershipRoutes) addNewPartner(ctx *gin.Context) {
	var dto partnership.ManagePartnerRequestDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.PartnershipManagement)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, psr.config.DetailedError()).reply(ctx)
			return
		}

		_, err := psr.partnershipUseCase.AddNewPartner(contextWithReqInfo(ctx), dto)
		if err != nil {
			errorResponse(err, nil, psr.config.DetailedError()).reply(ctx)
			return
		}

		okResponseWithoutData("Add new partner success").reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, psr.config.DetailedError()).reply(ctx)
}

func (psr *PartnershipRoutes) updatePartner(ctx *gin.Context) {
	var dto partnership.ManagePartnerRequestDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.PartnershipManagement)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, psr.config.DetailedError()).reply(ctx)
			return
		}

		fmt.Println("updatePartner - dto", dto)

		_, err := psr.partnershipUseCase.UpdatePartner(contextWithReqInfo(ctx), dto)
		if err != nil {
			errorResponse(err, nil, psr.config.DetailedError()).reply(ctx)
			return
		}

		okResponseWithoutData("Update partner success").reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, psr.config.DetailedError()).reply(ctx)
}

func (psr *PartnershipRoutes) getGroupedPartners(ctx *gin.Context) {
	var dto partnership.GetPartnerListDto
	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.PartnershipManagement)]; ok {
		if err := ctx.BindQuery(&dto); err != nil {
			errorResponse(err, nil, psr.config.DetailedError()).reply(ctx)
			return
		}
		dto.Filter, _ = ctx.GetQueryMap("filter")
		dto.SortBy, _ = ctx.GetQueryMap("sortby")

		data, err := psr.partnershipUseCase.GetGroupedPartners(contextWithReqInfo(ctx), dto)
		if err != nil {
			errorResponse(err, nil, psr.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, psr.config.DetailedError()).reply(ctx)
}

func (psr *PartnershipRoutes) getPartners(ctx *gin.Context) {
	var dto partnership.GetPartnerListDto
	reqInfo := getReqInfo(ctx)

	_, psm := reqInfo.Modules[string(roles_modules.PartnershipManagement)]
	_, qr := reqInfo.Modules[string(roles_modules.QueueRequest)]
	if psm || qr {
		if err := ctx.BindQuery(&dto); err != nil {
			errorResponse(err, nil, psr.config.DetailedError()).reply(ctx)
			return
		}
		dto.Filter, _ = ctx.GetQueryMap("filter")
		dto.SortBy, _ = ctx.GetQueryMap("sortby")

		data, err := psr.partnershipUseCase.GetPartners(contextWithReqInfo(ctx), dto)
		if err != nil {
			errorResponse(err, nil, psr.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, psr.config.DetailedError()).reply(ctx)
}
