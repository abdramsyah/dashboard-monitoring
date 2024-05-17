package auth

import "sentadel-backend/internal/user"

type LoginUserDto struct {
	Username string `json:"username"`
	Password string `json:"password,-"`
	IsMobile bool   `json:"is_mobile"`
}

type LoggedUserDto struct {
	user.UserDto
	Token string `json:"token"`
}

func (dto LoggedUserDto) MapFromModel(model user.UserModel, token string) LoggedUserDto {
	dto.Id = model.Id
	dto.Username = model.Username
	dto.Email = model.Email
	dto.Token = token

	return dto
}

func (dto LoggedUserDto) MapFromModelLogin(model user.UserModelLogin, token string) LoggedUserDto {
	dto.Id = model.Id
	dto.Username = model.Username
	dto.Name = model.Name
	dto.Email = model.Email
	dto.Token = token

	return dto
}
