package invoice

import (
	"context"
	"fmt"
	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/purchase"
	"strconv"
	"strings"
	"time"
)

type InvoiceRepository interface {
	ManageInvoiceStatus(ctx context.Context, model ManageInvoiceStatusModel, userID int64) (bool, error)
	GetInvoiceDetail(ctx context.Context, invoiceParam string, isInvoiceNumber bool) (*purchase.InvoiceDetailModel, error)
	GetInvoiceList(ctx context.Context, dto ParamsDto, userID *int64) ([]purchase.InvoiceDetailModel, error)
}

type invoiceRepository struct {
	databaseImpl.ConnManager
}

func NewInvoiceRepository(conn databaseImpl.ConnManager) *invoiceRepository {
	return &invoiceRepository{
		conn,
	}
}

func (ivr invoiceRepository) ManageInvoiceStatus(ctx context.Context, model ManageInvoiceStatusModel, userID int64) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("invoices_status").
		Rows(goqu.Record{
			"invoices_id": model.InvoiceID,
			"status":      model.Status,
			"created_by":  userID,
		}).ToSQL()

	if model.Status == constants.InvoiceRejected {
		createInvoiceStatus := goqu.Insert("invoices_status").
			Rows(goqu.Record{
				"invoices_id": model.InvoiceID,
				"status":      model.Status,
				"created_by":  userID,
			}).Returning("invoices_id")

		purchaseData := goqu.Select("pi2.id").
			From(goqu.T("invoices").As("inv")).
			InnerJoin(goqu.T("invoice_purchase").As("ip"),
				goqu.On(goqu.Ex{"ip.invoice_id": goqu.I("inv.id")})).
			InnerJoin(goqu.T("purchase_information").As("pi2"),
				goqu.On(goqu.Ex{"pi2.id": goqu.I("ip.purchase_id")})).
			Where(goqu.Ex{"inv.id": model.InvoiceID})

		rejectPurchase := goqu.Update("purchase_information").
			Set(goqu.Record{
				"deleted_at":     time.Now(),
				"deleted_reason": "INVOICE REJECTED",
			}).Where(goqu.Ex{
			"id": goqu.Op{"in": goqu.Select("id").From("purchase_data")},
		})

		repaymentData := goqu.Select("rp.id").
			From(goqu.T("invoices").As("inv")).
			InnerJoin(goqu.T("repayment_invoice").As("ri"),
				goqu.On(goqu.Ex{"ri.invoice_id": goqu.I("inv.id")})).
			InnerJoin(goqu.T("repayment").As("rp"),
				goqu.On(goqu.Ex{"rp.id": goqu.I("ri.repayment_id")})).
			Where(goqu.Ex{"inv.id": model.InvoiceID})

		rejectRepayment := goqu.Update("repayment").
			Set(goqu.Record{
				"deleted_at":    time.Now(),
				"deleted_by":    userID,
				"delete_reason": "INVOICE REJECTED",
			}).Where(goqu.Ex{
			"id": goqu.Op{"in": goqu.Select("id").From("repayment_data")},
		})

		sql, _, err = databaseImpl.QueryBuilder.
			Update("invoices").
			Set(goqu.Record{
				"deleted_at":     time.Now(),
				"deleted_reason": "REJECT",
			}).Where(goqu.Ex{
			"id": goqu.Select("invoices_id").From("create_invoice_status"),
		}).
			With("create_invoice_status", createInvoiceStatus).
			With("purchase_data", purchaseData).
			With("reject_purchase", rejectPurchase).
			With("repayment_data", repaymentData).
			With("reject_repayment", rejectRepayment).
			ToSQL()
	}

	fmt.Println("ManageInvoiceStatus - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Manage Invoice Status Query Error")
	}

	_, err = ivr.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error Execute Query", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Error when try to manage invoice status")
	}

	return true, nil
}

func (ivr invoiceRepository) GetInvoiceDetail(ctx context.Context, invoiceParam string, isInvoiceNumber bool) (*purchase.InvoiceDetailModel, error) {
	purchaseData := goqu.Select(
		"pduc.name",
		goqu.I("pdqs.id").As("queue_supplies_id"),
		goqu.I("pdbi.id").As("bucket_id"),
		goqu.I("pdg.id").As("goods_id"),
		goqu.I("pdpi2.id").As("purchase_id"),
		"pdbi.serial_number",
		"pdqs.farmer_name",
		"pdqs.product_type",
		"pdgd.grade",
		"pdc.client_name",
		"pdc.company",
		goqu.I("pdc.code").As("client_code"),
		goqu.I("pdgi.id").As("grade_info_id"),
		"pdcl.code",
		"pdgi.grade_price",
		"pdgi.unit_price",
		goqu.I("pdwi.id").As("weight_info_id"),
		"pdwi.gross_weight",
		goqu.I("pdpi2.gross_weight").As("purchase_gross_weight"),
		goqu.I("pdpi2.net_weight").As("purchase_net_weight"),
		"pdip.invoice_id",
		"pdpi2.purchase_price",
		"pdqs.partner_id",
		goqu.I("pdco.id").As("coordinator_id"),
		goqu.I("pdco.code").As("coordinator_code"),
		"pdqd.delivery_number",
	).Distinct().
		From(goqu.T("purchase_information").As("pdpi2")).
		InnerJoin(goqu.T("goods").As("pdg"),
			goqu.On(goqu.Ex{"pdg.id": goqu.I("pdpi2.goods_id")})).
		InnerJoin(goqu.T("bucket_information").As("pdbi"),
			goqu.On(goqu.Ex{"pdbi.id": goqu.I("pdg.bucket_id")})).
		InnerJoin(goqu.T("grade_information").As("pdgi"),
			goqu.On(goqu.Ex{"pdgi.id": goqu.I("pdpi2.grade_information_id")})).
		InnerJoin(goqu.T("weight_information").As("pdwi"),
			goqu.On(goqu.Ex{"pdwi.id": goqu.I("pdpi2.weight_information_id")})).
		InnerJoin(goqu.T("queue_supplies").As("pdqs"),
			goqu.On(goqu.Ex{"pdqs.id": goqu.I("pdbi.queue_supplies_id")})).
		InnerJoin(goqu.T("queue_delivery_list").As("pdqdl"),
			goqu.On(goqu.Ex{"pdqdl.queue_supplies_id": goqu.I("pdqs.id")})).
		InnerJoin(goqu.T("queue_delivery").As("pdqd"),
			goqu.On(goqu.Ex{"pdqd.id": goqu.I("pdqdl.queue_delivery_id")})).
		InnerJoin(goqu.T("coordinators").As("pdco"),
			goqu.On(goqu.Ex{"pdco.id": goqu.I("pdqs.coordinator_id")})).
		InnerJoin(goqu.T("users").As("pduc"),
			goqu.On(goqu.Ex{"pduc.id": goqu.I("pdco.user_id")})).
		InnerJoin(goqu.T("grades").As("pdgd"),
			goqu.On(goqu.Ex{"pdgd.id": goqu.I("pdgi.grade_id")})).
		InnerJoin(goqu.T("clients").As("pdc"),
			goqu.On(goqu.Ex{"pdc.id": goqu.I("pdgd.client_id")})).
		InnerJoin(goqu.T("code_list").As("pdcl"),
			goqu.On(goqu.Ex{"pdcl.id": goqu.I("pdgi.code_id")})).
		InnerJoin(goqu.T("invoice_purchase").As("pdip"),
			goqu.On(goqu.Ex{"pdip.purchase_id": goqu.I("pdpi2.id")}))

	coordinatorLoan := goqu.Select(
		goqu.I("lco.id").As("loan_id"),
		"copd.invoice_id",
		goqu.V(0).As("purchase_price_accum"),
		goqu.I("copd.name").As("reference_name"),
		goqu.COUNT("copd.serial_number").As("quantity_bucket"),
		"lco.*",
	).Distinct().
		From(goqu.T("loan").As("lco")).
		InnerJoin(goqu.T("purchase_data").As("copd"),
			goqu.On(goqu.Ex{
				"copd.coordinator_id": goqu.I("lco.reference_id"),
				"lco.reference_type":  "COORDINATOR",
			})).Where(goqu.Ex{"lco.deleted_at": nil}).
		GroupBy("lco.id", "copd.invoice_id", "copd.name")

	partnerLoan := goqu.Select(
		goqu.I("lpa.id").As("loan_id"),
		"papd.invoice_id",
		goqu.SUM("papd.purchase_price").As("purchase_price_accum"),
		goqu.I("papd.farmer_name").As("reference_name"),
		goqu.COUNT("papd.serial_number").As("quantity_bucket"),
		"lpa.*",
	).Distinct().
		From(goqu.T("loan").As("lpa")).
		InnerJoin(goqu.T("purchase_data").As("papd"),
			goqu.On(goqu.Ex{
				"papd.partner_id":    goqu.I("lpa.reference_id"),
				"lpa.reference_type": "PARTNER",
			})).Where(goqu.Ex{"lpa.deleted_at": nil}).Distinct().
		GroupBy("lpa.id", "papd.invoice_id", "papd.farmer_name", "papd.partner_id")

	loanUnion := goqu.Select("*").
		From(goqu.Select("*").From("partner_loan").
			UnionAll(goqu.Select("*").From("coordinator_loan")).As("lu"))

	repaymentData := goqu.Select("ri.invoice_id",
		"rp2.loan_id",
		"lu1.code",
		"lu1.reference_name",
		"rp2.value").
		Distinct().
		From(goqu.T("repayment_invoice").As("ri")).
		InnerJoin(goqu.T("repayment").As("rp2"),
			goqu.On(goqu.Ex{"rp2.id": goqu.I("ri.repayment_id")})).
		InnerJoin(goqu.T("loan_union").As("lu1"),
			goqu.On(goqu.Ex{"lu1.loan_id": goqu.I("rp2.loan_id")}))

	repaymentFinalData := goqu.Select("rd.invoice_id",
		goqu.L("JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT("+
			"	'loan_id', rd.loan_id,"+
			"	'loan_code', rd.code,"+
			"	'reference_name', rd.reference_name,"+
			"	'value', rd.value"+
			"))").As("repayment_list")).
		Distinct().
		From(goqu.T("repayment_data").As("rd")).
		GroupBy("rd.invoice_id")

	loanData := goqu.Select("lu.loan_id",
		"lu.invoice_id",
		"lu.purchase_price_accum",
		"lu.reference_name",
		"lu.code",
		"lu.loan_principal",
		"lu.total",
		"lu.reference_type",
		"lu.reference_id",
		goqu.COALESCE(goqu.SUM("rp.value"), 0).As("repayment_accum"),
		"lu.quantity_bucket",
	).
		From(goqu.T("loan_union").As("lu")).
		LeftJoin(goqu.T("repayment").As("rp"),
			goqu.On(goqu.Ex{"rp.loan_id": goqu.I("lu.loan_id")})).
		LeftJoin(goqu.T("repayment_data").As("rd1"),
			goqu.On(goqu.Ex{"rd1.loan_id": goqu.I("lu.loan_id")})).
		Where(goqu.Ex{"rd1.loan_id": nil}).
		GroupBy("lu.loan_id", "lu.invoice_id", "lu.purchase_price_accum",
			"lu.reference_name", "lu.code", "lu.loan_principal", "lu.total",
			"lu.reference_type", "lu.reference_id", "lu.quantity_bucket")

	loanFinalData := goqu.Select("invoice_id",
		goqu.L("JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT("+
			"	'loan_id', loan_id,"+
			"	'reference_name', reference_name,"+
			"	'loan_code', code,"+
			"	'loan_principal', loan_principal,"+
			"	'loan_total', total,"+
			"	'reference_type', reference_type,"+
			"	'reference_id', reference_id,"+
			"	'purchase_price_accum', purchase_price_accum,"+
			"	'repayment_accum', repayment_accum,"+
			"	'quantity_bucket', quantity_bucket"+
			"))").As("loan_list")).
		Distinct().
		From("loan_data").
		GroupBy("invoice_id")

	invoiceData := goqu.Select("is2.invoices_id",
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'status', is2.status,"+
			"	'status_date', is2.created_at at time zone 'utc'"+
			") ORDER BY is2.id DESC)").As("status_list"),
	).Distinct().
		From(goqu.T("invoices_status").As("is2")).
		GroupBy("is2.invoices_id")

	if !isInvoiceNumber {
		invoiceID, err := strconv.ParseInt(invoiceParam, 10, 64)
		if err != nil {
			logger.ContextLogger(ctx).Error("Error when parsing params to int64", zap.Error(err))
			return nil, errors.Wrap(err, errors.ParsingParamError, "Error when parsing params to int64")
		}
		purchaseData = purchaseData.Where(goqu.Ex{"pdip.invoice_id": invoiceID})
		repaymentData = repaymentData.Where(goqu.Ex{"ri.invoice_id": invoiceID})
	}

	queryBuilder := databaseImpl.QueryBuilder.
		Select("inv.id",
			"inv.invoice_number",
			"inv.created_at",
			"pd.delivery_number",
			"pd.name",
			"pd.coordinator_code",
			goqu.COUNT("pd.serial_number"),
			goqu.SUM("pd.purchase_price"),
			goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
				"	'goods_id', pd.goods_id,"+
				"	'partner_id', pd.partner_id,"+
				"	'farmer_name', pd.farmer_name,"+
				"	'product_type', pd.product_type,"+
				"	'serial_number', pd.serial_number,"+
				"	'sales_code', pd.code,"+
				"	'grade_info_id', pd.grade_info_id,"+
				"	'client_name', pd.client_name,"+
				"	'client_company', pd.company,"+
				"	'client_code', pd.client_code,"+
				"	'grade', pd.grade,"+
				"	'unit_price', pd.unit_price,"+
				"	'weight_info_id', pd.weight_info_id,"+
				"	'grade_price', pd.grade_price,"+
				"	'gross_weight', pd.gross_weight,"+
				"	'purchase_id', pd.purchase_id,"+
				"	'purchase_gross_weight', pd.purchase_gross_weight,"+
				"	'purchase_net_weight', pd.purchase_net_weight,"+
				"	'purchase_price', pd.purchase_price"+
				") ORDER BY pd.serial_number)"),
			"lfd.loan_list",
			"rfd.repayment_list",
			"id2.status_list",
			"inv.tax_price",
			"inv.fee_price",
			"inv.tax_value",
			"inv.fee_value",
		).Distinct().
		From(goqu.T("invoices").As("inv")).
		InnerJoin(goqu.T("purchase_data").As("pd"),
			goqu.On(goqu.Ex{"pd.invoice_id": goqu.I("inv.id")})).
		LeftJoin(goqu.T("invoice_data").As("id2"),
			goqu.On(goqu.Ex{"id2.invoices_id": goqu.I("inv.id")})).
		LeftJoin(goqu.T("repayment_final_data").As("rfd"),
			goqu.On(goqu.Ex{"rfd.invoice_id": goqu.I("inv.id")})).
		LeftJoin(goqu.T("loan_final_data").As("lfd"),
			goqu.On(goqu.Ex{"lfd.invoice_id": goqu.I("inv.id")})).
		GroupBy("inv.id", "inv.invoice_number", "pd.delivery_number",
			"pd.name", "inv.created_at", "lfd.loan_list", "rfd.repayment_list",
			"id2.status_list", "inv.tax_price", "inv.fee_price", "pd.coordinator_code").
		With("purchase_data", purchaseData).
		With("coordinator_loan", coordinatorLoan).
		With("partner_loan", partnerLoan).
		With("loan_union", loanUnion).
		With("repayment_data", repaymentData).
		With("repayment_final_data", repaymentFinalData).
		With("loan_data", loanData).
		With("loan_final_data", loanFinalData).
		With("invoice_data", invoiceData)

	if isInvoiceNumber {
		queryBuilder = queryBuilder.Where(goqu.Ex{"inv.invoice_number": invoiceParam})
	}

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetInvoiceDetail - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Invoice Detail Query Error")
	}

	row := ivr.Conn(ctx).QueryRow(ctx, sql)

	var model purchase.InvoiceDetailModel
	err = row.Scan(
		&model.InvoiceID,
		&model.InvoiceNumber,
		&model.InvoiceDate,
		&model.DeliveryNumber,
		&model.CoordinatorName,
		&model.CoordinatorCode,
		&model.BucketQuantity,
		&model.PurchasePriceAccum,
		&model.BucketList,
		&model.LoanList,
		&model.RepaymentList,
		&model.InvoiceStatusList,
		&model.TaxPrice,
		&model.FeePrice,
		&model.TaxValue,
		&model.FeeValue,
	)

	if err != nil {
		logger.ContextLogger(ctx).Error("Parsing data error", zap.Error(err))
		log.Println(err)
	}

	return &model, nil
}

func (ivr invoiceRepository) GetInvoiceList(ctx context.Context, dto ParamsDto, userID *int64) ([]purchase.InvoiceDetailModel, error) {
	repaymentData := goqu.Select(
		"ri.invoice_id",
		goqu.SUM("r.value").As("repayment_accum")).
		From(goqu.T("repayment_invoice").As("ri")).
		LeftJoin(goqu.T("repayment").As("r"),
			goqu.On(goqu.Ex{"r.id": goqu.I("ri.repayment_id")})).
		GroupBy("ri.invoice_id")

	statusData := goqu.Select(
		"is2.invoices_id",
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'status', is2.status,"+
			"	'status_date', is2.created_at at time zone 'utc'"+
			") ORDER BY is2.created_at DESC)").As("status_list")).
		From(goqu.T("invoices_status").As("is2")).
		GroupBy("is2.invoices_id")

	queryBuilder := databaseImpl.QueryBuilder.
		Select("inv.id",
			"inv.invoice_number",
			"qd.delivery_number",
			"inv.created_at",
			"uc.name",
			goqu.COUNT("ip.id"),
			goqu.SUM("pi.purchase_price"),
			"sd.status_list",
			"inv.tax_price",
			"inv.fee_price",
			"rd.repayment_accum",
			"uinv.name",
			goqu.COUNT("*").Over(goqu.W()),
		).Distinct().
		From(goqu.T("invoices").As("inv")).
		InnerJoin(goqu.T("users").As("uinv"),
			goqu.On(goqu.Ex{"uinv.id": goqu.I("inv.created_by")})).
		InnerJoin(goqu.T("invoice_purchase").As("ip"),
			goqu.On(goqu.Ex{"ip.invoice_id": goqu.I("inv.id")})).
		InnerJoin(goqu.T("purchase_information").As("pi"),
			goqu.On(goqu.Ex{"pi.id": goqu.I("ip.purchase_id")})).
		InnerJoin(goqu.T("goods").As("g"),
			goqu.On(goqu.Ex{"g.id": goqu.I("pi.goods_id")})).
		InnerJoin(goqu.T("bucket_information").As("bi"),
			goqu.On(goqu.Ex{"bi.id": goqu.I("g.bucket_id")})).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.Ex{"qs.id": goqu.I("bi.queue_supplies_id")})).
		InnerJoin(goqu.T("coordinators").As("c"),
			goqu.On(goqu.Ex{"c.id": goqu.I("qs.coordinator_id")})).
		InnerJoin(goqu.T("users").As("uc"),
			goqu.On(goqu.Ex{"uc.id": goqu.I("c.user_id")})).
		InnerJoin(goqu.T("queue_delivery_list").As("qdl"),
			goqu.On(goqu.Ex{"qdl.queue_supplies_id": goqu.I("qs.id")})).
		InnerJoin(goqu.T("queue_delivery").As("qd"),
			goqu.On(goqu.Ex{"qd.id": goqu.I("qdl.queue_delivery_id")})).
		LeftJoin(goqu.T("status_data").As("sd"),
			goqu.On(goqu.Ex{"sd.invoices_id": goqu.I("inv.id")})).
		LeftJoin(goqu.T("repayment_data").As("rd"),
			goqu.On(goqu.Ex{"rd.invoice_id": goqu.I("inv.id")})).
		GroupBy("inv.id", "inv.invoice_number", "qd.delivery_number",
			"inv.tax_price", "inv.fee_price", "inv.created_at", "rd.repayment_accum",
			"uc.name", "uinv.name", "sd.status_list").
		With("repayment_data", repaymentData).
		With("status_data", statusData)

	statusFilter := goqu.Ex{}

	filterQuery := goqu.Ex{
		"c.deleted_at":    nil,
		"uc.deleted_at":   nil,
		"inv.deleted_at":  nil,
		"uinv.deleted_at": nil,
	}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "coordinator_id" {
				cID, _ := strconv.ParseInt(filter[1], 10, 64)
				filterQuery["c.id"] = cID
			}
			if filter[0] == "coordinator_mode" {
				filterQuery["uc.id"] = userID
			}
			if filter[0] == "on_progress" {
				filterQuery["sd.status_list"] = nil
			}
			if filter[0] == "status" {
				filterArg := strings.Split(filter[1], ",")
				isOnProgress := false
				for _, arg := range filterArg {
					if arg == "ON_PROGRESS" {
						isOnProgress = true
					}
				}

				statusFilter["is2.status"] = goqu.Op{"in": filterArg}
				if !isOnProgress {
					filterQuery["sd.invoices_id"] = goqu.Op{"neq": nil}
				}
			}
			if filter[0] == "excl_status" {
				filterArg := strings.Split(filter[1], ",")
				isOnProgress := false
				for _, arg := range filterArg {
					if arg == "ON_PROGRESS" {
						isOnProgress = true
					}
				}

				statusFilter["is2.status"] = goqu.Op{"notIn": filterArg}
				if isOnProgress {
					filterQuery["sd.invoices_id"] = goqu.Op{"neq": nil}
				}
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
					queryBuilder = queryBuilder.Order(goqu.I("uc.name").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("uc.name").Desc())
				}
			}
		}
	} else {
		queryBuilder = queryBuilder.Order(goqu.I("inv.created_at").Desc())
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"uc.name":            goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"qs.farmer_name":     goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"inv.invoice_number": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"qd.delivery_number": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
		})
	}

	if dto.Limit > 0 {
		queryBuilder = queryBuilder.Limit(dto.Limit)
	}

	if dto.Page > 0 {
		queryBuilder = queryBuilder.Offset((dto.Page - 1) * (dto.Limit))
	}

	statusData = statusData.Where(statusFilter)
	queryBuilder = queryBuilder.Where(filterQuery)

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetInvoiceList - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Invoice List Query Error")
	}

	rows, err := ivr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to get invoice list")
	}

	var resModels []purchase.InvoiceDetailModel
	for rows.Next() {
		var model purchase.InvoiceDetailModel
		err = rows.Scan(
			&model.InvoiceID,
			&model.InvoiceNumber,
			&model.DeliveryNumber,
			&model.InvoiceDate,
			&model.CoordinatorName,
			&model.BucketQuantity,
			&model.PurchasePriceAccum,
			&model.InvoiceStatusList,
			&model.TaxPrice,
			&model.FeePrice,
			&model.RepaymentAccum,
			&model.InvoicedBy,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		resModels = append(resModels, model) // add new row information
	}

	return resModels, nil
}
