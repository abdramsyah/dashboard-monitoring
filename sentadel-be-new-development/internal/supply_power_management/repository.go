package supply_power_management

import (
	"context"
	"fmt"
	"go.uber.org/zap"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/models"
)

type PowerSupplyManagementRepository interface {
	GetList(ctx context.Context, dto models.SearchRequest) ([]PowerSupplyModel, error)
	GetRecap(ctx context.Context) (*PowerSupplyModel, error)
}

type powerSupplyManagementRepository struct {
	databaseImpl.ConnManager
}

type PowerSupplyManagementRepositoryOpts struct {
	ConnManager databaseImpl.ConnManager
}

func NewPowerSupplyManagementRepository(opts PowerSupplyManagementRepositoryOpts) *powerSupplyManagementRepository {
	return &powerSupplyManagementRepository{
		opts.ConnManager,
	}
}

func (psr powerSupplyManagementRepository) GetList(ctx context.Context, dto models.SearchRequest) ([]PowerSupplyModel, error) {
	sql := "with supply(grade, filled) as ( "
	sql += "	select gd2.id, sum(wi.net_weight) / 1000 from weight_information wi "
	sql += "	inner join goods_information gi on wi.goods_information_id = gi.id "
	sql += "	inner join approval_statuses as2 on gi.id = as2.goods_information_id "
	sql += "	inner join grade_management gd2 on gi.grade_id = gd2.id "
	sql += "	where (wi.deleted_at is null "
	sql += "	and gi.deleted_at is null "
	sql += "	and gd2.deleted_at is null "
	sql += "	and as2.deleted_at is null) "
	sql += "	group by gd2.id "
	sql += ") "
	sql += "select c.client_id, c.code as client_code, c.client_name, gd.quota, "
	sql += "gd.company_grade, gd.client_grade, case "
	sql += "	when sp.filled is null then 0 "
	sql += "	when sp.filled is not null then sp.filled "
	sql += "end as supply_filled, "
	sql += "case "
	sql += "	when sp.filled is null then gd.quota "
	sql += "	when sp.filled is not null then gd.quota - sp.filled "
	sql += "end as remaining_supply, COUNT(*) OVER () "
	sql += "from clients c "
	sql += "inner join grade_management gd on c.id = gd.client_id "
	sql += "left join supply sp on gd.id = sp.grade "
	sql += "where (c.deleted_at is null) "
	sql += "order by  c.client_id asc "
	sql += "limit $1 offset $2 "

	fmt.Println("GetQueueList - sql", sql)

	newRows, err := psr.Conn(ctx).Query(ctx, sql, dto.Limit, (dto.Page-1)*dto.Limit)

	models := []PowerSupplyModel{}
	for newRows.Next() {
		model := PowerSupplyModel{}
		if err := newRows.Scan(
			&model.ClientID,
			&model.ClientCode,
			&model.ClientName,
			&model.Quota,
			&model.CompanyGrade,
			&model.ClientGrade,
			&model.SupplyFilled,
			&model.RemainingSupply,
			&model.Total,
		); err != nil {
			logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
			return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
		}
		models = append(models, model) // add new row information
	}

	if err != nil {
		return nil, errors.New(errors.BadRequestError)
	}

	return models, nil
}

func (psr powerSupplyManagementRepository) GetRecap(ctx context.Context) (*PowerSupplyModel, error) {
	sql := "with supply(grade, filled) as ( "
	sql += "	select gd2.id, sum(wi.net_weight) from weight_information wi "
	sql += "	inner join goods_information gi on wi.goods_information_id = gi.id "
	sql += "	inner join approval_statuses as2 on gi.id = as2.goods_information_id "
	sql += "	inner join grade_management gd2 on gi.grade_id = gd2.id "
	sql += "	where (wi.deleted_at is null "
	sql += "	and gi.deleted_at is null "
	sql += "	and gd2.deleted_at is null "
	sql += "	and as2.deleted_at is null) "
	sql += "	group by gd2.id "
	sql += ") "
	sql += "select sum(gd.quota) as quota, "
	sql += "coalesce(sum(sp.filled), 0) as supply_filled "
	sql += "from clients c "
	sql += "inner join grade_management gd on c.id = gd.client_id "
	sql += "left join supply sp on gd.id = sp.grade "
	sql += "where (c.deleted_at is null "
	sql += "and gd.deleted_at is null ) "

	fmt.Println("GetQueueList - sql", sql)

	row := psr.Conn(ctx).QueryRow(ctx, sql)

	model := PowerSupplyModel{}
	if err := row.Scan(
		&model.Quota,
		&model.SupplyFilled,
	); err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	return &model, nil
}
