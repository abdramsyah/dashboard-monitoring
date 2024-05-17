//go:generate mockery --name UserRepository --filename repository.go --output ./mock --with-expecter

package user

import (
	"context"
)

type UserRepository interface {
	Add(ctx context.Context, user UserModel) (int64, error)
	Update(ctx context.Context, user UserModel) (int64, error)
	GetById(ctx context.Context, userId int64) (UserModel, error)
	Search(ctx context.Context, dto UserSearchDto, isSuper bool) ([]UserModel, error)
	GetByEmail(ctx context.Context, email string) (UserModel, error)
	GetUserRolesByUserID(ctx context.Context, userID int64) (result []string, err error)
	Delete(ctx context.Context, userID int64) (int64, error)
	GetUserRolesAndPermissionsByUsername(ctx context.Context, username string) (UserModelLogin, error)
}
