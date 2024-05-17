package http

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/unique_code_generator"

	"github.com/gin-gonic/gin"
)

const (
	UniqueCodeGeneratorRoute = "/unique-code"
)

type UniqueCodeRoutes struct {
	config             Config
	uniqueCodeUseCases unique_code_generator.UniqueCodeUseCases
}

func NewUniqueCodeRoutes(config Config, uniqueCodeUseCases unique_code_generator.UniqueCodeUseCases) *UniqueCodeRoutes {
	return &UniqueCodeRoutes{
		config:             config,
		uniqueCodeUseCases: uniqueCodeUseCases,
	}
}

func (uc *UniqueCodeRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)

	route.POST(UniqueCodeGeneratorRoute+"/generate", uc.generateUniqueCode)
	route.GET(UniqueCodeGeneratorRoute+"/history", uc.getUniqueCodeHistory)
	route.POST(UniqueCodeGeneratorRoute+"/validate", uc.validateUniqueCode)
	route.POST(UniqueCodeGeneratorRoute+"/validate-and-burn", uc.validateAndBurn)
}

func (uc *UniqueCodeRoutes) generateUniqueCode(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.UniqueCode)]; ok && !ro {
		uniqueCode, err := uc.uniqueCodeUseCases.Generate(ctx, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, uc.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(uniqueCode).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, uc.config.DetailedError()).reply(ctx)
}

func (uc *UniqueCodeRoutes) getUniqueCodeHistory(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.UniqueCode)]; ok {
		data, err := uc.uniqueCodeUseCases.GetUniqueCodeHistory(contextWithReqInfo(ctx))
		if err != nil {
			errorResponse(err, nil, uc.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data.UniqueCodes).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, uc.config.DetailedError()).reply(ctx)
}

func (uc *UniqueCodeRoutes) validateUniqueCode(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.UniqueCode)]; ok && !ro {
		var UCRequest unique_code_generator.UniqueCodeDto

		if err := ctx.BindJSON(&UCRequest); err != nil {
			errorResponse(err, nil, uc.config.DetailedError()).reply(ctx)
			return
		}

		data, err := uc.uniqueCodeUseCases.ValidateUniqueCode(contextWithReqInfo(ctx), UCRequest.Code)
		if err != nil {
			errorResponse(err, nil, uc.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, uc.config.DetailedError()).reply(ctx)
}

func (uc *UniqueCodeRoutes) validateAndBurn(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.UniqueCode)]; ok && !ro {
		var UCRequest unique_code_generator.UniqueCodeDto

		if err := ctx.BindJSON(&UCRequest); err != nil {
			errorResponse(err, nil, uc.config.DetailedError()).reply(ctx)
			return
		}
		validate, err := uc.uniqueCodeUseCases.ValidateUniqueCode(contextWithReqInfo(ctx), UCRequest.Code)
		if err != nil {
			errorResponse(err, nil, uc.config.DetailedError()).reply(ctx)
			return
		}

		if validate {
			_, err := uc.uniqueCodeUseCases.BurnUniqueCode(contextWithReqInfo(ctx), UCRequest.Code, reqInfo.UserId)
			if err != nil {
				errorResponse(err, nil, uc.config.DetailedError()).reply(ctx)
				return
			}
		} else {
			errorResponse(errors.Wrap(err, errors.InvalidDataError, "Unique code already used"), nil, uc.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(validate).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, uc.config.DetailedError()).reply(ctx)
}
