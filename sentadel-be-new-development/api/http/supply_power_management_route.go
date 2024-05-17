package http

import (
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/models"
	"sentadel-backend/internal/supply_power_management"

	"github.com/gin-gonic/gin"
)

const (
	SupplyPowerManagementRoute = "/supply-power-management"
)

type SupplyPowerManagementRoutes struct {
	config                        Config
	PowerSupplyManagementUsecases supply_power_management.SupplyPowerManagementUsecases
}

func NewSupplyPowerManagementRoutes(config Config, supplyPowerManagementUsecase supply_power_management.SupplyPowerManagementUsecases) *SupplyPowerManagementRoutes {
	return &SupplyPowerManagementRoutes{
		config:                        config,
		PowerSupplyManagementUsecases: supplyPowerManagementUsecase,
	}
}

func (psrt *SupplyPowerManagementRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)

	// queue mangement
	route.GET(SupplyPowerManagementRoute, psrt.getList)
	route.GET(SupplyPowerManagementRoute+"/recap", psrt.getRecap)
}

func (psrt *SupplyPowerManagementRoutes) getList(ctx *gin.Context) {
	var searchRequest models.SearchRequest
	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.SupplyPowerManagement)]; ok {
		if err := ctx.BindQuery(&searchRequest); err != nil {
			errorResponse(err, nil, psrt.config.DetailedError()).reply(ctx)
			return
		}
		data, err := psrt.PowerSupplyManagementUsecases.GetList(contextWithReqInfo(ctx), searchRequest)
		if err != nil {
			errorResponse(err, nil, psrt.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}
}

func (psrt *SupplyPowerManagementRoutes) getRecap(ctx *gin.Context) {
	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.GradeManagement)]; ok {
		data, err := psrt.PowerSupplyManagementUsecases.GetRecap(contextWithReqInfo(ctx))
		if err != nil {
			errorResponse(err, nil, psrt.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(data).reply(ctx)
		return
	}
}
