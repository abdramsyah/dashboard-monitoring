package partnership

import (
	"context"
	"fmt"
	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"
	"strings"
)

type PartnershipRepository interface {
	AddNewPartner(ctx context.Context, model ManagePartnerRequestModel) (bool, error)
	UpdatePartner(ctx context.Context, model ManagePartnerRequestModel) (bool, error)
	GetByID(ctx context.Context, id int64) (*PartnerModel, error)
	GetGroupedPartners(ctx context.Context, dto GetPartnerListDto) (res []GroupedPartnerListModel, err error)
	GetPartners(ctx context.Context, dto GetPartnerListDto) (res []PartnerModel, err error)
}

type partnershipRepository struct {
	databaseImpl.ConnManager
}

func NewPartnershipRepository(conn databaseImpl.ConnManager) *partnershipRepository {
	return &partnershipRepository{
		conn,
	}
}

func (psr partnershipRepository) AddNewPartner(ctx context.Context, model ManagePartnerRequestModel) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("partnership").
		Rows(goqu.Record{
			"name":           model.Name,
			"quota":          model.Quota,
			"coordinator_id": model.CoordinatorID,
		}).
		ToSQL()

	fmt.Println("AddNewPartner - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Add new partner error")
	}

	_, err = psr.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Add new partner error")
	}

	return true, nil
}

func (psr partnershipRepository) UpdatePartner(ctx context.Context, model ManagePartnerRequestModel) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("partnership").
		Set(goqu.Record{
			"name":           model.Name,
			"quota":          model.Quota,
			"coordinator_id": model.CoordinatorID,
		}).
		Where(goqu.Ex{"id": model.PartnerID}).
		ToSQL()

	fmt.Println("UpdatePartner - sql", sql)
	if err != nil {
		return false, errors.Wrap(err, errors.DatabaseError, "Create Grade Information Query Error")
	}

	_, err = psr.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		return false, errors.Wrap(err, errors.DatabaseError, "Error when try to create grade information")
	}

	return true, nil
}

func (psr partnershipRepository) GetByID(ctx context.Context, id int64) (*PartnerModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select("id",
			"name",
			"quota",
			"coordinator_id",
		).
		From("partnership").
		Where(goqu.Ex{"id": id, "deleted_at": nil}).
		ToSQL()

	fmt.Println("GetByID - sql", sql)

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := psr.Conn(ctx).QueryRow(ctx, sql)

	model := PartnerModel{}

	err = row.Scan(
		&model.PartnerID,
		&model.PartnerName,
		&model.PartnerQuota,
		&model.CoordinatorID,
	)

	if err != nil {
		return nil, errors.New(errors.BadRequestError)
	}

	return &model, nil
}

func (psr partnershipRepository) GetGroupedPartners(ctx context.Context, dto GetPartnerListDto) (res []GroupedPartnerListModel, err error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select("c.id",
			"u.name",
			"c.code",
			goqu.COALESCE(goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
				"	'partner_id', ps.id,"+
				"	'partner_name', ps.name,"+
				"	'partner_quota', ps.quota"+
				") ORDER BY ps.name ASC)")),
			goqu.COUNT("*").Over(goqu.W()),
		).
		From(goqu.T("coordinators").As("c")).
		InnerJoin(goqu.T("partnership").As("ps"),
			goqu.On(goqu.Ex{"c.id": goqu.I("ps.coordinator_id")})).
		InnerJoin(goqu.T("users").As("u"),
			goqu.On(goqu.Ex{"c.user_id": goqu.I("u.id")})).
		GroupBy("c.id", "u.id")

	filterQuery := goqu.Ex{
		"c.deleted_at": nil,
		"u.deleted_at": nil,
	}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "coordinator_id" {
				filterArg := strings.Split(filter[1], ",")
				filterQuery["c.id"] = goqu.Op{"in": filterArg}
			}
		}
	}

	if len(dto.SortBy) > 0 {
		for _, sortVal := range dto.SortBy {
			sort := strings.Split(sortVal, ":")
			if len(sort[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if sort[0] == "coordinator_name" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.I("u.name").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("u.name").Desc())
				}
			}
		}
	} else {
		queryBuilder = queryBuilder.Order(goqu.MAX(goqu.I("u.name")).Asc())
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"u.name":  goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"ps.name": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"c.code":  goqu.Op{"ilike": "%" + dto.Keyword + "%"},
		})
	}

	if dto.Limit > 0 {
		queryBuilder = queryBuilder.Limit(dto.Limit)
	}

	if dto.Page > 0 {
		queryBuilder = queryBuilder.Offset((dto.Page - 1) * (dto.Limit))
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetGroupedPartners - sql", sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Create Grade Information Query Error")
	}

	rows, err := psr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to create grade information")
	}

	for rows.Next() {
		var model GroupedPartnerListModel
		err = rows.Scan(
			&model.CoordinatorID,
			&model.CoordinatorName,
			&model.CoordinatorCode,
			&model.PartnerData,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		res = append(res, model) // add new row information
	}

	return res, nil
}

func (psr partnershipRepository) GetPartners(ctx context.Context, dto GetPartnerListDto) (res []PartnerModel, err error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select("ps.id",
			"ps.name",
			"ps.quota",
			"c.id",
			"u.name",
			"c.code",
			goqu.COUNT("*").Over(goqu.W()),
		).
		From(goqu.T("partnership").As("ps")).
		InnerJoin(goqu.T("coordinators").As("c"),
			goqu.On(goqu.Ex{"ps.coordinator_id": goqu.I("c.id")})).
		InnerJoin(goqu.T("users").As("u"),
			goqu.On(goqu.Ex{"c.user_id": goqu.I("u.id")})).
		GroupBy("ps.id", "c.id", "u.id")

	filterQuery := goqu.Ex{
		"c.deleted_at": nil,
		"u.deleted_at": nil,
	}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "coordinator_id" {
				filterArg := strings.Split(filter[1], ",")
				filterQuery["c.id"] = goqu.Op{"in": filterArg}
			}
			if filter[0] == "coordinator_user_id" {
				filterQuery["u.id"] = goqu.V(filter[1])
			}
		}
	}

	if len(dto.SortBy) > 0 {
		for _, sortVal := range dto.SortBy {
			sort := strings.Split(sortVal, ":")
			if len(sort[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if sort[0] == "coordinator_name" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.I("u.name").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("u.name").Desc())
				}
			}
		}
	} else {
		queryBuilder = queryBuilder.Order(goqu.MAX(goqu.I("ps.name")).Asc())
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"u.name":  goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"ps.name": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"c.code":  goqu.Op{"ilike": "%" + dto.Keyword + "%"},
		})
	}

	if dto.Limit > 0 {
		queryBuilder = queryBuilder.Limit(dto.Limit)
	}

	if dto.Page > 0 {
		queryBuilder = queryBuilder.Offset((dto.Page - 1) * (dto.Limit))
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetPartners - sql", sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Create Grade Information Query Error")
	}

	rows, err := psr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to create grade information")
	}

	for rows.Next() {
		var model PartnerModel
		err = rows.Scan(
			&model.PartnerID,
			&model.PartnerName,
			&model.PartnerQuota,
			&model.CoordinatorID,
			&model.CoordinatorName,
			&model.CoordinatorCode,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		res = append(res, model) // add new row information
	}

	return res, nil
}
