package http

import (
	"sentadel-backend/internal/auth"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/roles"
	"sentadel-backend/internal/user"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type AuthRoutes struct {
	config       Config
	authService  auth.AuthService
	userUsecases user.UserUsecases
	roleUsecase  roles.RoleUsecases
}

func NewAuthRoutes(config Config, authService auth.AuthService, userUsecases user.UserUsecases,
	roleUsecase roles.RoleUsecases) *AuthRoutes {
	return &AuthRoutes{
		config:       config,
		authService:  authService,
		userUsecases: userUsecases,
		roleUsecase:  roleUsecase,
	}
}

func (a *AuthRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)

	route.POST("/auth/login", a.login)
	route.GET("/auth/roles", a.getRoleList)
	route.GET("/auth/me", a.getMe)
	route.PATCH("/auth/password", a.changeMyPassword)
}

func (a *AuthRoutes) login(c *gin.Context) {
	var loginUserDto auth.LoginUserDto

	if err := bindBody(&loginUserDto, c); err != nil {
		errorResponse(err, nil, a.config.DetailedError()).reply(c)
		return
	}

	userData, err := a.authService.Login(c, loginUserDto)
	if err != nil {
		errorResponse(err, nil, a.config.DetailedError()).reply(c)
		return
	}

	okResponse(userData).reply(c)
}

func (a *AuthRoutes) Authenticate(c *gin.Context) {
	token := c.Request.Header.Get("Authorization")

	payload, err := a.authService.VerifyAccessToken(token)
	if err != nil {
		response := errorResponse(err, nil, a.config.DetailedError())
		c.AbortWithStatusJSON(response.Status, response)
	}

	setUserId(c, payload["userId"].(int64))
}

func (a *AuthRoutes) changeMyPassword(c *gin.Context) {
	var changeUserPasswordDto user.ChangeUserPasswordDto

	reqInfo := getReqInfo(c)
	changeUserPasswordDto.Id = reqInfo.UserId

	if err := bindBody(&changeUserPasswordDto, c); err != nil {
		errorResponse(err, nil, a.config.DetailedError()).reply(c)
		return
	}

	err := a.userUsecases.ChangePassword(contextWithReqInfo(c), changeUserPasswordDto)
	if err != nil {
		errorResponse(err, nil, a.config.DetailedError()).reply(c)
		return
	}

	okResponse(nil).reply(c)
}

func (a *AuthRoutes) getRoleList(c *gin.Context) {
	reqInfo := getReqInfo(c)

	roleDtos, err := a.roleUsecase.GetRoles(contextWithReqInfo(c), reqInfo.IsSuper)
	if err != nil {
		errorResponse(err, nil, a.config.DetailedError()).reply(c)
		return
	}

	okResponse(roleDtos).reply(c)
}

func (a *AuthRoutes) getMe(context *gin.Context) {
	reqInfo := getReqInfo(context)

	user, err := a.userUsecases.GetById(contextWithReqInfo(context), reqInfo.UserId)

	logger.ContextLogger(context).Info("User Get By ID ", zap.Any("user: ", user))

	if err != nil {
		errorResponse(err, nil, a.config.DetailedError()).reply(context)
		return
	}

	okResponse(user).reply(context)
}
