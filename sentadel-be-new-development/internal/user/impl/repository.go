package impl

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/logger"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgerrcode"
	"go.uber.org/zap"

	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/user"

	databaseImpl "sentadel-backend/internal/base/database/impl"
)

type UserRepositoryOpts struct {
	ConnManager databaseImpl.ConnManager
}

func NewUserRepository(opts UserRepositoryOpts) user.UserRepository {
	return &userRepository{
		ConnManager: opts.ConnManager,
	}
}

type userRepository struct {
	databaseImpl.ConnManager
}

func (r *userRepository) Add(ctx context.Context, model user.UserModel) (int64, error) {
	var modulesParam []goqu.Record
	var rolesParam []goqu.Record

	for _, module := range model.Modules {
		modulesParam = append(modulesParam, goqu.Record{
			"user_id":   goqu.Select("id").From("create_user"),
			"module_id": module.ModuleID,
		})
	}

	for _, role := range model.Roles {
		rolesParam = append(rolesParam, goqu.Record{
			"user_id": goqu.Select("id").From("create_user"),
			"role_id": role.RoleID,
		})
	}

	sql, _, err := databaseImpl.QueryBuilder.
		Insert("user_modules").
		Rows(modulesParam).
		Returning("user_id").
		With("create_user",
			goqu.Insert("users").
				Rows(databaseImpl.Record{
					"name":         model.Name,
					"number_id":    model.NumberID,
					"email":        model.Email,
					"phone_number": model.PhoneNumber,
					"password":     model.Password,
					"photo":        model.Photo,
					"status":       model.Status,
					"username":     model.Username,
				}).
				Returning("id")).
		With("create_user_roles",
			goqu.Insert("user_roles").
				Rows(rolesParam)).
		ToSQL()

	fmt.Println("Users Add - sql", sql)

	if err != nil {
		return 0, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := r.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&model.Id); err != nil {
		logger.GetLogger().Error("Error When Create User", zap.Error(err))
		return 0, parseAddUserError(&model, err)
	}

	return model.Id, nil
}

func (r *userRepository) Update(ctx context.Context, model user.UserModel) (int64, error) {
	var modulesParam []goqu.Record
	var rolesParam []goqu.Record

	for _, module := range model.Modules {
		modulesParam = append(modulesParam, goqu.Record{
			"user_id":   model.Id,
			"module_id": module.ModuleID,
		})
	}

	for _, role := range model.Roles {
		rolesParam = append(rolesParam, goqu.Record{
			"user_id": model.Id,
			"role_id": role.RoleID,
		})
	}

	sql, _, err := databaseImpl.QueryBuilder.
		Update("users").
		Set(databaseImpl.Record{
			"name":      model.Name,
			"number_id": model.NumberID,
			"username":  model.Username,
			"password":  model.Password,
			"email":     model.Email,
			"photo":     model.Photo,
			"status":    model.Status,
		}).
		Where(databaseImpl.Ex{"id": model.Id}).
		Returning("id").
		With("delete_user_roles",
			goqu.Delete("user_roles").
				Where(goqu.Ex{"user_id": model.Id})).
		With("delete_user_modules",
			goqu.Delete("user_modules").
				Where(goqu.Ex{"user_id": model.Id})).
		With("create_user_module",
			goqu.Insert("user_modules").
				Rows(modulesParam)).
		With("create_user_roles",
			goqu.Insert("user_roles").
				Rows(rolesParam)).
		ToSQL()

	fmt.Println("User Update - sql", sql)

	if err != nil {
		return 0, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := r.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&model.Id); err != nil {
		return 0, parseUpdateUserError(&model, err)
	}

	return model.Id, nil
}

func (r *userRepository) GetById(ctx context.Context, userId int64) (user.UserModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select("id",
			"number_id",
			"name",
			"email",
			"phone_number",
			"username",
			"password",
			goqu.Func("COALESCE", "photo", ""),
			"status",
			"created_at",
			"updated_at",
			"deleted_at").
		From("users").
		Where(databaseImpl.Ex{"id": userId}).
		ToSQL()

	if err != nil {
		logger.GetLogger().Error("Error Sntax User", zap.Error(err))
		return user.UserModel{}, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := r.Conn(ctx).QueryRow(ctx, sql)

	model := user.UserModel{Id: userId}

	err = row.Scan(
		&model.Id,
		&model.NumberID,
		&model.Name,
		&model.Email,
		&model.PhoneNumber,
		&model.Username,
		&model.Password,
		&model.Photo,
		&model.Status,
		&model.CreatedAt,
		&model.UpdatedAt,
		&model.DeletedAt,
	)

	if err != nil {
		return user.UserModel{}, parseGetUserByIdError(userId, err)
	}

	return model, nil
}

func (r *userRepository) Search(ctx context.Context, dto user.UserSearchDto, isSuper bool) (userModels []user.UserModel, err error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select("users.id",
			"users.number_id",
			"users.name",
			"users.email",
			"users.phone_number",
			"users.username",
			"users.status",
			goqu.Func("coalesce", goqu.I("users.photo"), ""),
			"users.created_at",
			"users.updated_at",
			goqu.Func("JSONB_AGG",
				goqu.Func("DISTINCT JSONB_BUILD_OBJECT",
					"role_id", goqu.I("roles.id"),
					"role_name", goqu.I("roles.name"),
					"role_description", goqu.I("roles.description"),
				)).As("roles"),
			goqu.Func("JSONB_AGG",
				goqu.Func("DISTINCT JSONB_BUILD_OBJECT",
					"module_id", goqu.I("modules.id"),
					"module_name", goqu.I("modules.name"),
					"module_description", goqu.I("modules.description"),
					"module_read_only", goqu.I("user_modules.read_only"),
				)).As("modules"),
			goqu.COUNT("*").Over(goqu.W()),
		).
		From("users").
		LeftJoin(goqu.I("user_roles"),
			goqu.On(goqu.Ex{"users.id": goqu.I("user_roles.user_id")})).
		LeftJoin(goqu.I("roles"),
			goqu.On(goqu.Ex{"user_roles.role_id": goqu.I("roles.id")})).
		LeftJoin(goqu.I("user_modules"),
			goqu.On(goqu.Ex{"users.id": goqu.I("user_modules.user_id")})).
		LeftJoin(goqu.I("modules"),
			goqu.On(goqu.Ex{"user_modules.module_id": goqu.I("modules.id")}))

	filterQuery := goqu.Ex{}

	if !isSuper {
		filterQuery["is_super"] = false
	}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "name" {
				filterQuery["users.name"] = "%" + filter[1] + "%"
			}

			if filter[0] == "status" {
				filterQuery["users.status"] = strings.ToUpper(filter[1])
			}

			if filter[0] == "role" {
				var paramsRole []string
				err = json.Unmarshal([]byte(filter[1]), &paramsRole)
				if err != nil {
					log.Println(err)
				}
				filterQuery["roles.name"] = goqu.Op{"in": paramsRole}
			}

			if filter[0] == "module" {
				var paramsModules []string
				err = json.Unmarshal([]byte(filter[1]), &paramsModules)
				if err != nil {
					log.Println(err)
				}
				filterQuery["modules.name"] = goqu.Op{"in": paramsModules}
			}
		}
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"users.name":         goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"users.number_id":    goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"users.email":        goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"users.username":     goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"users.phone_number": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
		})
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	queryBuilder = queryBuilder.GroupBy(goqu.I("users.id"))

	if len(dto.SortBy) > 0 {
		for _, val := range dto.SortBy {
			valSplit := strings.Split(val, " ")
			if len(valSplit[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if strings.ToUpper(valSplit[1]) == "DESC" {
				queryBuilder = queryBuilder.Order(goqu.I(valSplit[0]).Desc().NullsLast())
			} else {
				queryBuilder = queryBuilder.Order(goqu.I(valSplit[0]).Asc().NullsLast())
			}
		}
	} else {
		queryBuilder = queryBuilder.Order(goqu.I("id").Asc().NullsLast())
	}

	if dto.Limit > 0 {
		queryBuilder = queryBuilder.Limit(dto.Limit)
	}

	if dto.Page > 0 {
		queryBuilder = queryBuilder.Offset(((dto.Page - 1) * (dto.Limit)))
	}

	sql, _, _ := queryBuilder.ToSQL()

	fmt.Println("Users Search - sql", sql)

	rows, err := r.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when Searching Users")
	}
	defer rows.Close()

	for rows.Next() {
		model := user.UserModel{}
		err = rows.Scan(
			&model.Id,
			&model.NumberID,
			&model.Name,
			&model.Email,
			&model.PhoneNumber,
			&model.Username,
			&model.Status,
			&model.Photo,
			&model.CreatedAt,
			&model.UpdatedAt,
			&model.Roles,
			&model.Modules,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		userModels = append(userModels, model) // add new row information
	}

	return userModels, nil
}

func (u *userRepository) Delete(ctx context.Context, userID int64) (int64, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("users").
		Set(databaseImpl.Record{
			"status":     constants.InActive,
			"deleted_at": time.Now(),
		}).
		Where(databaseImpl.Ex{"id": userID}).
		Returning("id").
		ToSQL()

	if err != nil {
		logger.GetLogger().Error("Error Syntax Delete User", zap.Error(err))
		return 0, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := u.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&userID); err != nil {
		logger.GetLogger().Error("Error Delete User", zap.Error(err))
		return 0, errors.Wrap(err, errors.DatabaseError, "Error When Delete User")
	}

	return userID, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (user.UserModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select(
			"id",
			"number_id",
			"name",
			"username",
			"password",
			"status",
			"email",
		).
		From("users").
		Where(databaseImpl.Ex{"email": email}).
		ToSQL()

	if err != nil {
		return user.UserModel{}, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := r.Conn(ctx).QueryRow(ctx, sql)

	model := user.UserModel{Email: email}

	err = row.Scan(
		&model.Id,
		&model.NumberID,
		&model.Name,
		&model.Username,
		&model.Password,
		&model.Status,
		&model.Email,
	)

	if err != nil {
		logger.GetLogger().Error("Error Get By Email User", zap.Error(err))
		return user.UserModel{}, parseGetUserByEmailError(email, err)
	}

	return model, nil
}

func (r *userRepository) GetUserRolesAndPermissionsByUsername(ctx context.Context, username string) (user.UserModelLogin, error) {
	sql, _, err := goqu.Select(
		"u.id",
		"u.name",
		"u.username",
		"u.password",
		"u.status",
		"u.is_super",
		"u.able_to_login",
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"'role_id', urm.id,"+
			"'role_name', urm.name,"+
			"'role_description', urm.description,"+
			"'modules', urm.modules"+
			") ORDER BY urm.id ASC)")).
		From(goqu.T("user_by_email").As("u")).
		InnerJoin(goqu.T("user_roles_modules").As("urm"),
			goqu.On(goqu.Ex{"u.id": goqu.I("urm.user_id")})).
		GroupBy("u.id", "u.name", "u.username", "u.password", "u.status", "u.is_super", "u.able_to_login").
		With("user_by_email",
			goqu.Select("*").
				From("users").
				Where(goqu.Ex{"username": username})).
		With("user_roles_modules",
			goqu.Select(
				goqu.I("ube.id").As("user_id"),
				"r.id",
				"r.name",
				"r.description",
				goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
					"'module_id', m.id,"+
					"'module_name', m.name,"+
					"'module_description', m.description,"+
					"'module_read_only', m.read_only"+
					") ORDER BY m.id ASC)").As("modules")).
				From(goqu.T("user_roles").As("ur")).
				InnerJoin(goqu.T("roles").As("r"),
					goqu.On(goqu.I("ur.role_id").Eq(goqu.I("r.id")))).
				InnerJoin(goqu.T("user_modules").As("um"),
					goqu.On(goqu.I("ur.user_id").Eq(goqu.I("um.user_id")))).
				InnerJoin(goqu.T("modules").As("m"),
					goqu.On(goqu.I("um.module_id").Eq(goqu.I("m.id")))).
				InnerJoin(goqu.T("role_modules").As("rm"),
					goqu.On(goqu.Ex{
						"m.id": goqu.I("rm.id_module"),
						"r.id": goqu.I("rm.id_role"),
					})).
				InnerJoin(goqu.T("user_by_email").As("ube"),
					goqu.On(goqu.I("ur.user_id").Eq(goqu.I("ube.id")))).
				Where(goqu.Ex{"um.module_id": goqu.Op{"neq": nil}}).
				GroupBy("r.id", "ube.id")).
		ToSQL()

	fmt.Println("GetUserRolesAndPermissionsByUsername - sql", sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return user.UserModelLogin{}, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := r.Conn(ctx).QueryRow(ctx, sql)

	model := user.UserModelLogin{Email: username}

	err = row.Scan(
		&model.Id,           // used
		&model.Name,         // used
		&model.Username,     // used
		&model.Password,     // used
		&model.Status,       // used
		&model.IsSuper,      // used
		&model.AbleToLogin,  // used
		&model.RolesModules, // used
	)

	if err != nil {
		logger.GetLogger().Error("Error GetUserRolesAndPermissionsByUsername", zap.Error(err))

		return user.UserModelLogin{}, parseGetUserByEmailError(username, err)
	}

	return model, nil
}

func (r *userRepository) GetUserRolesByUserID(ctx context.Context, userID int64) (result []string, err error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select(
			goqu.Func("array_agg", goqu.I("roles.name"))).
		From("user_roles").
		LeftJoin(goqu.I("roles"), goqu.On(goqu.Ex{"user_roles.role_id": goqu.I("roles.id")})).
		Where(databaseImpl.Ex{"user_roles.user_id": userID}).
		ToSQL()

	row := r.Conn(ctx).QueryRow(ctx, sql)

	err = row.Scan(
		&result,
	)

	if err != nil {
		return result, parseGetUserByEmailError(string(userID), err)
	}

	return result, nil
}

func parseAddUserError(user *user.UserModel, err error) error {
	pgError, isPgError := err.(*pgconn.PgError)

	if isPgError && pgError.Code == pgerrcode.UniqueViolation {
		switch pgError.ConstraintName {
		case "users_email_key":
			return errors.Wrapf(err, errors.AlreadyExistsError, "user with email \"%s\" already exists", user.Email)
		default:
			return errors.Wrapf(err, errors.DatabaseError, "add user failed")
		}
	}

	return errors.Wrapf(err, errors.DatabaseError, "add user failed")
}

func parseUpdateUserError(user *user.UserModel, err error) error {
	pgError, isPgError := err.(*pgconn.PgError)

	if isPgError && pgError.Code == pgerrcode.UniqueViolation {
		return errors.Wrapf(err, errors.AlreadyExistsError, "user with email \"%s\" already exists", user.Email)
	}

	return errors.Wrapf(err, errors.DatabaseError, "update user failed")
}

func parseGetUserByIdError(userId int64, err error) error {
	pgError, isPgError := err.(*pgconn.PgError)

	if isPgError && pgError.Code == pgerrcode.NoDataFound {
		return errors.Wrapf(err, errors.NotFoundError, "user with id \"%d\" not found", userId)
	}
	if err.Error() == "no rows in result set" {
		return errors.Wrapf(err, errors.NotFoundError, "user with id \"%d\" not found", userId)
	}

	return errors.Wrap(err, errors.DatabaseError, "get user by id failed")
}

func parseGetUserByEmailError(email string, err error) error {
	pgError, isPgError := err.(*pgconn.PgError)

	if isPgError && pgError.Code == pgerrcode.NoDataFound {
		return errors.Wrapf(err, errors.NotFoundError, "user with email \"%s\" not found", email)
	}
	if err.Error() == "no rows in result set" {
		return errors.Wrapf(err, errors.NotFoundError, "user with email \"%s\" not found", email)
	}

	return errors.Wrap(err, errors.DatabaseError, "get user by email failed")
}
