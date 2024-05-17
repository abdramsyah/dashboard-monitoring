package http

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/grade_management"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	GradeManagementRoute = "/grade-management"
)

type GradeManagementRoutes struct {
	config                  Config
	GradeDictionaryUsecases grade_management.GradeManagementUsecases
}

func NewGradeManagementRoutes(config Config, GradeManagementUsecases grade_management.GradeManagementUsecases) *GradeManagementRoutes {
	return &GradeManagementRoutes{
		config:                  config,
		GradeDictionaryUsecases: GradeManagementUsecases,
	}
}

func (g *GradeManagementRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)
	route.POST(GradeManagementRoute, g.createGradeManagement)
	route.PUT(GradeManagementRoute, g.updateGradeManagement)
	route.GET(GradeManagementRoute+"/:id", g.findOneGradeManagement)
	route.DELETE(GradeManagementRoute+"/:id", g.deleteGradeManagement)
	route.GET(GradeManagementRoute, g.getGroupList)
	route.GET(GradeManagementRoute+"/all", g.getAllGrade)
}

func (c *GradeManagementRoutes) createGradeManagement(ctx *gin.Context) {
	var GradeDictionaryRequest grade_management.GradeManagementCreateRequest
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.GradeManagement)]; ok && !ro {
		if err := bindBody(&GradeDictionaryRequest, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		GradeDictionary, err := c.GradeDictionaryUsecases.Create(contextWithReqInfo(ctx), GradeDictionaryRequest)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(GradeDictionary).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *GradeManagementRoutes) updateGradeManagement(ctx *gin.Context) {
	var GradeDictionaryRequest grade_management.GradeManagementCreateRequest
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.GradeManagement)]; ok && !ro {
		if err := bindBody(&GradeDictionaryRequest, ctx); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		GradeDictionary, err := c.GradeDictionaryUsecases.Update(contextWithReqInfo(ctx), GradeDictionaryRequest)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(GradeDictionary).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *GradeManagementRoutes) deleteGradeManagement(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.GradeManagement)]; ok && !ro {
		if ID, err := strconv.Atoi(ctx.Param("id")); err == nil {
			err := c.GradeDictionaryUsecases.Delete(contextWithReqInfo(ctx), int64(ID))
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

func (c *GradeManagementRoutes) findOneGradeManagement(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.GradeManagement)]; ok {
		if ID, err := strconv.Atoi(ctx.Param("id")); err == nil {
			response, err := c.GradeDictionaryUsecases.FindOne(contextWithReqInfo(ctx), int64(ID))
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

func (c *GradeManagementRoutes) getGroupList(ctx *gin.Context) {
	var searchDto grade_management.GradeDictionaryListDto

	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.GradeManagement)]; ok {
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

		data, err := c.GradeDictionaryUsecases.GetGroupList(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.GradeDictionaries).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}

func (c *GradeManagementRoutes) getAllGrade(ctx *gin.Context) {
	var searchDto grade_management.GradeDictionaryListDto
	reqInfo := getReqInfo(ctx)

	_, isGM := reqInfo.Modules[string(roles_modules.GradeManagement)]
	_, isGrading := reqInfo.Modules[string(roles_modules.Grading)]
	if isGM || isGrading {
		if err := ctx.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		data, err := c.GradeDictionaryUsecases.GetAllGrade(contextWithReqInfo(ctx), searchDto)
		if err != nil {
			errorResponse(err, nil, c.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, c.config.DetailedError()).reply(ctx)
}
