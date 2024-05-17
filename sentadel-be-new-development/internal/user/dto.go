package user

type UserDto struct {
	Id          int64  `json:"id"`
	Username    string `json:"username"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
	Photo       string `json:"photo"`
}

func (dto UserDto) MapFromModel(user UserModel) UserDto {
	dto.Id = user.Id
	dto.Email = user.Email
	dto.Username = user.Username
	dto.Email = user.Email
	dto.Photo = user.Photo
	dto.Name = user.Name
	dto.PhoneNumber = user.PhoneNumber

	return dto
}

type AddUserDto struct {
	Name        string  `json:"name"`
	Email       string  `json:"email"`
	PhoneNumber string  `json:"phone_number"`
	Password    string  `json:"password"`
	Username    string  `json:"username"`
	Roles       []int64 `json:"roles"`
	Modules     []int64 `json:"modules"`
	Photo       string  `json:"photo"`
}

func (dto AddUserDto) MapToModel() (UserModel, error) {
	return NewUser(dto.Name, dto.Email, dto.Username, dto.Password, dto.PhoneNumber, dto.Photo, dto.Roles, dto.Modules)
}

type UpdateUserDto struct {
	Id          int64   `json:"id"`
	Name        string  `json:"name"`
	Email       string  `json:"email"`
	PhoneNumber string  `json:"phone_number"`
	Password    string  `json:"password"`
	Username    string  `json:"username"`
	Roles       []int64 `json:"roles"`
	Modules     []int64 `json:"modules"`
	Photo       string  `json:"photo"`
}

type ChangeUserPasswordDto struct {
	Id          int64  `json:"id"`
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

type DeleteUserDto struct {
	Id int64 `form:"id" binding:"required"`
}

type UserSearchDto struct {
	ID      uint     `form:"id"`
	Filter  []string `form:"filter"`
	SortBy  []string `form:"sortby"`
	Page    uint     `form:"page"`
	Limit   uint     `form:"limit"`
	Keyword string   `form:"keyword"`
}

type UserSearchResponse struct {
	Users []UserModel `json:"users"`
	Meta  Meta        `json:"meta"`
}

type Meta struct {
	Page  int `json:"page"`
	Pages int `json:"pages"`
	Limit int `json:"limit"`
}
