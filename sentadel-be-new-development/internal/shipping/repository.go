package shipping

import (
	"context"
	"fmt"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/models"
	"strconv"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
)

type ShippingRepository interface {
	getGroupCode(ctx context.Context, clientCode string) (invNumber *string, err error)
	CreateShipping(ctx context.Context, clientId int64, addressId int64, groupCode string) (response *int64, err error)
	CreateShippingGroup(ctx context.Context, shippingId int64, groupingList ReqShippingGroupDto) (response bool, err error)
	GetList(ctx context.Context, dto models.SearchRequest) ([]ShippingList, error)
	GetAddress(ctx context.Context, clientId int64) ([]AddressList, error)
	GetDetail(ctx context.Context, shippingId int64) (ShippingDetail, error)
	DeleteShippingList(ctx context.Context, shippingId int64) (response bool, err error)
	UpdateAsShip(ctx context.Context, shippingId int64) (response bool, err error)
}

type shippingRepository struct {
	databaseImpl.ConnManager
}

func NewRepository(manager databaseImpl.ConnManager) *shippingRepository {
	return &shippingRepository{
		manager,
	}
}

func (g *shippingRepository) getGroupCode(ctx context.Context, clientCode string) (invNumber *string, err error) {
	currentYear := time.Now().Year()
	rawCondition := goqu.L("date_part('year', created_at)::int = ? AND group_code LIKE ?", currentYear, clientCode+"%")
	sql, _, err := databaseImpl.QueryBuilder.
		Select("group_code").
		From("shipping").
		Where(rawCondition).
		Order(goqu.I("id").Desc().NullsLast()).
		Limit(1).
		ToSQL()
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	var invoiceNumber string
	row, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}
	defer row.Close()
	if !row.Next() {
		invoiceNumber = fmt.Sprintf("%s000", clientCode)
	}
	row.Scan(&invoiceNumber)
	num, err := strconv.Atoi(strings.Replace(invoiceNumber, clientCode, "1", 1))
	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Inv Number", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}
	num++
	pasrseNum := fmt.Sprintf("%d", num)
	invNumberNew := strings.Replace(pasrseNum, "1", clientCode, 1)

	fmt.Println(invNumberNew)
	invNumber = &invNumberNew
	return invNumber, nil
}

func (g *shippingRepository) CreateShipping(ctx context.Context, clientId int64, addressId int64, groupCode string) (response *int64, err error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("shipping").
		Rows(databaseImpl.Record{
			"client_id":  clientId,
			"group_code": groupCode,
			"address_id": addressId,
		}).
		Returning("id").
		ToSQL()

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}
	var shippingId int64
	err = g.Conn(ctx).QueryRow(ctx, sql).Scan(&shippingId)

	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	return &shippingId, nil
}

func (g *shippingRepository) CreateShippingGroup(ctx context.Context, shippingId int64, groupingList ReqShippingGroupDto) (response bool, err error) {
	var data []databaseImpl.Record
	for _, groupId := range groupingList.ClientGroupId {
		data = append(data, databaseImpl.Record{
			"shipping_id":     shippingId,
			"client_group_id": groupId,
		})
	}
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("shipping_group").
		Rows(data).
		ToSQL()

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

func (g *shippingRepository) GetList(ctx context.Context, dto models.SearchRequest) ([]ShippingList, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select("shipping.id",
			"shipping.group_code",
			goqu.I("shipping.client_id"),
			goqu.I("clients.client_name"),
			"shipping.group_number",
			"addresses.address",
			"shipping.send_status",
			"shipping.created_at",
			goqu.COUNT("*").Over(goqu.W()),
		).
		From("shipping").
		Join(
			goqu.T("clients"),
			goqu.On(goqu.I("shipping.client_id").Eq(goqu.I("clients.id")))).
		Join(
			goqu.T("addresses"),
			goqu.On(goqu.I("shipping.address_id").Eq(goqu.I("addresses.id"))))

	filterQuery := goqu.Ex{
		"shipping.deleted_at": nil,
	}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "client_id" {
				filterQuery["clients.id"] = filter[1]
			}
		}
	}

	if dto.StartDate != "" {
		startDate, err := time.Parse("2006-01-02 15:04:05", dto.StartDate+" 00:00:00")
		if err != nil {
			logger.ContextLogger(ctx).Error("Error parsing date", zap.Error(err))
			return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Data Table")
		}

		endDate, err := time.Parse("2006-01-02 15:04:05", dto.StartDate+" 23:59:59")
		if err != nil {
			logger.ContextLogger(ctx).Error("Eroor parsing date", zap.Error(err))
			return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Data Table")
		}
		filterQuery["shipping.created_at"] = goqu.Op{
			"between": goqu.Range(startDate, endDate),
		}
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"clients.client_name": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"shipping.group_code": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
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

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Grouping Get List", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Grouping")
	}

	groupingList := []ShippingList{}
	for rows.Next() {
		model := ShippingList{}
		err = rows.Scan(
			&model.Id,
			&model.GroupCode,
			&model.ClientID,
			&model.ClientName,
			&model.ClientGroupNumber,
			&model.Address,
			&model.Send,
			&model.CreatedAt,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		groupingList = append(groupingList, model) // add new row information
	}

	return groupingList, nil
}

func (g *shippingRepository) GetAddress(ctx context.Context, clientId int64) ([]AddressList, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select("id",
			"address",
		).
		From("addresses").
		Where(goqu.I("client_id").Eq(clientId))

	filterQuery := goqu.Ex{
		"deleted_at": nil,
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	sql, _, _ := queryBuilder.ToSQL()

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Grouping Get List", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Grouping")
	}

	groupingList := []AddressList{}
	for rows.Next() {
		model := AddressList{}
		err = rows.Scan(
			&model.Id,
			&model.Address,
		)

		if err != nil {
			log.Println(err)
		}

		groupingList = append(groupingList, model) // add new row information
	}

	return groupingList, nil
}

func (g *shippingRepository) GetDetail(ctx context.Context, shippingId int64) (ShippingDetail, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select("shipping.id",
			"shipping.group_code",
			goqu.I("shipping.client_id"),
			goqu.I("clients.client_name"),
			"shipping.group_number",
			"addresses.address",
			"shipping.send_status",
		).
		From("shipping").
		Join(
			goqu.T("clients"),
			goqu.On(goqu.I("shipping.client_id").Eq(goqu.I("clients.id")))).
		Join(
			goqu.T("addresses"),
			goqu.On(goqu.I("shipping.address_id").Eq(goqu.I("addresses.id")))).
		Where(goqu.Ex{"shipping.id": shippingId})

	sql, _, _ := queryBuilder.ToSQL()
	fmt.Println("GetDetail - sql", sql)

	row := g.Conn(ctx).QueryRow(ctx, sql)

	model := ShippingDetail{}
	err := row.Scan(
		&model.Id,
		&model.GroupCode,
		&model.ClientID,
		&model.ClientName,
		&model.ClientGroupNumber,
		&model.Address,
		&model.Send,
	)

	if err != nil {
		logger.ContextLogger(ctx).Error("Grouping Detail", zap.Error(err))
		return ShippingDetail{}, errors.Wrap(err, errors.DatabaseError, "Error when Detail Grouping")
	}

	return model, nil
}

func (g *shippingRepository) DeleteShippingList(ctx context.Context, shippingId int64) (response bool, err error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Delete("shipping_group").
		Where(goqu.I("shipping_id").Eq(shippingId)).
		ToSQL()

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

func (g *shippingRepository) UpdateAsShip(ctx context.Context, shippingId int64) (response bool, err error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("shipping").
		Set(databaseImpl.Ex{
			"send_status": true,
			"send_at":     time.Now(),
		}).
		Where(databaseImpl.Ex{"id": shippingId}).
		ToSQL()

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
