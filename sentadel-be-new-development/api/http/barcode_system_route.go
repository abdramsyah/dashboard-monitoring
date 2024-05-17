package http

import (
	"fmt"
	"sentadel-backend/internal/barcode_system"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/user"

	"github.com/gin-gonic/gin"
)

const BarcodeSystemRoute = "/barcode-system"

type BarcodeSystemRoutes struct {
	config               Config
	barcodeSystemUseCase barcode_system.BarcodeSystemUseCase
	userUseCase          user.UserUsecases
}

func NewBarcodeSystemRoutes(config Config, barcodeSystemUseCase barcode_system.BarcodeSystemUseCase,
	userUseCase user.UserUsecases) *BarcodeSystemRoutes {
	return &BarcodeSystemRoutes{
		config:               config,
		barcodeSystemUseCase: barcodeSystemUseCase,
		userUseCase:          userUseCase,
	}
}

func (bsr BarcodeSystemRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)
	route.POST(BarcodeSystemRoute, bsr.createClientBarcode)
	route.GET(BarcodeSystemRoute, bsr.getClientBarcode)
	route.GET(BarcodeSystemRoute+"/admin-list", bsr.getAdminList)
}

func (bsr BarcodeSystemRoutes) createClientBarcode(ctx *gin.Context) {
	var params barcode_system.CreateClientBarcodeRequest
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.BarcodeSellingSystem)]; ok && !ro {
		if err := bindBody(&params, ctx); err != nil {
			errorResponse(err, nil, bsr.config.DetailedError()).reply(ctx)
			return
		}

		fmt.Println("createClientBarcode - params", params)

		codes, err := bsr.barcodeSystemUseCase.CreateClientBarcode(contextWithReqInfo(ctx), reqInfo.UserId, params)
		if err != nil {
			errorResponse(err, nil, bsr.config.DetailedError()).reply(ctx)
			return
		}

		okResponse(codes).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, bsr.config.DetailedError()).reply(ctx)
}

func (bsr BarcodeSystemRoutes) getAdminList(c *gin.Context) {
	var searchDto user.UserSearchDto

	reqInfo := getReqInfo(c)

	if ro, ok := reqInfo.Modules[string(roles_modules.BarcodeSellingSystem)]; ok && !ro {
		if err := c.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, bsr.config.DetailedError()).reply(c)
			return
		}

		moduleFilter := fmt.Sprintf(`module:["%s"]`, roles_modules.Grading)

		searchDto.Filter = append([]string{}, moduleFilter)

		data, err := bsr.userUseCase.Search(contextWithReqInfo(c), searchDto, reqInfo.IsSuper)
		if err != nil {
			errorResponse(err, nil, bsr.config.DetailedError()).reply(c)
			return
		}

		searchResponse(data.Meta, data.Users).reply(c)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, bsr.config.DetailedError()).reply(c)
}

func (bsr BarcodeSystemRoutes) getClientBarcode(c *gin.Context) {
	var searchDto barcode_system.ClientBarcodeRequestDto

	reqInfo := getReqInfo(c)

	_, isBSS := reqInfo.Modules[string(roles_modules.BarcodeSellingSystem)]
	_, isGrading := reqInfo.Modules[string(roles_modules.Grading)]
	_, isStockGoods := reqInfo.Modules[string(roles_modules.GoodsTable)]
	if isBSS || isGrading || isStockGoods {
		if err := c.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, bsr.config.DetailedError()).reply(c)
			return
		}
		searchDto.Filter, _ = c.GetQueryMap("filter")
		var userID *int64
		if searchDto.Mode == "GRADING" && isGrading {
			userID = &reqInfo.UserId
		}

		data, err := bsr.barcodeSystemUseCase.GetClientBarcode(contextWithReqInfo(c), searchDto, userID)
		if err != nil {
			errorResponse(err, nil, bsr.config.DetailedError()).reply(c)
			return
		}

		searchResponse(data.Meta, data.List).reply(c)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, bsr.config.DetailedError()).reply(c)
}
