//go:generate mockery --name UserUsecases --filename usecase.go --output ./mock --with-expecter

package user

import (
	"context"
)

type UserUsecases interface {
	Add(ctx context.Context, dto AddUserDto) (int64, error)
	Update(ctx context.Context, dto UpdateUserDto) error
	Search(ctx context.Context, in UserSearchDto, isSuper bool) (response *UserSearchResponse, err error)
	Delete(ctx context.Context, in DeleteUserDto) (err error)
	ChangePassword(ctx context.Context, dto ChangeUserPasswordDto) error
	GetById(ctx context.Context, userId int64) (UserDto, error)
}
