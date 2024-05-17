package purchase

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/global"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/operational"
	"strings"
	"time"
)

type PurchaseRepository interface {
	GetDeliveryWithStatusAccum(ctx context.Context, dto ParamsDto) ([]DeliveryWithStatusAccumModel, error)
	GetDeliveryDetail(ctx context.Context, deliveryNumber string) (*DeliveryDetailModel, error)
	ManagePurchaseData(ctx context.Context, model ManagePurchaseModel, userID int64) (bool, error)
	GetPendingValidation(ctx context.Context, dto ParamsDto) ([]operational.GetGoodsModel, error)
}

type purchaseRepository struct {
	databaseImpl.ConnManager
}

func NewPurchaseRepository(conn databaseImpl.ConnManager) *purchaseRepository {
	return &purchaseRepository{
		conn,
	}
}

func (pcr purchaseRepository) GetDeliveryWithStatusAccum(ctx context.Context, dto ParamsDto) ([]DeliveryWithStatusAccumModel, error) {
	purchaseData := goqu.Select("pdpi2.goods_id",
		goqu.V("VALID").As("status"),
		goqu.I("pdbi.id").As("bucket_id"),
		"pdbi.queue_supplies_id").
		Distinct().
		From(goqu.T("purchase_information").As("pdpi2")).
		InnerJoin(goqu.T("goods").As("pdg"),
			goqu.On(goqu.Ex{"pdg.id": goqu.I("pdpi2.goods_id")})).
		InnerJoin(goqu.T("bucket_information").As("pdbi"),
			goqu.On(goqu.Ex{"pdbi.id": goqu.I("pdg.bucket_id")})).
		Where(goqu.Ex{"pdpi2.deleted_at": nil})

	onprogressData := goqu.Select(
		goqu.I("odg.id").As("goods_id"),
		goqu.Case().
			When(goqu.Ex{
				"odwi.id":         goqu.Op{"neq": nil},
				"odgi.id":         goqu.Op{"neq": nil},
				"odwi.deleted_at": nil,
				"odgi.deleted_at": nil,
			}, "WAITING_TO_VALIDATE").
			When(goqu.Or(goqu.Ex{
				"odwi.id":         goqu.Op{"neq": nil},
				"odwi.deleted_at": nil,
			}, goqu.Ex{
				"odgi.id":         goqu.Op{"neq": nil},
				"odgi.deleted_at": nil,
			}), "ON_PROGRESS").
			When(goqu.I("odwi.id").IsNotNull(), "WEIGH").
			When(goqu.I("odgi.id").IsNotNull(), "GRADE").
			When(goqu.I("odg.id").IsNotNull(), "POUR_OUT").
			When(goqu.I("odbi.deleted_reason").IsNotNull(), goqu.I("odbi.deleted_reason")).
			Else("NOT_DELIVERED").As("status"),
		goqu.I("odbi.id").As("bucket_id"),
		"odbi.queue_supplies_id").
		Distinct().
		From(goqu.T("goods").As("odg")).
		LeftJoin(goqu.T("grade_information").As("odgi"),
			goqu.On(goqu.Ex{"odgi.goods_id": goqu.I("odg.id")})).
		LeftJoin(goqu.T("weight_information").As("odwi"),
			goqu.On(goqu.Ex{"odwi.goods_id": goqu.I("odg.id")})).
		LeftJoin(goqu.T("bucket_information").As("odbi"),
			goqu.On(goqu.Ex{"odbi.id": goqu.I("odg.bucket_id")})).
		Where(goqu.Ex{
			"odgi.deleted_at": nil,
			"odwi.deleted_at": nil,
			"odg.id":          goqu.Op{"notIn": goqu.Select("goods_id").From("purchase_data")},
		})

	bucketData := goqu.Select(
		"bdqdl.queue_delivery_id",
		goqu.L("JSONB_BUILD_OBJECT("+
			"	'VALIDATED', count(bdu.status) filter (where bdu.status = 'VALID'),"+
			"	'WAITING_TO_VALIDATE', count(bdu.status) filter (where bdu.status = 'WAITING_TO_VALIDATE'),"+
			"	'ON_PROGRESS', count(bdu.status) filter (where bdu.status = 'ON_PROGRESS'),"+
			"	'WEIGH', count(bdu.status) filter (where bdu.status = 'WEIGH'),"+
			"	'GRADE', count(bdu.status) filter (where bdu.status = 'GRADE'),"+
			"	'POUR_OUT', count(bdu.status) filter (where bdu.status = 'POUR_OUT'),"+
			"	'REJECT', count(bdu.status) filter (where bdu.status = 'REJECT'),"+
			"	'NOT_DELIVERED', count(bdu.status) filter (where bdu.status = 'NOT_DELIVERED')"+
			")").As("status_object"),
	).From(goqu.Select("*").From("purchase_data").
		UnionAll(goqu.Select("*").From("onprogress_data")).As("bdu")).
		InnerJoin(goqu.T("queue_delivery_list").As("bdqdl"),
			goqu.On(goqu.Ex{"bdqdl.queue_supplies_id": goqu.I("bdu.queue_supplies_id")})).
		InnerJoin(goqu.T("queue_delivery").As("bdqd"),
			goqu.On(goqu.Ex{"bdqd.id": goqu.I("bdqdl.queue_delivery_id")})).
		GroupBy("bdqdl.queue_delivery_id")

	invoiceStatusData := goqu.Select("is2.invoices_id",
		goqu.MAX("is2.id").As("status_id")).
		From(goqu.T("invoices_status").As("is2")).
		GroupBy("is2.invoices_id")

	invoiceData := goqu.Select("inv.queue_delivery_id",
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'invoice_id', inv.id,"+
			"	'invoice_number', inv.invoice_number,"+
			"	'status', COALESCE(is3.status::TEXT, 'ON_PROGRESS'),"+
			"	'status_date', COALESCE(is3.created_at, inv.created_at) at time zone 'utc'"+
			") ORDER BY inv.invoice_number ASC)").As("invoice_list"),
	).From(goqu.T("invoices").As("inv")).
		LeftJoin(goqu.T("invoice_status_data").As("isd"),
			goqu.On(goqu.Ex{"isd.invoices_id": goqu.I("inv.id")})).
		LeftJoin(goqu.T("invoices_status").As("is3"),
			goqu.On(goqu.Ex{"is3.id": goqu.I("isd.status_id")})).
		GroupBy("inv.queue_delivery_id").
		Where(goqu.Ex{"inv.deleted_at": nil})

	queryBuilder := databaseImpl.QueryBuilder.
		Select("qd.id",
			"qd.delivery_number",
			"uc.name",
			goqu.I("qd.scheduled_arrival_date").Cast("DATE"),
			"qd.created_at",
			goqu.COUNT(goqu.I("qs.id").Distinct()),
			goqu.SUM(goqu.I("qs.quantity_bucket").Distinct()),
			"bd.status_object",
			"id2.invoice_list",
			goqu.COUNT("*").Over(goqu.W()),
		).From(goqu.T("queue_delivery").As("qd")).
		InnerJoin(goqu.T("queue_delivery_list").As("qdl"),
			goqu.On(goqu.Ex{"qdl.queue_delivery_id": goqu.I("qd.id")})).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.Ex{"qs.id": goqu.I("qdl.queue_supplies_id")})).
		InnerJoin(goqu.T("coordinators").As("c"),
			goqu.On(goqu.Ex{"c.id": goqu.I("qs.coordinator_id")})).
		InnerJoin(goqu.T("users").As("uc"),
			goqu.On(goqu.Ex{"uc.id": goqu.I("c.user_id")})).
		LeftJoin(goqu.T("bucket_data").As("bd"),
			goqu.On(goqu.Ex{"bd.queue_delivery_id": goqu.I("qd.id")})).
		LeftJoin(goqu.T("invoice_data").As("id2"),
			goqu.On(goqu.Ex{"id2.queue_delivery_id": goqu.I("qd.id")})).
		GroupBy("qd.id", "uc.name", "bd.status_object", "id2.invoice_list").
		With("purchase_data", purchaseData).
		With("onprogress_data", onprogressData).
		With("bucket_data", bucketData).
		With("invoice_status_data", invoiceStatusData).
		With("invoice_data", invoiceData)

	filterQuery := goqu.Ex{
		"c.deleted_at":  nil,
		"uc.deleted_at": nil,
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
					queryBuilder = queryBuilder.Order(goqu.I("uc.name").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("uc.name").Desc())
				}
			}
		}
	} else {
		queryBuilder = queryBuilder.Order(goqu.MAX(goqu.I("qd.created_at")).Desc())
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"uc.name":          goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"qs.farmer_name":   goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"bd.serial_number": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"bd.sales_code":    goqu.Op{"ilike": "%" + dto.Keyword + "%"},
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

	fmt.Println("GetDeliveryWithStatusAccum - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Delivery With Status Enum Query Error")
	}

	rows, err := pcr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to get delivery with status enum")
	}

	var resModels []DeliveryWithStatusAccumModel
	for rows.Next() {
		var model DeliveryWithStatusAccumModel
		err = rows.Scan(
			&model.DeliveryID,
			&model.DeliveryNumber,
			&model.CoordinatorName,
			&model.ScheduledArrivalDate,
			&model.DeliveryCreatedAt,
			&model.TotalQueue,
			&model.TotalBucket,
			&model.StatusAccum,
			&model.InvoiceList,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		resModels = append(resModels, model) // add new row information
	}

	return resModels, nil
}

func (pcr purchaseRepository) GetDeliveryDetail(ctx context.Context, deliveryNumber string) (*DeliveryDetailModel, error) {
	goodsData := global.GetCompleteBucketDataQuery("")

	sql, _, err := databaseImpl.QueryBuilder.
		Select("qd.delivery_number",
			"qd.id",
			"qd.scheduled_arrival_date",
			"gd.name",
			goqu.COUNT("gd.serial_number").As("bucket_quantity"),
			goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
				"	'goods_id', gd.goods_id,"+
				"	'partner_id', gd.partner_id,"+
				"	'farmer_name', gd.farmer_name,"+
				"	'product_type', gd.product_type,"+
				"	'serial_number', gd.serial_number,"+
				"	'sales_code', gd.code,"+
				"	'grade_info_id', gd.grade_info_id,"+
				"	'client_name', gd.client_name,"+
				"	'client_company', gd.company,"+
				"	'client_code', gd.client_code,"+
				"	'grade', gd.grade,"+
				"	'unit_price', gd.unit_price,"+
				"	'weight_info_id', gd.weight_info_id,"+
				"	'grade_price', gd.grade_price,"+
				"	'gross_weight', gd.gross_weight,"+
				"	'purchase_id', gd.purchase_id,"+
				"	'purchase_gross_weight', gd.purchase_gross_weight,"+
				"	'purchase_net_weight', gd.purchase_net_weight,"+
				"	'grade_information_excl_id', gd.grade_information_excl_id,"+
				"	'weight_information_excl_id', gd.weight_information_excl_id,"+
				"	'status', gd.status,"+
				"	'invoice_id', gd.invoice_id,"+
				"	'invoice_number', gd.invoice_number,"+
				"	'status_list', gd.status_list"+
				") ORDER BY gd.serial_number)"),
		).From(goqu.T("goods_data").As("gd")).
		InnerJoin(goqu.T("queue_delivery_list").As("qdl"),
			goqu.On(goqu.Ex{"qdl.queue_supplies_id": goqu.I("gd.queue_supplies_id")})).
		InnerJoin(goqu.T("queue_delivery").As("qd"),
			goqu.On(goqu.Ex{"qd.id": goqu.I("qdl.queue_delivery_id")})).
		GroupBy("qd.id", "gd.name").
		With("goods_data", goodsData).
		Where(goqu.Ex{"qd.delivery_number": deliveryNumber}).
		ToSQL()

	fmt.Println("GetDeliveryDetail - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Delivery Detail Query Error")
	}

	row := pcr.Conn(ctx).QueryRow(ctx, sql)

	var model DeliveryDetailModel
	err = row.Scan(
		&model.DeliveryNumber,
		&model.DeliveryID,
		&model.DeliveryDate,
		&model.CoordinatorName,
		&model.BucketQuantity,
		&model.BucketList,
	)

	if err != nil {
		logger.ContextLogger(ctx).Error("Parsing data error", zap.Error(err))
		log.Println(err)
	}

	return &model, nil
}

func createInvoiceNumber(CoordinatorCode string) string {
	return "INV-" + strings.ToUpper(CoordinatorCode) + time.Now().Local().Format("060102")
}

func (pcr purchaseRepository) ManagePurchaseData(ctx context.Context, model ManagePurchaseModel, userID int64) (bool, error) {
	jsonManagePurchaseModel, _ := json.Marshal(model.Valid)

	paramsData := goqu.Select("*").
		From(goqu.L("JSONB_TO_RECORDSET('" + string(jsonManagePurchaseModel) + "')" +
			"AS params_data(purchase_id INT, goods_id INT, grade_info_id INT, weight_info_id INT)"))

	goodsParams := goqu.Select("gppd.*",
		"gpgi.unit_price",
		goqu.I("cpw.gw").As("purchase_gw"),
		goqu.I("cpw.nw").As("purchase_nw"),
		goqu.I("gpwi.gross_weight").As("client_gw"),
		goqu.Func("create_client_weight",
			goqu.I("gpwi.gross_weight"), goqu.I("gpc.code")),
	).
		From(goqu.T("params_data").As("gppd")).
		InnerJoin(goqu.T("goods").As("gpg"),
			goqu.On(goqu.Ex{"gpg.id": goqu.I("gppd.goods_id")})).
		InnerJoin(goqu.T("grade_information").As("gpgi"),
			goqu.On(goqu.Ex{"gpgi.id": goqu.I("gppd.grade_info_id")})).
		InnerJoin(goqu.T("grades").As("gpgd"),
			goqu.On(goqu.Ex{"gpgd.id": goqu.I("gpgi.grade_id")})).
		InnerJoin(goqu.T("clients").As("gpc"),
			goqu.On(goqu.Ex{"gpc.id": goqu.I("gpgd.client_id")})).
		InnerJoin(goqu.T("weight_information").As("gpwi"),
			goqu.On(goqu.Ex{"gpwi.id": goqu.I("gppd.weight_info_id")})).
		CrossJoin(goqu.Func("create_purchase_weight",
			goqu.I("gpwi.gross_weight")).As("cpw"))

	createPurchase := goqu.Insert("purchase_information").
		Cols("goods_id", "grade_information_id", "weight_information_id",
			"gross_weight", "net_weight", "purchase_price", "created_by").
		FromQuery(goqu.Select(
			"cpgp.goods_id",
			"cpgp.grade_info_id",
			"cpgp.weight_info_id",
			"cpgp.purchase_gw",
			"cpgp.purchase_nw",
			goqu.L("cpgp.unit_price * cpgp.purchase_nw / 1000"),
			goqu.V(userID),
		).From(goqu.T("goods_params").As("cpgp"))).
		Returning("id", "purchase_price")

	createPurchaseAccum := goqu.Select(
		goqu.COUNT("id").As("quantity_bucket"),
		goqu.SUM("purchase_price").As("accum_purchase_price"),
	).From("create_purchase")

	createInvoice := goqu.Insert("invoices").
		Cols("invoice_number", "revision", "tax_value", "fee_value",
			"tax_price", "fee_price", "created_by", "queue_delivery_id").
		FromQuery(goqu.Select(
			goqu.Func("get_invoice_number", createInvoiceNumber(model.DeliveryNumber[3:len(model.DeliveryNumber)-6])),
			goqu.V(0),
			"gtd.tax_value",
			"gfd.fee_value",
			"gtd.tax_price",
			"gfd.fee_price",
			goqu.V(userID),
			goqu.V(model.DeliveryID),
		).From(goqu.T("create_purchase_accum").As("cpa")).
			CrossJoin(goqu.Func("get_tax_data",
				goqu.I("cpa.accum_purchase_price").Cast("BIGINT")).As("gtd")).
			CrossJoin(goqu.Func("get_fee_data",
				goqu.I("cpa.quantity_bucket")).As("gfd"))).
		Returning("id")

	queryBuilder := databaseImpl.QueryBuilder.
		Insert("invoice_purchase").
		Cols("invoice_id", "purchase_id").
		FromQuery(goqu.Select(
			goqu.Select("id").From("create_invoice").Limit(1),
			"id",
		).From("create_purchase")).
		With("params_data", paramsData).
		With("goods_params", goodsParams).
		With("create_purchase", createPurchase).
		With("create_purchase_accum", createPurchaseAccum).
		With("create_invoice", createInvoice)

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("ManagePurchaseData - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Goods Validation Error")
	}

	_, err = pcr.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error Execute Query", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Error when try to validate goods")
	}

	return true, nil
}

func (pcr purchaseRepository) GetPendingValidation(ctx context.Context, dto ParamsDto) ([]operational.GetGoodsModel, error) {
	purchaseData := goqu.Select("pi2.goods_id").
		From(goqu.T("purchase_information").As("pi2")).
		Where(goqu.Ex{"pi2.deleted_at": nil})

	queryBuilder := global.GetGoodsQuery().
		LeftJoin(goqu.T("purchase_data").As("pd"),
			goqu.On(goqu.Ex{"pd.goods_id": goqu.I("g.id")})).
		With("purchase_data", purchaseData)

	filterQuery := goqu.Ex{
		"c.deleted_at":  nil,
		"uc.deleted_at": nil,
		"g.id":          goqu.Op{"neq": nil},
		"gi.id":         goqu.Op{"neq": nil},
		"wi.id":         goqu.Op{"neq": nil},
		"pd.goods_id":   nil,
	}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "pour_out_date" {
				startDate, err := time.Parse("2006-01-02 15:04:05", filter[1]+" 00:00:00")
				if err != nil {
					logger.ContextLogger(ctx).Error("Error parsing date", zap.Error(err))
					return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Data Table")
				}

				endDate, err := time.Parse("2006-01-02 15:04:05", filter[1]+" 23:59:59")
				if err != nil {
					logger.ContextLogger(ctx).Error("Error parsing date", zap.Error(err))
					return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Data Table")
				}
				fmt.Println("GetGoodsInformation - startDate", filter, "endDate", endDate)
				filterQuery["g.created_at"] = goqu.Op{
					"between": goqu.Range(startDate, endDate),
				}
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
					queryBuilder = queryBuilder.Order(goqu.I("uc.name").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("uc.name").Desc())
				}
			}
			if sort[0] == "pour_out_date" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.I("g.created_at").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("g.created_at").Desc())
				}
			}
			if sort[0] == "grading_date" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.I("gi.created_at").Asc().NullsFirst())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("gi.created_at").Desc().NullsFirst())
				}
			}
			if sort[0] == "weigh_date" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.I("wi.created_at").Asc().NullsFirst())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("wi.created_at").Desc().NullsFirst())
				}
			}
		}
	} else {
		queryBuilder = queryBuilder.Order(goqu.MAX(goqu.I("gi.created_at")).Desc())
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"uc.name":          goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"qs.farmer_name":   goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"bi.serial_number": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"cl.code":          goqu.Op{"ilike": "%" + dto.Keyword + "%"},
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

	fmt.Println("GetPendingValidation - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Goods Information Query Error")
	}

	rows, err := pcr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to create grade information")
	}

	var resModels []operational.GetGoodsModel
	for rows.Next() {
		var model operational.GetGoodsModel
		err = rows.Scan(
			&model.CoordinatorName,
			&model.CoordinatorCode,
			&model.FarmerName,
			&model.ProductType,
			&model.GoodsID,
			&model.PourOutDate,
			&model.PourOutBy,
			&model.SerialNumber,
			&model.DeliveryNumber,
			&model.GradingData,
			&model.WeighData,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		resModels = append(resModels, model) // add new row information
	}

	return resModels, nil
}
