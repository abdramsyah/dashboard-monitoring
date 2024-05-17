package coordinator

import (
	"context"
	"fmt"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/models"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
)

type CoordinatorRepository interface {
	Create(ctx context.Context, model CoordinatorModel) (*CoordinatorModel, error)
	Update(ctx context.Context, model CoordinatorModel) (*CoordinatorModel, error)
	Delete(ctx context.Context, id int64) (bool, error)
	GetList(ctx context.Context, dto models.SearchRequest) ([]CoordinatorModel, error)
	GetByUserID(ctx context.Context, id int64) (*CoordinatorModel, error)
	GetByID(ctx context.Context, id int64) (*CoordinatorModel, error)

	MarkAsPaidCoordinator(ctx context.Context, invoiceId int64, userId int64) (response bool, err error)
}

type coordinatorRepository struct {
	databaseImpl.ConnManager
}

func NewRepository(manager databaseImpl.ConnManager) *coordinatorRepository {
	return &coordinatorRepository{
		manager,
	}
}

func (g coordinatorRepository) GetByUserID(ctx context.Context, id int64) (*CoordinatorModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select("id",
			"user_id",
			"net_weight",
			"code",
			"created_at",
			"updated_at").
		From("coordinators").
		Where(databaseImpl.Ex{"user_id": id}).
		ToSQL()

	fmt.Println("GetByUserID - sql", sql)

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := g.Conn(ctx).QueryRow(ctx, sql)

	model := CoordinatorModel{UserID: id}

	err = row.Scan(
		&model.ID,
		&model.UserID,
		&model.Code,
		&model.CreatedAt,
		&model.UpdatedAt,
	)

	if err != nil {
		return nil, errors.ParseError(ctx, err)
	}

	return &model, nil
}

func (g coordinatorRepository) GetByID(ctx context.Context, id int64) (*CoordinatorModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select("id",
			"user_id",
			"quota",
			"code",
			"created_at",
			"updated_at").
		From("coordinators").
		Where(databaseImpl.Ex{"id": id, "deleted_at": nil}).
		ToSQL()

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := g.Conn(ctx).QueryRow(ctx, sql)

	model := CoordinatorModel{ID: id}

	err = row.Scan(
		&model.ID,
		&model.UserID,
		&model.Quota,
		&model.Code,
		&model.CreatedAt,
		&model.UpdatedAt,
	)

	if err != nil {
		return nil, errors.New(errors.BadRequestError)
	}

	return &model, nil
}

func (g coordinatorRepository) Create(ctx context.Context, model CoordinatorModel) (*CoordinatorModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("coordinators").
		Rows(databaseImpl.Record{
			"user_id": model.UserID,
			"quota":   model.Quota,
			"code":    model.Code,
		}).
		Returning("id").
		ToSQL()

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := g.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&model.ID); err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	return &model, nil
}

func (c coordinatorRepository) Update(ctx context.Context, model CoordinatorModel) (*CoordinatorModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("coordinators").
		Set(databaseImpl.Record{
			"code":  model.Code,
			"quota": model.Quota,
		}).
		Where(databaseImpl.Ex{"id": model.ID}).
		Returning("id").
		ToSQL()

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.New(errors.BadRequestError)
	}

	row := c.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&model.ID); err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.New(errors.BadRequestError)
	}

	return &model, nil
}

func (c coordinatorRepository) Delete(ctx context.Context, id int64) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("coordinators").
		Set(databaseImpl.Record{
			"deleted_at": time.Now(),
		}).
		Where(databaseImpl.Ex{"id": id}).
		Returning("id").
		ToSQL()

	fmt.Println(sql)
	if err != nil {
		return false, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := c.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&id); err != nil {
		return false, errors.Wrap(err, errors.DatabaseError, "Error When Delete coordinators")
	}

	return true, nil
}

func (g coordinatorRepository) GetList(ctx context.Context, dto models.SearchRequest) ([]CoordinatorModel, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select("coordinators.id",
			"users.id",
			"users.number_id",
			"users.name",
			"coordinators.code",
			"coordinators.quota",
			"coordinators.created_at",
			"coordinators.updated_at",
			goqu.COUNT("*").Over(goqu.W()),
		).
		From("coordinators").
		InnerJoin(goqu.I("users"), goqu.On(goqu.Ex{"coordinators.user_id": goqu.I("users.id")}))

	filterQuery := goqu.Ex{
		"users.deleted_at":        nil,
		"coordinators.deleted_at": nil,
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
		}
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"users.name": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
		})
	}

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
	}

	if dto.Limit > 0 {
		queryBuilder = queryBuilder.Limit(dto.Limit)
	}

	if dto.Page > 0 {
		queryBuilder = queryBuilder.Offset(((dto.Page - 1) * (dto.Limit)))
	}

	sql, _, _ := queryBuilder.ToSQL()

	fmt.Println("GetListCoordinatorMgmt - sql", sql)

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Coordinator Repistory Get List", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Coordinators")
	}

	coordinatorList := []CoordinatorModel{}
	for rows.Next() {
		model := CoordinatorModel{}
		err = rows.Scan(
			&model.ID,
			&model.UserID,
			&model.CoordinatorNumber,
			&model.Name,
			&model.Code,
			&model.Quota,
			&model.CreatedAt,
			&model.UpdatedAt,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		coordinatorList = append(coordinatorList, model) // add new row information
	}

	return coordinatorList, nil
}

func (g coordinatorRepository) MarkAsPaidCoordinator(ctx context.Context, invoiceId int64, userId int64) (response bool, err error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Insert("invoices_status").
		Rows(databaseImpl.Record{
			"invoice_id": invoiceId,
			"status":     constants.InvoiceConfirmedByCoordinator,
			"created_by": userId,
		})

	sql, _, err := queryBuilder.ToSQL()
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	_, err = g.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	return true, nil
}
