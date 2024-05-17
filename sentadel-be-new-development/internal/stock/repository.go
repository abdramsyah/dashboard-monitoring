package stock

import (
	"context"
	"fmt"
	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/global"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/purchase"
	"strings"
)

type StockRepository interface {
	GetStockList(ctx context.Context, dto GetStockListDto) ([]purchase.BucketDataModel, error)
	GetStockDetailBySerialNumber(ctx context.Context, serialNumber string) (*GetStockDetailModel, error)
	GetStockSummary(ctx context.Context, dto GetStockListDto) (*GetStockSummaryModel, error)
}

type stockRepository struct {
	databaseImpl.ConnManager
}

func NewStockRepository(conn databaseImpl.ConnManager) *stockRepository {
	return &stockRepository{
		conn,
	}
}

func (str stockRepository) GetStockList(ctx context.Context, dto GetStockListDto) ([]purchase.BucketDataModel, error) {
	goodsData := global.GetCompleteBucketDataQuery("")

	queryBuilder := databaseImpl.QueryBuilder.
		Select("x.bucket_id",
			"x.name",
			"x.farmer_name",
			"x.product_type",
			"x.serial_number",
			"x.grade_info_id",
			"x.code",
			"x.client_name",
			"x.company",
			"x.client_code",
			"x.grade",
			"x.unit_price",
			"x.grade_price",
			"x.weight_info_id",
			"x.gross_weight",
			"x.goods_date",
			"x.purchase_id",
			"x.purchase_grade_info_id",
			"x.purchase_sales_code",
			"x.purchase_client_name",
			"x.purchase_company",
			"x.purchase_client_code",
			"x.purchase_grade",
			"x.purchase_unit_price",
			"x.purchase_grade_price",
			"x.purchase_price",
			"x.purchase_gross_weight",
			"x.purchase_net_weight",
			"x.status",
			"x.purchase_date",
			"x.invoice_id",
			"x.invoice_number",
			"x.latest_status",
			"x.latest_status_at",
			goqu.COUNT("*").Over(goqu.W()),
		).
		From(goqu.T("goods_data").As("x")).
		With("goods_data", goodsData)

	filterQuery := goqu.Ex{"x.goods_id": goqu.Op{"neq": nil}}

	if len(dto.GoodsDate) > 0 {
		if len(dto.GoodsDateTo) > 0 {
			queryBuilder = queryBuilder.Where(goqu.Cast(goqu.L("(x.goods_date AT TIME ZONE 'UTC')"), "DATE").
				Between(goqu.Range(dto.GoodsDate, dto.GoodsDateTo)))
		} else {
			queryBuilder = queryBuilder.Where(goqu.Cast(goqu.L("(x.goods_date AT TIME ZONE 'UTC')"), "DATE").Eq(dto.GoodsDate))
		}
	}

	if len(dto.PurchaseDate) > 0 {
		if len(dto.PurchaseDateTo) > 0 {
			queryBuilder = queryBuilder.Where(goqu.Cast(goqu.L("(x.purchase_date AT TIME ZONE 'UTC')"), "DATE").
				Between(goqu.Range(dto.PurchaseDate, dto.PurchaseDateTo)))
		} else {
			queryBuilder = queryBuilder.Where(goqu.Cast(goqu.L("(x.purchase_date AT TIME ZONE 'UTC')"), "DATE").Eq(dto.PurchaseDate))
		}

	}

	if len(dto.GoodsStatus) > 0 {
		filterQuery["x.status"] = goqu.Op{"in": dto.GoodsStatus}
	}

	if len(dto.InvoiceStatus) > 0 {
		statusList := strings.Split(dto.InvoiceStatus, ",")
		filterQuery["x.latest_status"] = goqu.Op{"in": statusList}
	}

	if len(dto.ClientCode) > 0 {
		clientList := strings.Split(dto.ClientCode, ",")
		filterQuery["x.client_code"] = goqu.Op{"in": clientList}
	}

	if len(dto.SortBy) > 0 {
		sort := strings.Split(dto.SortBy, ":")
		if len(sort[0]) < 2 {
			return nil, errors.New(errors.BadRequestError)
		}
		if sort[0] == "coordinator_name" {
			sortType := strings.ToLower(sort[1])
			if sortType == "asc" {
				queryBuilder = queryBuilder.Order(goqu.I("x.name").Asc().NullsLast())
			} else {
				queryBuilder = queryBuilder.Order(goqu.I("x.name").Desc().NullsLast())
			}
		}
		if sort[0] == "farmer_name" {
			sortType := strings.ToLower(sort[1])
			if sortType == "asc" {
				queryBuilder = queryBuilder.Order(goqu.I("x.farmer_name").Asc().NullsLast())
			} else {
				queryBuilder = queryBuilder.Order(goqu.I("x.farmer_name").Desc().NullsLast())
			}
		}
		if sort[0] == "goods_date" {
			sortType := strings.ToLower(sort[1])
			if sortType == "asc" {
				queryBuilder = queryBuilder.Order(goqu.I("x.goods_date").Asc().NullsLast())
			} else {
				queryBuilder = queryBuilder.Order(goqu.I("x.goods_date").Desc().NullsLast())
			}
		}
		if sort[0] == "purchase_date" {
			sortType := strings.ToLower(sort[1])
			if sortType == "asc" {
				queryBuilder = queryBuilder.Order(goqu.I("x.purchase_date").Asc().NullsLast())
			} else {
				queryBuilder = queryBuilder.Order(goqu.I("x.purchase_date").Desc().NullsLast())
			}
		}
		if sort[0] == "serial_number" {
			sortType := strings.ToLower(sort[1])
			if sortType == "asc" {
				queryBuilder = queryBuilder.Order(goqu.I("x.serial_number").Asc().NullsLast())
			} else {
				queryBuilder = queryBuilder.Order(goqu.I("x.serial_number").Desc().NullsLast())
			}
		}
		if sort[0] == "sales_code" {
			sortType := strings.ToLower(sort[1])
			if sortType == "asc" {
				queryBuilder = queryBuilder.Order(goqu.I("x.code").Asc().NullsLast())
			} else {
				queryBuilder = queryBuilder.Order(goqu.I("x.code").Desc().NullsLast())
			}
		}
	} else {
		queryBuilder = queryBuilder.Order(goqu.I("x.purchase_date").Desc().NullsLast(),
			goqu.I("x.bucket_id").Asc())
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"x.name":          goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"x.farmer_name":   goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"x.serial_number": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"x.code":          goqu.Op{"ilike": "%" + dto.Keyword + "%"},
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

	fmt.Println("GetStockList - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Stock List Query Error")
	}

	rows, err := str.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to get stock list")
	}

	var resModels []purchase.BucketDataModel
	for rows.Next() {
		var model purchase.BucketDataModel
		err = rows.Scan(
			&model.BucketID,
			&model.CoordinatorName,
			&model.FarmerName,
			&model.ProductType,
			&model.SerialNumber,
			&model.GradeInfoID,
			&model.SalesCode,
			&model.ClientName,
			&model.ClientCompany,
			&model.ClientCode,
			&model.Grade,
			&model.UnitPrice,
			&model.GradePrice,
			&model.WeightInfoID,
			&model.GrossWeight,
			&model.GoodsDate,
			&model.PurchaseID,
			&model.PurchaseGradeInfoID,
			&model.PurchaseSalesCode,
			&model.PurchaseClientName,
			&model.PurchaseClientCompany,
			&model.PurchaseClientCode,
			&model.PurchaseGrade,
			&model.PurchaseUnitPrice,
			&model.PurchaseGradePrice,
			&model.PurchasePrice,
			&model.PurchaseGrossWeight,
			&model.PurchaseNetWeight,
			&model.Status,
			&model.PurchaseDate,
			&model.InvoiceID,
			&model.InvoiceNumber,
			&model.LatestStatus,
			&model.LatestStatusAt,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		resModels = append(resModels, model) // add new row information
	}

	return resModels, nil
}

func (str stockRepository) GetStockDetailBySerialNumber(ctx context.Context, serialNumber string) (*GetStockDetailModel, error) {
	gradeInfoData := goqu.Select(
		goqu.I("gi.id").As("grade_info_id"),
		goqu.I("gi.goods_id").As("grade_info_goods_id"),
		"gd.grade",
		"gi.unit_price",
		"gd.price",
		goqu.I("cl.code").As("sales_code"),
		"ct.client_name",
		goqu.I("ct.code").As("client_code"),
		"gi.grader",
		goqu.I("gi.created_at").As("grade_info_created_at"),
		goqu.I("gidu.name").As("grade_info_created_by"),
		goqu.I("gi.deleted_at").As("grade_info_deleted_at"),
		goqu.I("gi.deleted_reason").As("grade_info_deleted_reason"),
	).Distinct().
		From(goqu.T("grade_information").As("gi")).
		InnerJoin(goqu.T("code_list").As("cl"),
			goqu.On(goqu.Ex{"cl.id": goqu.I("gi.code_id")})).
		InnerJoin(goqu.T("grades").As("gd"),
			goqu.On(goqu.Ex{"gd.id": goqu.I("gi.grade_id")})).
		InnerJoin(goqu.T("clients").As("ct"),
			goqu.On(goqu.Ex{"ct.id": goqu.I("gd.client_id")})).
		InnerJoin(goqu.T("users").As("gidu"),
			goqu.On(goqu.Ex{"gidu.id": goqu.I("gi.created_by")}))

	gradeInfoFinalData := goqu.Select(
		"gid.grade_info_goods_id",
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'grade_info_id', gid.grade_info_id,"+
			"	'grade', gid.grade,"+
			"	'unit_price', gid.unit_price,"+
			"	'grade_price', gid.price,"+
			"	'sales_code', gid.sales_code,"+
			"	'client_name', gid.client_name,"+
			"	'client_code', gid.client_code,"+
			"	'grader', gid.grader,"+
			"	'created_at', gid.grade_info_created_at at time zone 'utc',"+
			"	'created_by', gid.grade_info_created_by,"+
			"	'deleted_at', gid.grade_info_deleted_at at time zone 'utc',"+
			"	'deleted_reason', gid.grade_info_deleted_reason"+
			") ORDER BY gid.grade_info_created_at DESC)").As("grade_info_data"),
	).Distinct().
		From(goqu.T("grade_info_data").As("gid")).
		GroupBy("gid.grade_info_goods_id")

	weightInfoData := goqu.Select(
		goqu.I("wi.id").As("weight_info_id"),
		goqu.I("wi.goods_id").As("weight_info_goods_id"),
		"wi.gross_weight",
		goqu.I("wi.created_at").As("weight_info_created_at"),
		goqu.I("widu.name").As("weight_info_created_by"),
		goqu.I("wi.deleted_at").As("weight_info_deleted_at"),
		goqu.I("wi.deleted_reason").As("weight_info_deleted_reason"),
	).Distinct().
		From(goqu.T("weight_information").As("wi")).
		InnerJoin(goqu.T("users").As("widu"),
			goqu.On(goqu.Ex{"widu.id": goqu.I("wi.created_by")}))

	weightInfoFinalData := goqu.Select(
		"wid.weight_info_goods_id",
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'weight_info_id', wid.weight_info_id,"+
			"	'gross_weight', wid.gross_weight,"+
			"	'created_at', wid.weight_info_created_at at time zone 'utc',"+
			"	'created_by', wid.weight_info_created_by,"+
			"	'deleted_at', wid.weight_info_deleted_at at time zone 'utc',"+
			"	'deleted_reason',  wid.weight_info_deleted_reason"+
			") ORDER BY wid.weight_info_created_at DESC)").As("weight_info_data"),
	).Distinct().
		From(goqu.T("weight_info_data").As("wid")).
		GroupBy("wid.weight_info_goods_id")

	invoiceData := goqu.Select(
		goqu.I("idinv.id").As("invoice_id"),
		"idinv.invoice_number",
		"idip.purchase_id",
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'status', idis.status,"+
			"	'status_date', idis.created_at at time zone 'utc',"+
			"	'created_by', iduis.name"+
			") ORDER BY idis.id DESC)").As("status_list"),
		goqu.I("idinv.created_at").As("invoices_data_created_at"),
		goqu.I("iduinv.name").As("invoices_data_created_by"),
		goqu.I("idinv.deleted_reason").As("invoices_data_deleted_reason"),
	).From(goqu.T("invoices").As("idinv")).
		InnerJoin(goqu.T("invoice_purchase").As("idip"),
			goqu.On(goqu.Ex{"idip.invoice_id": goqu.I("idinv.id")})).
		LeftJoin(goqu.T("invoices_status").As("idis"),
			goqu.On(goqu.Ex{"idis.invoices_id": goqu.I("idinv.id")})).
		LeftJoin(goqu.T("users").As("iduis"),
			goqu.On(goqu.Ex{"iduis.id": goqu.I("idis.created_by")})).
		LeftJoin(goqu.T("users").As("iduinv"),
			goqu.On(goqu.Ex{"iduinv.id": goqu.I("idinv.created_by")})).
		GroupBy("idinv.id", "idinv.invoice_number", "idip.purchase_id", "iduinv.name")

	purchaseInfoData := goqu.Select(
		goqu.I("pi2.goods_id").As("purchase_info_goods_id"),
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'purchase_info_id', pi2.id,"+
			"	'grade_info_id', pdgid.grade_info_id,"+
			"	'grade', pdgid.grade,"+
			"	'unit_price', pdgid.unit_price,"+
			"	'grade_price', pdgid.price,"+
			"	'sales_code', pdgid.sales_code,"+
			"	'client_name', pdgid.client_name,"+
			"	'client_code',  pdgid.client_code,"+
			"	'grader', pdgid.grader,"+
			"	'weight_info_id', pdwid.weight_info_id,"+
			"	'gross_weight', pdwid.gross_weight,"+
			"	'purchase_gross_weight', pi2.gross_weight,"+
			"	'purchase_net_weight', pi2.net_weight,"+
			"	'invoice_number', invd.invoice_number,"+
			"	'status_list', invd.status_list,"+
			"	'created_at', pi2.created_at at time zone 'utc',"+
			"	'created_by', invd.invoices_data_created_by,"+
			"	'deleted_at', pi2.deleted_at at time zone 'utc',"+
			"	'deleted_reason', invd.invoices_data_deleted_reason"+
			") ORDER BY pi2.created_at DESC)").As("purchase_info_data"),
	).From(goqu.T("purchase_information").As("pi2")).
		InnerJoin(goqu.T("invoices_data").As("invd"),
			goqu.On(goqu.Ex{"invd.purchase_id": goqu.I("pi2.id")})).
		InnerJoin(goqu.T("grade_info_data").As("pdgid"),
			goqu.On(goqu.Ex{"pdgid.grade_info_id": goqu.I("pi2.grade_information_id")})).
		InnerJoin(goqu.T("weight_info_data").As("pdwid"),
			goqu.On(goqu.Ex{"pdwid.weight_info_id": goqu.I("pi2.weight_information_id")})).
		GroupBy("pi2.goods_id")

	sql, _, err := databaseImpl.QueryBuilder.
		Select("bi.id",
			"bi.serial_number",
			"uc.name",
			"qs.farmer_name",
			"g.id",
			"gifd.grade_info_data",
			"wifd.weight_info_data",
			"pid.purchase_info_data",
		).
		From(goqu.T("bucket_information").As("bi")).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.Ex{"qs.id": goqu.I("bi.queue_supplies_id")})).
		InnerJoin(goqu.T("coordinators").As("c"),
			goqu.On(goqu.Ex{"c.id": goqu.I("qs.coordinator_id")})).
		InnerJoin(goqu.T("users").As("uc"),
			goqu.On(goqu.Ex{"uc.id": goqu.I("c.user_id")})).
		InnerJoin(goqu.T("goods").As("g"),
			goqu.On(goqu.Ex{"g.bucket_id": goqu.I("bi.id")})).
		LeftJoin(goqu.T("grade_info_final_data").As("gifd"),
			goqu.On(goqu.Ex{"gifd.grade_info_goods_id": goqu.I("g.id")})).
		LeftJoin(goqu.T("weight_info_final_data").As("wifd"),
			goqu.On(goqu.Ex{"wifd.weight_info_goods_id": goqu.I("g.id")})).
		LeftJoin(goqu.T("purchase_info_data").As("pid"),
			goqu.On(goqu.Ex{"pid.purchase_info_goods_id": goqu.I("g.id")})).
		Where(goqu.Ex{"bi.serial_number": serialNumber}).
		With("grade_info_data", gradeInfoData).
		With("grade_info_final_data", gradeInfoFinalData).
		With("weight_info_data", weightInfoData).
		With("weight_info_final_data", weightInfoFinalData).
		With("invoices_data", invoiceData).
		With("purchase_info_data", purchaseInfoData).
		ToSQL()

	fmt.Println("GetStockDetailBySerialNumber - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Stock Detail Query Error")
	}

	row := str.Conn(ctx).QueryRow(ctx, sql)

	var model GetStockDetailModel
	err = row.Scan(
		&model.BucketID,
		&model.SerialNumber,
		&model.CoordinatorName,
		&model.FarmerName,
		&model.GoodsID,
		&model.GradeInfoDataList,
		&model.WeightInfoDataList,
		&model.PurchaseInfoDataList,
	)

	if err != nil {
		logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.ParsingParamError, "Error when try to parsing data")
	}

	return &model, nil
}

func (str stockRepository) GetStockSummary(ctx context.Context, dto GetStockListDto) (*GetStockSummaryModel, error) {
	goodsData := global.GetCompleteBucketDataQuery("")

	goodsDataFinal := goqu.Select("*").
		From(goqu.T("goods_data").As("gd"))

	goodsFinalFilter := goqu.Ex{}

	if len(dto.GoodsDate) > 0 {
		if len(dto.GoodsDateTo) > 0 {
			goodsDataFinal = goodsDataFinal.Where(goqu.Cast(goqu.L("(gd.goods_date AT TIME ZONE 'UTC')"), "DATE").
				Between(goqu.Range(dto.GoodsDate, dto.GoodsDateTo)))
		} else {
			goodsDataFinal = goodsDataFinal.Where(goqu.Cast(goqu.L("(gd.goods_date AT TIME ZONE 'UTC')"), "DATE").Eq(dto.GoodsDate))
		}
	}

	if len(dto.PurchaseDate) > 0 {
		if len(dto.PurchaseDateTo) > 0 {
			goodsDataFinal = goodsDataFinal.Where(goqu.Cast(goqu.L("(gd.purchase_date AT TIME ZONE 'UTC')"), "DATE").
				Between(goqu.Range(dto.PurchaseDate, dto.PurchaseDateTo)))
		} else {
			goodsDataFinal = goodsDataFinal.Where(goqu.Cast(goqu.L("(gd.purchase_date AT TIME ZONE 'UTC')"), "DATE").Eq(dto.PurchaseDate))
		}
	}

	if len(dto.GoodsStatus) > 0 {
		statusList := strings.Split(dto.GoodsStatus, ",")
		goodsFinalFilter["gd.status"] = goqu.Op{"in": statusList}
	}

	if len(dto.InvoiceStatus) > 0 {
		statusList := strings.Split(dto.InvoiceStatus, ",")
		goodsFinalFilter["gd.latest_status"] = goqu.Op{"in": statusList}
	}

	if len(dto.ClientCode) > 0 {
		clientList := strings.Split(dto.ClientCode, ",")
		goodsFinalFilter["gd.client_code"] = goqu.Op{"in": clientList}
	}

	goodsDataFinal = goodsDataFinal.Where(goodsFinalFilter)

	gradeGroup := goqu.Select(
		"client_code",
		"grade",
		goqu.COUNT("grade").As("total_grade"),
		goqu.SUM("purchase_net_weight").As("total_net_weight"),
		goqu.SUM("purchase_gross_weight").As("total_gross_weight"),
		goqu.L("FLOOR(COALESCE(SUM(purchase_price), 0) / "+
			"COALESCE(SUM(purchase_net_weight) / 1000, 1))").As("average_price"),
		goqu.SUM("purchase_price").As("total_purchase_price"),
	).From("goods_data_final").
		Where(goqu.Ex{"grade_info_id": goqu.Op{"neq": nil}}).
		GroupBy("client_code", "grade")

	clientGroup := goqu.Select(
		"client_code",
		"client_name",
		goqu.COUNT(goqu.I("goods_id").Distinct()).As("total_goods"),
		goqu.SUM("purchase_net_weight").As("total_net_weight"),
		goqu.SUM("purchase_gross_weight").As("total_gross_weight"),
		goqu.L("FLOOR(COALESCE(SUM(purchase_price), 0) / "+
			"COALESCE(SUM(purchase_net_weight) / 1000, 1))").As("average_price"),
		goqu.SUM("purchase_price").As("total_purchase_price"),
	).Distinct().
		From("goods_data_final").
		Where(goqu.Ex{"goods_id": goqu.Op{"neq": nil}}).
		GroupBy("client_code", "client_name")

	clientGradeGroup := goqu.Select(
		"cggd.client_code",
		"cggd.client_name",
		"cggd.total_goods",
		"cggd.total_net_weight",
		"cggd.average_price",
		"cggd.total_purchase_price",
		goqu.L("JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT("+
			"	'grade', gcg.grade,"+
			"	'total_goods',  gcg.total_grade,"+
			"	'total_net_weight',  gcg.total_net_weight,"+
			"	'total_gross_weight',  gcg.total_gross_weight,"+
			"	'average_price', gcg.average_price,"+
			"	'total_purchase_price', gcg.total_purchase_price"+
			"))").As("grade_recap_list"),
	).Distinct().
		From(goqu.T("client_group").As("cggd")).
		LeftJoin(goqu.T("grade_group").As("gcg"),
			goqu.On(goqu.Ex{"gcg.client_code": goqu.I("cggd.client_code")})).
		GroupBy("cggd.client_code", "cggd.client_name",
			"cggd.total_goods", "cggd.total_net_weight", "cggd.average_price",
			"cggd.total_purchase_price")

	clientGroupFinal := goqu.Select(
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT(" +
			"	'client_code', client_code," +
			"	'client_name', client_name," +
			"	'total_goods', total_goods," +
			"	'total_net_weight', total_net_weight," +
			"	'average_price', average_price," +
			"	'total_purchase_price', total_purchase_price," +
			"	'grade_recap_list', grade_recap_list" +
			") ORDER BY client_code ASC) " +
			"FILTER (WHERE total_goods > 0)").As("data_list"),
	).From("client_grade_group")

	gradeGroupForCoordinator := gradeGroup.
		SelectAppend("coordinator_code").
		GroupByAppend("coordinator_code")

	clientGroupForCoordinator := clientGroup.
		SelectAppend("coordinator_code").
		GroupByAppend("coordinator_code")

	clientGradeGroupForCoordinator := goqu.Select(
		"cgfc.client_code",
		"cgfc.client_name",
		"cgfc.coordinator_code",
		"cgfc.total_goods",
		"cgfc.total_net_weight",
		"cgfc.average_price",
		"cgfc.total_purchase_price",
		goqu.L("JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT("+
			"	'grade', gcg1.grade,"+
			"	'total_goods',  gcg1.total_grade,"+
			"	'total_net_weight',  gcg1.total_net_weight,"+
			"	'total_gross_weight',  gcg1.total_gross_weight,"+
			"	'average_price', gcg1.average_price,"+
			"	'total_purchase_price', gcg1.total_purchase_price"+
			"))").As("grade_recap_list"),
	).Distinct().
		From(goqu.T("client_group_for_coordinator").As("cgfc")).
		LeftJoin(goqu.T("grade_group_for_coordinator").As("gcg1"),
			goqu.On(goqu.Ex{
				"gcg1.client_code":      goqu.I("cgfc.client_code"),
				"gcg1.coordinator_code": goqu.I("cgfc.coordinator_code"),
			})).
		GroupBy("cgfc.client_code", "cgfc.client_name",
			"cgfc.total_goods", "cgfc.total_net_weight", "cgfc.average_price",
			"cgfc.total_purchase_price", "cgfc.coordinator_code")

	coordinatorGroup := goqu.Select(
		"coordinator_code",
		goqu.I("name").As("coordinator_name"),
		goqu.COUNT(goqu.I("goods_id").Distinct()).As("total_goods"),
		goqu.SUM("purchase_net_weight").As("total_net_weight"),
		goqu.SUM("purchase_gross_weight").As("total_gross_weight"),
		goqu.L("FLOOR(COALESCE(SUM(purchase_price), 0) / "+
			"COALESCE(SUM(purchase_net_weight) / 1000, 1))").As("average_price"),
		goqu.SUM("purchase_price").As("total_purchase_price"),
	).Distinct().
		From("goods_data_final").
		GroupBy("coordinator_code", "coordinator_name")

	coordinatorClientGroup := goqu.Select(
		"cog1.coordinator_code",
		"cog1.coordinator_name",
		"cog1.total_goods",
		"cog1.total_net_weight",
		"cog1.total_gross_weight",
		"cog1.average_price",
		"cog1.total_purchase_price",
		goqu.L("JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT("+
			"	'client_code', cggfc.client_code,"+
			"	'client_name',  cggfc.client_name,"+
			"	'total_goods',  cggfc.total_goods,"+
			"	'total_net_weight',  cggfc.total_net_weight,"+
			"	'average_price', cggfc.average_price,"+
			"	'total_purchase_price', cggfc.total_purchase_price,"+
			"	'grade_recap_list', cggfc.grade_recap_list"+
			"))").As("client_grade_recap_list"),
	).Distinct().
		From(goqu.T("coordinator_group").As("cog1")).
		LeftJoin(goqu.T("client_grade_group_for_coordinator").As("cggfc"),
			goqu.On(goqu.Ex{"cggfc.coordinator_code": goqu.I("cog1.coordinator_code")})).
		GroupBy("cog1.coordinator_code", "cog1.coordinator_name",
			"cog1.total_goods", "cog1.total_net_weight", "cog1.total_gross_weight",
			"cog1.average_price", "cog1.total_purchase_price")

	coordinatorGroupFinal := goqu.Select(
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT(" +
			"	'coordinator_code', coordinator_code," +
			"	'coordinator_name', coordinator_name," +
			"	'total_net_weight',  total_net_weight," +
			"	'total_gross_weight',  total_gross_weight," +
			"	'average_price', average_price," +
			"	'total_purchase_price', total_purchase_price," +
			"	'total_goods', total_goods," +
			"	'client_grade_recap_list', client_grade_recap_list" +
			") ORDER BY coordinator_code ASC) " +
			"FILTER (WHERE total_goods > 0)").As("data_list"),
	).From("coordinator_client_group")

	statusGroup := goqu.Select(
		"status",
		goqu.COUNT(goqu.I("goods_id").Distinct()).As("total_goods"),
	).Distinct().
		From("goods_data_final").
		GroupBy("status")

	statusGroupFinal := goqu.Select(
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT(" +
			"	'status', status," +
			"	'total_goods', total_goods" +
			") ORDER BY status) " +
			"FILTER (WHERE total_goods > 0)").As("data_list"),
	).From("status_group")

	invoiceStatusGroup := goqu.Select(
		"latest_status",
		goqu.COUNT(goqu.I("goods_id").Distinct()).As("total_goods"),
	).Distinct().
		From("goods_data_final").
		GroupBy("latest_status")

	invoiceStatusGroupFinal := goqu.Select(
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT(" +
			"	'status', latest_status," +
			"	'total_goods', total_goods" +
			") ORDER BY CASE" +
			"	WHEN latest_status = 'CONFIRMED_BY_COORDINATOR' THEN 1" +
			"	WHEN latest_status = 'PRINTED' THEN 2" +
			"	WHEN latest_status IN ('REJECTED', 'APPROVED') THEN 3" +
			"	WHEN latest_status = 'ON_PROGRESS' THEN 4" +
			"	WHEN latest_status = 'NOT_YET_INVOICED' THEN 5" +
			" END ASC) " +
			"FILTER (WHERE total_goods > 0)").As("data_list"),
	).From("invoice_status_group")

	queryBuilder := databaseImpl.QueryBuilder.
		Select(
			goqu.COALESCE(goqu.COUNT(goqu.I("goods_id").Distinct()), 0).As("parents_total_goods"),
			goqu.SUM("purchase_net_weight").As("total_net_weight"),
			goqu.SUM("purchase_gross_weight").As("total_gross_weight"),
			goqu.L("FLOOR(COALESCE(SUM(purchase_price), 0) / "+
				"COALESCE(SUM(purchase_net_weight) / 1000, 1))").As("average_price"),
			goqu.SUM("purchase_price").As("total_purchase_price"),
			goqu.COALESCE(goqu.I("cgf.data_list"), goqu.V("[]")),
			goqu.COALESCE(goqu.I("cogf.data_list"), goqu.V("[]")),
			goqu.COALESCE(goqu.I("sgf.data_list"), goqu.V("[]")),
			goqu.COALESCE(goqu.I("isgf.data_list"), goqu.V("[]")),
		).
		From(goqu.T("goods_data_final").As("gdf")).
		CrossJoin(goqu.T("client_group_final").As("cgf")).
		CrossJoin(goqu.T("coordinator_group_final").As("cogf")).
		CrossJoin(goqu.T("status_group_final").As("sgf")).
		CrossJoin(goqu.T("invoice_status_group_final").As("isgf")).
		With("goods_data", goodsData).
		With("goods_data_final", goodsDataFinal).
		With("grade_group", gradeGroup).
		With("client_group", clientGroup).
		With("client_grade_group", clientGradeGroup).
		With("client_group_final", clientGroupFinal).
		With("grade_group_for_coordinator", gradeGroupForCoordinator).
		With("client_group_for_coordinator", clientGroupForCoordinator).
		With("client_grade_group_for_coordinator", clientGradeGroupForCoordinator).
		With("coordinator_group", coordinatorGroup).
		With("coordinator_client_group", coordinatorClientGroup).
		With("coordinator_group_final", coordinatorGroupFinal).
		With("status_group", statusGroup).
		With("status_group_final", statusGroupFinal).
		With("invoice_status_group", invoiceStatusGroup).
		With("invoice_status_group_final", invoiceStatusGroupFinal).
		GroupBy("cgf.data_list", "cogf.data_list", "sgf.data_list", "isgf.data_list")

	filterQuery := goqu.Ex{"gdf.goods_id": goqu.Op{"neq": nil}}

	queryBuilder = queryBuilder.Where(filterQuery)

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetStockSummary - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Stock List Query Error")
	}

	row := str.Conn(ctx).QueryRow(ctx, sql)

	var model GetStockSummaryModel
	err = row.Scan(
		&model.ParentsTotalGoods,
		&model.TotalNetWeight,
		&model.TotalGrossWeight,
		&model.AveragePrice,
		&model.TotalPurchasePrice,
		&model.ClientGroupList,
		&model.CoordinatorGroupList,
		&model.StatusGroupList,
		&model.InvoiceStatusGroupList,
	)

	if err != nil {
		if err.Error() == "no rows in result set" {
			model.ParentsTotalGoods = 0
			model.ClientGroupList = make([]SummaryClientGroup, 0)
			model.CoordinatorGroupList = make([]SummaryCoordinatorGroup, 0)
			model.StatusGroupList = make([]SummaryStatusGroup, 0)
			model.InvoiceStatusGroupList = make([]SummaryInvoiceStatusGroup, 0)

			return &model, nil
		}

		logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.ParsingParamError, "Error when try to parsing data")
	}

	return &model, nil
}
