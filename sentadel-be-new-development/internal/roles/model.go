package roles

import (
	validation "github.com/go-ozzo/ozzo-validation"
	"time"

	"sentadel-backend/internal/base/errors"
)

type RoleModel struct {
	Id          int64
	Name        string
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func NewRole(name, description string) (RoleModel, error) {
	roleModel := RoleModel{
		Name:        name,
		Description: description,
	}

	if err := roleModel.Validate(); err != nil {
		return RoleModel{}, err
	}

	return roleModel, nil
}

func NewUserRole(userID int64, roleIDs []int64) UserRoleModels {
	userRoleModels := []UserRoleModel{}
	for _, roleID := range roleIDs {
		userRoleModels = append(userRoleModels, UserRoleModel{
			UserID: userID,
			RoleID: roleID,
		})
	}

	return UserRoleModels{userRoleModels}

}

func (role *RoleModel) Update(name, description string) error {
	if len(name) > 0 {
		role.Name = name
	}

	if len(description) > 0 {
		role.Description = description
	}

	return role.Validate()
}

func (role *RoleModel) Validate() error {
	err := validation.ValidateStruct(role,
		validation.Field(&role.Name, validation.Required, validation.Length(5, 100)),
		validation.Field(&role.Description, validation.Required, validation.Length(5, 100)),
	)
	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

type UserRoleModel struct {
	UserID int64
	RoleID int64
}

type UserRoleModels struct {
	RoleModels []UserRoleModel
}

func (userRoleModel UserRoleModels) Validate() error {

	//if len(userRoleModel.RoleModels) < 1 {
	//	return errors.New(errors.ValidationError, string(errors.ErrValidationRole))
	//}

	return nil
}
