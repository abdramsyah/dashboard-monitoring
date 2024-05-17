package clients

import (
	"context"
	"fmt"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/logger"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"

	"sentadel-backend/internal/grade_management"
)

type ClientRepository interface {
	Create(ctx context.Context, model ClientModel) (*ClientModel, error)
	CreateBulkClientGrade(ctx context.Context, models []grade_management.GradeManagementModel) error
	DeleteClientGrade(ctx context.Context, clientId int64) error
	Update(ctx context.Context, model ClientModel) (*ClientModel, error)
	GetByID(ctx context.Context, userID int64) (*ClientModel, error)
	GetList(ctx context.Context, dto ClientListDto) ([]ClientModel, error)
	Delete(ctx context.Context, userID int64) (bool, error)
	CreateAddress(ctx context.Context, model AddressModel, userID int64) (bool, error)
	UpdateAddress(ctx context.Context, model AddressModel, userID int64) (bool, error)
}

type clientRepository struct {
	databaseImpl.ConnManager
}

func NewRoleRepository(manager databaseImpl.ConnManager) *clientRepository {
	return &clientRepository{
		manager,
	}
}

func (c clientRepository) Create(ctx context.Context, model ClientModel) (*ClientModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("clients").
		Rows(databaseImpl.Record{
			"client_name": model.ClientName,
			"code":        model.Code,
			"status":      model.Status,
			"company":     model.Company,
		}).
		Returning("id").
		ToSQL()

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := c.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&model.ID); err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	return &model, nil
}

func (c clientRepository) CreateBulkClientGrade(ctx context.Context, models []grade_management.GradeManagementModel) error {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("grades").
		Rows(models).
		ToSQL()

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	_, err = c.Conn(ctx).Exec(ctx, sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	return nil
}

func (c clientRepository) DeleteClientGrade(ctx context.Context, clientId int64) error {
	sql, _, err := databaseImpl.QueryBuilder.
		Delete("grades").
		Where(databaseImpl.Ex{"client_id": clientId}).
		Returning("id").
		ToSQL()

	if err != nil {
		return errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := c.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&clientId); err != nil {
		return errors.Wrap(err, errors.DatabaseError, "Error When Delete grade dictionary")
	}

	return nil
}

func (c clientRepository) Update(ctx context.Context, model ClientModel) (*ClientModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("clients").
		Set(databaseImpl.Record{
			"client_name": model.ClientName,
			"code":        model.Code,
			"status":      model.Status,
			"company":     model.Company,
		}).
		Where(databaseImpl.Ex{"id": model.ID}).
		Returning("id").
		ToSQL()

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := c.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&model.ID); err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	return &model, nil
}

func (c clientRepository) GetByID(ctx context.Context, clientID int64) (*ClientModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select("id",
			"client_name",
			"code",
			"status",
			"company",
			"created_at",
			"updated_at").
		From("clients").
		Where(databaseImpl.Ex{"id": clientID, "deleted_at": nil}).
		ToSQL()

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := c.Conn(ctx).QueryRow(ctx, sql)

	model := ClientModel{ID: clientID}

	err = row.Scan(
		&model.ID,
		&model.ClientName,
		&model.Code,
		&model.Status,
		&model.CreatedAt,
		&model.UpdatedAt,
	)

	if err != nil {
		return nil, errors.ParseError(ctx, err)
	}

	return &model, nil
}

func (c clientRepository) GetList(ctx context.Context, dto ClientListDto) ([]ClientModel, error) {
	shipmentAddress := goqu.Select(
		"sa.client_id",
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'id', sa.id,"+
			"	'address', sa.address"+
			") ORDER BY sa.id ASC)").As("address_list"),
	).From(goqu.T("shipment_address").As("sa")).
		GroupBy("sa.client_id")

	queryBuilder := databaseImpl.QueryBuilder.
		From("clients").
		Select("clients.id",
			"client_name",
			"code",
			"status",
			"company",
			"clients.created_at",
			"clients.updated_at",
			goqu.Func("array_remove", goqu.Func("array_agg", goqu.I("grades.grade")), nil).As("grade_list"),
			"ca.address_list",
			goqu.COUNT("*").Over(goqu.W())).
		With("client_address", shipmentAddress).
		LeftJoin(
			goqu.I("grades"),
			goqu.On(goqu.Ex{"clients.id": goqu.I("grades.client_id")})).
		LeftJoin(
			goqu.T("client_address").As("ca"),
			goqu.On(goqu.Ex{"clients.id": goqu.I("ca.client_id")})).
		GroupBy("clients.id", "ca.address_list")

	filterQuery := goqu.Ex{}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "client_name" {
				filterQuery["client_name"] = "%" + filter[1] + "%"
			}

			if filter[0] == "status" {
				filterQuery["status"] = strings.ToUpper(filter[1])
			}

			if filter[0] == "clients.deleted_at" {
				var op string
				if strings.ToUpper(filter[1]) == "NULL" {
					op = "is"
				} else {
					op = "isNot"
				}
				filterQuery["clients.deleted_at"] = goqu.Op{op: nil}
			}
		}
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"client_name":       goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"clients.client_id": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
		})
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	if len(dto.SortBy) > 0 {
		for _, val := range dto.SortBy {
			valSplit := strings.Split(val, " ")
			if len(valSplit[0]) < 1 {
				return nil, errors.New(errors.BadRequestError)
			}
			if len(valSplit) > 1 && strings.ToUpper(valSplit[1]) == "DESC" {
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

	fmt.Println("getClient - sql", sql)

	rows, err := c.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Clients")
	}

	clientModels := []ClientModel{}
	for rows.Next() {
		model := ClientModel{}
		err = rows.Scan(
			&model.ID,
			&model.ClientName,
			&model.Code,
			&model.Status,
			&model.Company,
			&model.CreatedAt,
			&model.UpdatedAt,
			&model.GradeList,
			&model.AddressList,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		clientModels = append(clientModels, model) // add new row information
	}

	return clientModels, nil
}

func (c clientRepository) Delete(ctx context.Context, clientID int64) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("clients").
		Set(databaseImpl.Record{
			"status":     constants.InActive,
			"deleted_at": time.Now(),
		}).
		Where(databaseImpl.Ex{"id": clientID}).
		Returning("id").
		ToSQL()

	if err != nil {
		return false, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := c.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&clientID); err != nil {
		return false, errors.Wrap(err, errors.DatabaseError, "Error When Delete User")
	}

	return true, nil
}

func (c clientRepository) CreateAddress(ctx context.Context, model AddressModel, userID int64) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("shipment_address").
		Rows(goqu.Record{
			"client_id":  model.ClientID,
			"address":    model.Address,
			"created_by": userID,
		}).
		Returning("id").
		ToSQL()

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	_, err = c.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Create Address", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Error when create address")
	}

	return true, nil
}

func (c clientRepository) UpdateAddress(ctx context.Context, model AddressModel, userID int64) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("shipment_address").
		Set(goqu.Record{
			"address":    model.Address,
			"created_by": userID,
		}).
		Where(goqu.Ex{"id": model.ID}).
		ToSQL()

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	_, err = c.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Create Address", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Error when create address")
	}

	return true, nil
}
