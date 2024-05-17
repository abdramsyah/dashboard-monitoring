package http

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/models"
	"sentadel-backend/internal/tax_and_fee"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	TaxRoute = "/tax"
	FeeRoute = "/fee"
)

type TaxAndFeeRoutes struct {
	config           Config
	taxAndFeeUsecase tax_and_fee.TaxAndFeeUsecases
}

func NewTaxAndFeeRoutes(config Config, taxAndFeeUsecase tax_and_fee.TaxAndFeeUsecases) *TaxAndFeeRoutes {
	return &TaxAndFeeRoutes{
		config:           config,
		taxAndFeeUsecase: taxAndFeeUsecase,
	}
}

func (c *TaxAndFeeRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)

	// tax
	route.GET(TaxRoute, c.getTaxList)
	route.POST(TaxRoute, c.setNewTax)
	// fee
	route.GET(FeeRoute, c.getFeeList)
	route.POST(FeeRoute, c.setNewFee)
}

func (c *TaxAndFeeRoutes) getTaxList(ctx *gin.Context) {
	var searchDto models.SearchRequest

	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.TaxAndFee)]; ok {
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

		if len(searchDto.Keyword) > 0 {
			searchDto.Keyword = strings.ToLower(searchDto.Keyword)
		}

		data, err := c.taxAndFeeUsecase.GetTaxList(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *TaxAndFeeRoutes) getFeeList(ctx *gin.Context) {
	var searchDto models.SearchRequest

	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.TaxAndFee)]; ok {
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

		if len(searchDto.Keyword) > 0 {
			searchDto.Keyword = strings.ToLower(searchDto.Keyword)
		}

		data, err := c.taxAndFeeUsecase.GetFeeList(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *TaxAndFeeRoutes) setNewTax(ctx *gin.Context) {
	var dto tax_and_fee.NewTaxReqParams

	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.TaxAndFee)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}
		data, err := c.taxAndFeeUsecase.SetNewTaxUseCase(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *TaxAndFeeRoutes) setNewFee(ctx *gin.Context) {
	var dto tax_and_fee.NewFeeReqParams

	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.TaxAndFee)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}
		data, err := c.taxAndFeeUsecase.SetNewFeeUseCase(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}
