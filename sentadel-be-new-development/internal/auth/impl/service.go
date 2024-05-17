package impl

import (
	"context"
	"sentadel-backend/internal/auth"
	"sentadel-backend/internal/base/crypto"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/user"
	"strings"
)

type AuthServiceOpts struct {
	UserRepository user.UserRepository
	Crypto         crypto.Crypto
	Config         auth.Config
}

func NewAuthService(opts AuthServiceOpts) auth.AuthService {
	return &authService{
		UserRepository: opts.UserRepository,
		Crypto:         opts.Crypto,
		Config:         opts.Config,
	}
}

type authService struct {
	user.UserRepository
	crypto.Crypto
	auth.Config
}

func (u *authService) Login(ctx context.Context, in auth.LoginUserDto) (out auth.LoggedUserDto, err error) {
	userRes, err := u.UserRepository.GetUserRolesAndPermissionsByUsername(ctx, in.Username)
	if err != nil {
		return out, errors.Wrap(err, errors.WrongCredentialsError, "")
	}

	mobileRoles := map[roles_modules.Roles]bool{
		roles_modules.Coordinator:              true,
		roles_modules.OperationalAdministrator: true,
	}

	if in.IsMobile {
		var rolesModules []user.RoleModulesModel
		for _, role := range userRes.RolesModules {
			if mobileRoles[role.RoleName] {
				rolesModules = append(rolesModules, role)
			}
		}
		if len(rolesModules) == 0 {
			return out, errors.Wrap(err, errors.UserRolesCanLoginIntoMobile,
				"There aren't any Role that this user had can be use to login into mobile platform")
		}
		userRes.RolesModules = rolesModules
	}

	if userRes.Status != constants.Active {
		return out, errors.Wrap(err, errors.UserNotActiveError, "User is not Active")
	}

	if !userRes.AbleToLogin {
		return out, errors.Wrap(err, errors.CantLoginUsingThisUser, "User Locked, Can't login using this user")
	}

	if !userRes.ComparePassword(in.Password, u.Crypto) {
		return out, errors.New(errors.WrongCredentialsError)
	}

	token, err := u.generateAccessTokenPayload(userRes)
	if err != nil {
		return out, err
	}

	return out.MapFromModelLogin(userRes, token), nil
}

func (u *authService) VerifyAccessToken(accessToken string) (map[string]interface{}, error) {
	payload, err := u.ParseAndValidateJWT(accessToken, u.AccessTokenSecret())
	if err != nil {
		return nil, errors.New(errors.UnauthorizedError)
	}
	return payload, nil
}

func (u *authService) VerifyAccessTokenPermission(accessToken string) (map[string]interface{}, error) {
	splitToken := strings.Split(accessToken, "Bearer")
	if len(splitToken) != 2 {
		return nil, errors.New(errors.UnauthorizedError)
	}

	reqToken := strings.TrimSpace(splitToken[1])

	payload, err := u.ParseAndValidateJWT(reqToken, u.AccessTokenSecret())
	if err != nil {
		return nil, errors.New(errors.UnauthorizedError)
	}

	if payload["rolesModules"] == nil {
		payload["rolesModules"] = []interface{}{}
	}

	rolesModules := payload["rolesModules"].([]interface{})

	modulesMap := map[string]bool{}
	for _, value := range rolesModules {
		rmObj := value.(map[string]interface{})
		modules := rmObj["modules"].([]interface{})
		for _, module := range modules {
			moduleObj := module.(map[string]interface{})
			if moduleObj["read_only"] == true {
				modulesMap[moduleObj["module_name"].(string)] = true
			} else {
				modulesMap[moduleObj["module_name"].(string)] = false
			}
		}
	}

	payload["modules"] = modulesMap

	return payload, nil
}

func (u *authService) ParseAccessToken(accessToken string) (int64, error) {
	payload, err := u.ParseJWT(accessToken, u.AccessTokenSecret())
	if err != nil {
		return 0, errors.New(errors.UnauthorizedError)
	}

	userId, ok := payload["userId"].(float64)
	if !ok {
		return 0, errors.New(errors.UnauthorizedError)
	}

	return int64(userId), nil
}

func (u *authService) generateAccessToken(userId int64) (string, error) {
	payload := map[string]interface{}{"userId": userId}

	return u.GenerateJWT(
		payload,
		u.AccessTokenSecret(),
		u.AccessTokenExpiresDate(),
	)
}

func (u *authService) generateAccessTokenPayload(userModel user.UserModelLogin) (string, error) {
	payload := map[string]interface{}{
		"userId":       userModel.Id,
		"rolesModules": userModel.RolesModules,
		"name":         userModel.Name,
		"isSuper":      userModel.IsSuper,
	}

	return u.GenerateJWT(
		payload,
		u.AccessTokenSecret(),
		u.AccessTokenExpiresDate(),
	)
}
