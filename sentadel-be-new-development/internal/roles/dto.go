package roles

type RoleDto struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type AddUserRolesDto struct {
	UserID    int64   `json:"user_id"`
	UserRoles []int64 `json:"user_roles"`
}

func (a RoleDto) MapFromModel(role RoleDto) RoleDto {
	a.ID = role.ID
	a.Name = role.Name
	a.Description = role.Description

	return a
}

func (a RoleDto) MapToModel() (RoleModel, error) {
	return NewRole(a.Name, a.Description)
}

func (a AddUserRolesDto) MapToModel() UserRoleModels {
	return NewUserRole(a.UserID, a.UserRoles)
}

type UpdateRoleDto struct {
	Id          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
