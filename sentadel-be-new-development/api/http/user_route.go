package http

import (
	"fmt"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/roles"
	"sentadel-backend/internal/user"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	UserManagementRoute = "/user-management"
)

type UserRoutes struct {
	config       Config
	userUsecases user.UserUsecases
	roleUsecases roles.RoleUsecases
}

func NewUserRoutes(config Config, userUsecases user.UserUsecases,
	roleUsecases roles.RoleUsecases) *UserRoutes {
	return &UserRoutes{
		config:       config,
		userUsecases: userUsecases,
		roleUsecases: roleUsecases,
	}
}

func (u *UserRoutes) AddRoutes(router *Server) {
	route := router.Engine.Group(OneGatePrefix)

	route.POST(UserManagementRoute, u.addUser)
	route.PUT(UserManagementRoute, u.updateUser)
	route.GET(UserManagementRoute, u.getUserList)
	route.DELETE(UserManagementRoute+"/:id", u.deleteUser)
}

func (u *UserRoutes) addUser(c *gin.Context) {
	var addUserDto user.AddUserDto

	reqInfo := getReqInfo(c)

	if ro, ok := reqInfo.Modules[string(roles_modules.UserManagement)]; ok && !ro {
		if err := bindBody(&addUserDto, c); err != nil {
			errorResponse(err, nil, u.config.DetailedError()).reply(c)
			return
		}

		userData, err := u.userUsecases.Add(contextWithReqInfo(c), addUserDto)
		if err != nil {
			errorResponse(err, nil, u.config.DetailedError()).reply(c)
			return
		}

		okResponse(userData).reply(c)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, u.config.DetailedError()).reply(c)
}

func (u *UserRoutes) updateUser(c *gin.Context) {
	var updateUserDto user.UpdateUserDto

	reqInfo := getReqInfo(c)
	//updateUserDto.ID = reqInfo.UserId

	if ro, ok := reqInfo.Modules[string(roles_modules.UserManagement)]; ok && !ro {
		if err := bindBody(&updateUserDto, c); err != nil {
			fmt.Println("updateUser - err", err)
			errorResponse(err, nil, u.config.DetailedError()).reply(c)
			return
		}

		err := u.userUsecases.Update(contextWithReqInfo(c), updateUserDto)
		if err != nil {
			errorResponse(err, nil, u.config.DetailedError()).reply(c)
			return
		}

		okResponse(nil).reply(c)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, u.config.DetailedError()).reply(c)
}

func (u *UserRoutes) deleteUser(c *gin.Context) {

	reqInfo := getReqInfo(c)

	if ro, ok := reqInfo.Modules[string(roles_modules.UserManagement)]; ok && !ro {
		id := c.Param("id")
		if id == "" {
			errorResponse(errors.New(errors.BadRequestError),
				nil, u.config.DetailedError()).reply(c)
		}

		i, _ := strconv.ParseInt(id, 10, 64)

		deleteUserDto := user.DeleteUserDto{
			Id: i,
		}

		err := u.userUsecases.Delete(contextWithReqInfo(c), deleteUserDto)
		if err != nil {
			errorResponse(err, nil, u.config.DetailedError()).reply(c)
			return
		}

		okResponse(deleteUserDto).reply(c)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, u.config.DetailedError()).reply(c)
}

func (u *UserRoutes) getUserList(c *gin.Context) {
	var searchDto user.UserSearchDto

	reqInfo := getReqInfo(c)

	if _, ok := reqInfo.Modules[string(roles_modules.UserManagement)]; ok {
		if err := c.BindQuery(&searchDto); err != nil {
			errorResponse(err, nil, u.config.DetailedError()).reply(c)
			return
		}

		if len(searchDto.Filter) > 0 {
			searchDto.Filter = strings.Split(searchDto.Filter[0], ",")
		}

		if len(searchDto.SortBy) > 0 {
			searchDto.SortBy = strings.Split(searchDto.SortBy[0], ",")
		}

		data, err := u.userUsecases.Search(contextWithReqInfo(c), searchDto, reqInfo.IsSuper)
		if err != nil {
			errorResponse(err, nil, u.config.DetailedError()).reply(c)
			return
		}

		searchResponse(data.Meta, data.Users).reply(c)
		return
	}

	errorResponse(errors.New(errors.UnauthorizedError), nil, u.config.DetailedError()).reply(c)
}
