package tax_and_fee

import (
	"context"
	"fmt"
	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/models"
	"time"
)

type TaxAndFeeRepository interface {
	GetTaxList(ctx context.Context, dto models.SearchRequest) ([]TaxModel, error)
	GetFeeList(ctx context.Context, dto models.SearchRequest) ([]FeeModel, error)
	SetNewTax(ctx context.Context, newTax NewTaxReqParams, userID int64) (bool, error)
	SetNewFee(ctx context.Context, newTax NewFeeReqParams, userID int64) (bool, error)
	CheckInvoiceBeforeSetNewTaxOrFee(ctx context.Context) (bool, error)
}

type taxAndFeeRepository struct {
	databaseImpl.ConnManager
}

type TaxAndFeeRepositoryOpts struct {
	ConnManager databaseImpl.ConnManager
}

func NewTaxAndFeeRepository(opts TaxAndFeeRepositoryOpts) *taxAndFeeRepository {
	return &taxAndFeeRepository{
		opts.ConnManager,
	}
}

func (tfr taxAndFeeRepository) GetTaxList(ctx context.Context, dto models.SearchRequest) ([]TaxModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select(
			"tax.id",
			"tax.tax_name",
			"tax.value",
			"tax.created_at",
			"tax.deleted_at",
			goqu.COUNT("*").Over(goqu.W()),
		).
		From("tax").
		//InnerJoin(goqu.T("users").As("u1"),
		//	goqu.On(goqu.I("tax.created_by").Eq(goqu.I("u1.id")))).
		//InnerJoin(goqu.T("users").As("u2"),
		//	goqu.On(goqu.I("tax.deleted_by").Eq(goqu.I("u2.id")))).
		Order(goqu.C("created_at").Desc()).
		Limit(dto.Limit).
		Offset((dto.Page - 1) * dto.Limit).
		ToSQL()

	fmt.Println("GetTaxList - sql", sql)

	rows, err := tfr.Conn(ctx).Query(ctx, sql)
	fmt.Println("GetTaxList - err", err)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	var taxList []TaxModel
	for rows.Next() {
		model := TaxModel{}
		if err := rows.Scan(
			&model.ID,
			&model.TaxType,
			&model.Tax,
			&model.ActiveFrom,
			&model.ActiveTo,
			&model.Total,
		); err != nil {
			logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
			return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
		}
		taxList = append(taxList, model) // add new row information
	}

	if err != nil {
		return nil, errors.New(errors.BadRequestError)
	}

	return taxList, nil
}

func (tfr taxAndFeeRepository) GetFeeList(ctx context.Context, dto models.SearchRequest) ([]FeeModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select(
			"fee_scheme.id",
			"fee_scheme.fee_name",
			"fee_scheme.value",
			"fee_scheme.created_at",
			"fee_scheme.deleted_at",
			goqu.COUNT("*").Over(goqu.W()),
		).
		From("fee_scheme").
		//InnerJoin(goqu.T("users").As("u1"),
		//	goqu.On(goqu.I("tax.created_by").Eq(goqu.I("u1.id")))).
		//InnerJoin(goqu.T("users").As("u2"),
		//	goqu.On(goqu.I("tax.deleted_by").Eq(goqu.I("u2.id")))).
		Order(goqu.C("created_at").Desc()).
		Limit(dto.Limit).
		Offset((dto.Page - 1) * dto.Limit).
		ToSQL()

	fmt.Println("GetFeeList - sql", sql)

	rows, err := tfr.Conn(ctx).Query(ctx, sql)

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	var feeList []FeeModel
	for rows.Next() {
		model := FeeModel{}
		if err := rows.Scan(
			&model.ID,
			&model.FeeLabel,
			&model.Fee,
			&model.ActiveFrom,
			&model.ActiveTo,
			&model.Total,
		); err != nil {
			logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
			return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
		}
		feeList = append(feeList, model) // add new row information
	}

	if err != nil {
		return nil, errors.New(errors.BadRequestError)
	}

	return feeList, nil
}

func (tfr taxAndFeeRepository) SetNewTax(ctx context.Context, newTax NewTaxReqParams, userID int64) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("tax").
		Rows(databaseImpl.Record{
			"tax_name":   newTax.TaxType,
			"value":      newTax.TaxValue,
			"created_by": userID,
		}).With("delete_at",
		goqu.Update("tax").Set(databaseImpl.Record{
			"deleted_at": time.Now(),
		}).Where(goqu.I("tax.deleted_at").IsNull()),
	).ToSQL()

	fmt.Println("SetNewTax - sql", sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	_, err = tfr.Conn(ctx).Exec(ctx, sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Query Error", zap.Error(err))
		return false, errors.ParseError(ctx, err)
	}

	return true, nil
}

func (tfr taxAndFeeRepository) SetNewFee(ctx context.Context, newTax NewFeeReqParams, userID int64) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("fee_scheme").
		Rows(databaseImpl.Record{
			"fee_name":   newTax.FeeLabel,
			"value":      newTax.FeeValue,
			"created_by": userID,
		}).With("delete_at",
		goqu.Update("fee_scheme").Set(databaseImpl.Record{
			"deleted_at": time.Now(),
		}).Where(goqu.I("fee_scheme.deleted_at").IsNull()),
	).ToSQL()

	if err != nil {
		return false, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	fmt.Println("SetNewFee - sql", sql)

	_, err = tfr.Conn(ctx).Exec(ctx, sql)

	if err != nil {
		return false, errors.ParseError(ctx, err)
	}

	return true, nil
}

func (tfr taxAndFeeRepository) CheckInvoiceBeforeSetNewTaxOrFee(ctx context.Context) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		From(goqu.T("invoices").As("inv")).
		Select("inv.id").
		InnerJoin(goqu.T("invoices_status").As("apis2"),
			goqu.On(goqu.Ex{
				"apis2.invoice_id": goqu.I("inv.id"),
				"apis2.status":     "APPROVED",
			})).
		InnerJoin(goqu.T("invoices_status").As("pais2"),
			goqu.On(goqu.Ex{
				"pais2.invoice_id": goqu.I("inv.id"),
				"pais2.status":     constants.InvoicePrinted,
			})).
		ToSQL()

	if err != nil {
		return false, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	fmt.Println("CheckInvoiceBeforeSetNewTaxOrFee - sql", sql)

	_, err = tfr.Conn(ctx).Exec(ctx, sql)

	if err != nil {
		return false, errors.ParseError(ctx, err)
	}

	return true, nil
}
