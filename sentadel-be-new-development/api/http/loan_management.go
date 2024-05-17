package http

import (
	"fmt"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/loan_management"

	"github.com/gin-gonic/gin"
)

const (
	LoanManagementRoute = "/loan-management"
	Repayment           = "/repayment"
)

type LoanManagementRoutes struct {
	config                Config
	loanManagementUseCase loan_management.LoanManagementUsecases
}

func NewLoanManagementRoutes(config Config, loanManagementUseCase loan_management.LoanManagementUsecases) *LoanManagementRoutes {
	return &LoanManagementRoutes{
		config:                config,
		loanManagementUseCase: loanManagementUseCase,
	}
}

func (lmr *LoanManagementRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)
	route.POST(LoanManagementRoute, lmr.addNewLoan)
	route.PUT(LoanManagementRoute, lmr.updateLoan)
	route.GET(LoanManagementRoute, lmr.getLoanList)
	route.POST(LoanManagementRoute+Repayment, lmr.addNewRepayment)
}

func (lmr *LoanManagementRoutes) addNewLoan(ctx *gin.Context) {
	var dto loan_management.ManageLoanRequestDto
	reqInfo := getReqInfo(ctx)

	if ro, ok := reqInfo.Modules[string(roles_modules.LoanManagement)]; ok && !ro {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, lmr.config.DetailedError()).reply(ctx)
			return
		}

		_, err := lmr.loanManagementUseCase.AddNewLoan(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, lmr.config.DetailedError()).reply(ctx)
			return
		}

		okResponseWithoutData("Add new loan success").reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, lmr.config.DetailedError()).reply(ctx)
}

func (lmr *LoanManagementRoutes) updateLoan(ctx *gin.Context) {
	var dto loan_management.ManageLoanRequestDto
	reqInfo := getReqInfo(ctx)

	fmt.Println("updateLoan - isSuper", reqInfo.IsSuper)

	if ro, ok := reqInfo.Modules[string(roles_modules.LoanManagement)]; ok && !ro && reqInfo.IsSuper {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, lmr.config.DetailedError()).reply(ctx)
			return
		}

		_, err := lmr.loanManagementUseCase.UpdateLoan(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, lmr.config.DetailedError()).reply(ctx)
			return
		}

		okResponseWithoutData("Update loan success").reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, lmr.config.DetailedError()).reply(ctx)
}

func (lmr *LoanManagementRoutes) getLoanList(ctx *gin.Context) {
	var dto loan_management.GetLoanListDto
	reqInfo := getReqInfo(ctx)

	if _, ok := reqInfo.Modules[string(roles_modules.LoanManagement)]; ok {
		if err := ctx.BindQuery(&dto); err != nil {
			errorResponse(err, nil, lmr.config.DetailedError()).reply(ctx)
			return
		}
		dto.Filter, _ = ctx.GetQueryMap("filter")
		dto.SortBy, _ = ctx.GetQueryMap("sortby")

		data, err := lmr.loanManagementUseCase.GetLoanList(contextWithReqInfo(ctx), dto)
		if err != nil {
			errorResponse(err, nil, lmr.config.DetailedError()).reply(ctx)
			return
		}

		searchResponse(data.Meta, data.List).reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, lmr.config.DetailedError()).reply(ctx)
}

func (lmr *LoanManagementRoutes) addNewRepayment(ctx *gin.Context) {
	var dto loan_management.AddNewRepaymentDto
	reqInfo := getReqInfo(ctx)

	loanMgmRO, loanMgm := reqInfo.Modules[string(roles_modules.LoanManagement)]
	paymentMgmRO, paymentMgm := reqInfo.Modules[string(roles_modules.PaymentManagement)]
	if (!loanMgmRO && loanMgm) || (!paymentMgmRO && paymentMgm) {
		if err := bindBody(&dto, ctx); err != nil {
			errorResponse(err, nil, lmr.config.DetailedError()).reply(ctx)
			return
		}

		_, err := lmr.loanManagementUseCase.AddNewRepayment(contextWithReqInfo(ctx), dto, reqInfo.UserId)
		if err != nil {
			errorResponse(err, nil, lmr.config.DetailedError()).reply(ctx)
			return
		}

		okResponseWithoutData("Add new repayment success").reply(ctx)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, lmr.config.DetailedError()).reply(ctx)
}
