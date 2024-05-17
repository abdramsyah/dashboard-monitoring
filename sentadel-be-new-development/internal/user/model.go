package user

import (
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/constants/roles_modules"
	"strconv"
	"time"

	"github.com/go-ozzo/ozzo-validation/is"

	"sentadel-backend/internal/base/crypto"
	"sentadel-backend/internal/base/errors"

	validation "github.com/go-ozzo/ozzo-validation"
)

type UserModel struct {
	Id          int64            `db:"id" json:"id"`
	NumberID    string           `db:"number_id" json:"number_id"`
	Name        string           `db:"name" json:"name"`
	Email       string           `db:"email" json:"email"`
	PhoneNumber string           `db:"phone_number" json:"phone_number"`
	Username    string           `db:"username" json:"username"`
	Password    string           `json:"-"`
	Photo       string           `db:"photo" json:"photo"`
	Roles       []RoleModel      `db:"roles" json:"roles,omitempty"`
	Modules     []ModuleModel    `db:"modules" json:"modules,omitempty"`
	Status      constants.Status `db:"status" json:"status"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	DeletedAt   *time.Time       `json:"deleted_at,omitempty"`
	Total       int64            `json:"-"`
}

type UserModelLogin struct {
	Id           int64
	NumberID     string
	Name         string
	Email        string
	PhoneNumber  string
	Username     string
	Password     string
	Photo        string
	Status       constants.Status
	IsSuper      bool
	AbleToLogin  bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    *time.Time
	RolesModules []RoleModulesModel
}

func NewUser(name, email, username, password, phoneNumber, photo string, roles []int64, modules []int64) (UserModel, error) {
	user := UserModel{
		Name:        name,
		Email:       email,
		NumberID:    strconv.FormatInt(time.Now().UnixNano()/(1<<22), 10),
		Username:    username,
		PhoneNumber: phoneNumber,
		Photo:       photo,
		Password:    password,
		Status:      constants.Active,
	}

	if len(roles) != 0 {
		for _, role := range roles {
			user.Roles = append(user.Roles, RoleModel{RoleID: role})
		}
	}

	if len(modules) != 0 {
		for _, module := range modules {
			user.Modules = append(user.Modules, ModuleModel{ModuleID: module})
		}
	}

	if err := user.Validate(); err != nil {
		return UserModel{}, err
	}

	return user, nil
}

func (user *UserModel) Update(name, email, phoneNumber, username, password string, roles, modules []int64) error {
	if len(name) > 0 {
		user.Name = name
	}

	if len(phoneNumber) > 0 {
		user.PhoneNumber = phoneNumber
	}

	if len(email) > 0 {
		user.Email = email
	}

	if len(username) > 0 {
		user.Username = username
	}

	if len(password) > 0 {
		user.Password = password
	}

	if len(roles) > 0 {
		for _, role := range roles {
			user.Roles = append(user.Roles, RoleModel{RoleID: role})
		}
	}

	if len(modules) > 0 {
		for _, module := range modules {
			user.Modules = append(user.Modules, ModuleModel{ModuleID: module})
		}
	}

	return user.Validate()
}

func (user *UserModel) ChangePassword(newPassword string, crypto crypto.Crypto) error {
	user.Password = newPassword

	if err := user.HashPassword(crypto); err != nil {
		return err
	}

	return user.Validate()
}

func (user *UserModel) Validate() error {
	err := validation.ValidateStruct(user,
		validation.Field(&user.Name, validation.Required, validation.Length(2, 100)),
		validation.Field(&user.Email, validation.Required, is.Email),
		validation.Field(&user.PhoneNumber, validation.Required, validation.Length(2, 100)),
		validation.Field(&user.Username, validation.Required, validation.Length(5, 100)),
		validation.Field(&user.Password, validation.Required, validation.Length(5, 100)),
		validation.Field(&user.Status, validation.Required, validation.Length(5, 100)),
		validation.Field(&user.Roles, validation.Required),
		validation.Field(&user.Modules, validation.Required),
	)
	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

func (user *UserModel) ComparePassword(password string, crypto crypto.Crypto) bool {
	return crypto.CompareHashAndPassword(user.Password, password)
}

func (user *UserModelLogin) ComparePassword(password string, crypto crypto.Crypto) bool {
	return crypto.CompareHashAndPassword(user.Password, password)
}

func (user *UserModel) HashPassword(crypto crypto.Crypto) error {
	hash, err := crypto.HashPassword(user.Password)
	if err != nil {
		return err
	}

	user.Password = hash

	return nil
}

type ModuleModel struct {
	ModuleID          int64  `json:"module_id"`
	ModuleName        string `json:"module_name"`
	ModuleDescription string `json:"module_description"`
	ReadOnly          bool   `json:"read_only"`
}

type RoleModel struct {
	RoleID          int64               `json:"role_id"`
	RoleName        roles_modules.Roles `json:"role_name"`
	RoleDescription string              `json:"role_description"`
}

type RoleModulesModel struct {
	RoleModel
	Modules []ModuleModel `json:"modules"`
}
