package roles

import (
	"context"
	"fmt"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants/roles_modules"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/user"
	"sentadel-backend/internal/utils"
	"strings"

	"github.com/doug-martin/goqu/v9"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgerrcode"
	"go.uber.org/zap"
)

type RoleRepository interface {
	Add(ctx context.Context, model RoleModel) (int64, error)
	GetRoleList(ctx context.Context, isSuper bool) ([]user.RoleModulesModel, error)
	AddUserRoles(ctx context.Context, userRoles []UserRoleModel) ([]UserRoleModel, error)
	UpdateUserRoles(ctx context.Context, userID int64, userRoles []int64) ([]UserRoleModel, error)
}

type roleRepository struct {
	databaseImpl.ConnManager
}

func NewRoleRepository(manager databaseImpl.ConnManager) *roleRepository {
	return &roleRepository{
		manager,
	}
}

func (r roleRepository) Add(ctx context.Context, model RoleModel) (int64, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("roles").
		Rows(databaseImpl.Record{
			"name":        model.Name,
			"description": model.Description,
		}).
		Returning("id").
		ToSQL()

	if err != nil {
		return 0, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := r.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&model.Id); err != nil {
		return 0, parseAddRoleError(&model, err)
	}

	return model.Id, nil
}

func (r roleRepository) GetRoleList(ctx context.Context, isSuper bool) ([]user.RoleModulesModel, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select(
			"r.id",
			"r.name",
			"r.description",
			goqu.Func("JSONB_AGG",
				goqu.Func("JSONB_BUILD_OBJECT",
					"module_id", goqu.I("m.id"),
					"module_name", goqu.I("m.name"),
					"module_description", goqu.I("m.description"),
					"read_only", goqu.I("m.read_only"),
				),
			),
		).
		From(goqu.T("roles").As("r")).
		InnerJoin(goqu.T("role_modules").As("rm"),
			goqu.On(goqu.Ex{"r.id": goqu.I("rm.id_role")})).
		InnerJoin(goqu.T("modules").As("m"),
			goqu.On(goqu.Ex{"rm.id_module": goqu.I("m.id")})).
		GroupBy("r.id").
		Order(goqu.I("r.id").Asc())

	if !isSuper {
		restrictedModules := make([]roles_modules.Modules, 4)
		restrictedModules = []roles_modules.Modules{
			roles_modules.UniqueCode,
			roles_modules.LoanManagement,
		}

		queryBuilder = queryBuilder.Where(goqu.Ex{"m.name": goqu.Op{"notIn": restrictedModules}})
	}

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetRoleList - sql", sql)

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	rows, err := r.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when Searching Users")
	}

	var result []user.RoleModulesModel
	for rows.Next() {
		var model user.RoleModulesModel

		err = rows.Scan(
			&model.RoleID,
			&model.RoleName,
			&model.RoleDescription,
			&model.Modules,
		)
		result = append(result, model)
	}

	return result, nil
}

func (r roleRepository) AddUserRoles(ctx context.Context, userRoles []UserRoleModel) ([]UserRoleModel, error) {
	userRoleRecoder := []databaseImpl.Record{}

	for _, userRole := range userRoles {
		userRoleRecoder = append(userRoleRecoder, databaseImpl.Record{
			"user_id": userRole.UserID,
			"role_id": userRole.RoleID,
		})
	}

	sql, _, err := databaseImpl.QueryBuilder.
		Insert("user_roles").
		Rows(userRoleRecoder).
		Returning("user_id", "role_id").
		ToSQL()

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	rows, err := r.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	results := []UserRoleModel{} // creating empty slice
	for rows.Next() {
		userRoleModel := UserRoleModel{} // creating new struct for every row
		err = rows.Scan(&userRoleModel.UserID, &userRoleModel.RoleID)
		if err != nil {
			log.Println(err)
		}
		results = append(results, userRoleModel) // add new row information
	}

	logger.ContextLogger(ctx).Info("", zap.Any("rows", rows))

	return results, nil
}

func (r roleRepository) UpdateUserRoles(ctx context.Context, userID int64, userRoles []int64) ([]UserRoleModel, error) {
	userRolesFormat := utils.ArrayToString(userRoles, ",")

	newValueInsert := []string{}
	for _, value := range userRoles {
		str := fmt.Sprintf("( %v, %v )", userID, value)
		newValueInsert = append(newValueInsert, str)
	}
	insertValueInsertString := strings.Join(newValueInsert, ",")

	sql := fmt.Sprintf("with new_data as ("+
		" INSERT INTO public.user_roles (user_id , role_id) "+
		" VALUES %v ON CONFLICT (\"user_id\", \"role_id\") DO NOTHING\n), "+
		" deleted_user_roles_data as ( "+
		" DELETE FROM public.user_roles urd WHERE urd.user_id = %v AND urd.role_id NOT IN ( %v ) ) "+
		" SELECT * FROM public.user_roles ur WHERE ur.user_id = %v ", insertValueInsertString, userID, userRolesFormat, userID)

	rows, err := r.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	results := []UserRoleModel{} // creating empty slice
	for rows.Next() {
		userRoleModel := UserRoleModel{} // creating new struct for every row
		err = rows.Scan(&userRoleModel.UserID, &userRoleModel.RoleID)
		if err != nil {
			log.Println(err)
		}
		results = append(results, userRoleModel) // add new row information
	}

	logger.ContextLogger(ctx).Info("", zap.Any("rows", rows))

	return results, nil
}

func parseAddRoleError(role *RoleModel, err error) error {
	pgError, isPgError := err.(*pgconn.PgError)

	if isPgError && pgError.Code == pgerrcode.UniqueViolation {
		switch pgError.ConstraintName {
		default:
			return errors.Wrapf(err, errors.DatabaseError, "add role failed")
		}
	}

	return errors.Wrapf(err, errors.DatabaseError, "add role failed")
}
