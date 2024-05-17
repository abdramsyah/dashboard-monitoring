package roles

import (
	"context"
	"go.uber.org/zap"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/cache"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/user"
)

const LIST_USER_ROLES_KEY = "LIST_USER_ROLES_KEY"

type RoleUsecases interface {
	GetRoles(ctx context.Context, isSuper bool) (dto []user.RoleModulesModel, err error)
	Add(ctx context.Context, dto RoleDto) (int64, error)
	Update(ctx context.Context, dto UpdateRoleDto) error
	AddUserRoles(ctx context.Context, dto AddUserRolesDto) (err error)
}

type roleUsecase struct {
	database.TxManager
	RoleRepository
	cache.Cache
}

func NewRoleUsecases(manager database.TxManager, repository RoleRepository, localCache cache.Cache) *roleUsecase {
	return &roleUsecase{
		manager,
		repository,
		localCache,
	}
}

func (r roleUsecase) Add(ctx context.Context, dto RoleDto) (roleID int64, err error) {
	model, err := dto.MapToModel()
	if err != nil {
		return 0, err
	}

	// Transaction demonstration
	err = r.RunTx(ctx, func(ctx context.Context) error {
		roleID, err = r.RoleRepository.Add(ctx, model)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add to db", zap.Error(err))
			return err
		}
		model.Id = roleID

		return nil
	})

	return roleID, err
}

func (r roleUsecase) GetRoles(ctx context.Context, isSuper bool) (dto []user.RoleModulesModel, err error) {
	//err = r.RunTx(ctx, func(ctx context.Context) error {
	//	data, found := r.Get(ctx, LIST_USER_ROLES_KEY)
	//
	//	fmt.Println("GetRoles - data", data)
	//
	//	if found != nil {
	//		dto, err = r.RoleRepository.GetRoleList(ctx, isSuper)
	//		if err != nil {
	//			logger.ContextLogger(ctx).Error("error when get roles", zap.Error(err))
	//			return err
	//		}
	//
	//		fmt.Println("GetRoles - dto", dto)
	//		payload, _ := json.Marshal(dto)
	//
	//		r.Set(ctx, LIST_USER_ROLES_KEY, string(payload), 1*time.Minute)
	//	} else {
	//		err := json.Unmarshal([]byte(data), &dto)
	//		if err != nil {
	//			return err
	//		}
	//	}
	//	return nil
	//})
	dto, err = r.RoleRepository.GetRoleList(ctx, isSuper)
	if err != nil {
		logger.ContextLogger(ctx).Error("error when get roles", zap.Error(err))
		return nil, err
	}

	return dto, err
}

func (r roleUsecase) AddUserRoles(ctx context.Context, dto AddUserRolesDto) (err error) {
	model := dto.MapToModel()

	err = model.Validate()

	if err != nil {
		logger.ContextLogger(ctx).Error("validation error", zap.Error(err))
	}

	// Transaction demonstration
	err = r.RunTx(ctx, func(ctx context.Context) error {
		_, err = r.RoleRepository.AddUserRoles(ctx, model.RoleModels)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add to db", zap.Error(err))
			return err
		}

		return nil
	})

	return err
}

func (r roleUsecase) Update(ctx context.Context, dto UpdateRoleDto) error {
	panic("implement me")
}
