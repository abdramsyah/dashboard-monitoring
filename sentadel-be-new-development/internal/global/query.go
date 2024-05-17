package global

import (
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"strings"

	"github.com/doug-martin/goqu/v9"
)

func GetGoodsQuery() *goqu.SelectDataset {
	return databaseImpl.QueryBuilder.
		Select("uc.name",
			"c.code",
			"qs.farmer_name",
			"qs.product_type",
			"g.id",
			"g.created_at",
			"ug.name",
			"bi.serial_number",
			"qd.delivery_number",
			goqu.COALESCE(goqu.L("ARRAY_AGG(JSONB_BUILD_OBJECT("+
				"	'sales_code', cl.code,"+
				"	'client_name', cli.client_name,"+
				"	'client_code', cli.code,"+
				"	'grade', gr.grade,"+
				"	'grade_price', gi.grade_price,"+
				"	'unit_price', gi.unit_price,"+
				"	'grading_date', gi.created_at at time zone 'utc',"+
				"	'grader_name', gi.grader,"+
				"	'grading_by', ugi.name,"+
				"	'deleted_date', gi.deleted_at at time zone 'utc'"+
				") ORDER BY gi.created_at DESC) FILTER (WHERE gi.id IS NOT NULL)"), goqu.L("ARRAY[]::JSONB[]")),
			goqu.COALESCE(goqu.L("ARRAY_AGG(JSONB_BUILD_OBJECT("+
				"	'gross_weight', wi.gross_weight,"+
				"	'weigh_date', wi.created_at at time zone 'utc',"+
				"	'weigh_by', uwi.name,"+
				"	'deleted_date', wi.deleted_at at time zone 'utc'"+
				") ORDER BY wi.created_at DESC) FILTER (WHERE wi.id IS NOT NULL)"), goqu.L("ARRAY[]::JSONB[]")),
			goqu.COUNT("*").Over(goqu.W()),
		).From(goqu.T("goods").As("g")).
		InnerJoin(goqu.T("bucket_information").As("bi"),
			goqu.On(goqu.Ex{"g.bucket_id": goqu.I("bi.id")})).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.Ex{"bi.queue_supplies_id": goqu.I("qs.id")})).
		InnerJoin(goqu.T("queue_delivery_list").As("qdl"),
			goqu.On(goqu.Ex{"qdl.queue_supplies_id": goqu.I("qs.id")})).
		InnerJoin(goqu.T("queue_delivery").As("qd"),
			goqu.On(goqu.Ex{"qd.id": goqu.I("qdl.queue_delivery_id")})).
		InnerJoin(goqu.T("coordinators").As("c"),
			goqu.On(goqu.Ex{"qs.coordinator_id": goqu.I("c.id")})).
		LeftJoin(goqu.T("weight_information").As("wi"),
			goqu.On(goqu.Ex{"g.id": goqu.I("wi.goods_id")})).
		LeftJoin(goqu.T("grade_information").As("gi"),
			goqu.On(goqu.Ex{"g.id": goqu.I("gi.goods_id")})).
		LeftJoin(goqu.T("grades").As("gr"),
			goqu.On(goqu.Ex{"gi.grade_id": goqu.I("gr.id")})).
		LeftJoin(goqu.T("clients").As("cli"),
			goqu.On(goqu.Ex{"cli.id": goqu.I("gr.client_id")})).
		LeftJoin(goqu.T("code_list").As("cl"),
			goqu.On(goqu.Ex{"gi.code_id": goqu.I("cl.id")})).
		LeftJoin(goqu.T("users").As("uc"),
			goqu.On(goqu.Ex{"c.user_id": goqu.I("uc.id")})).
		LeftJoin(goqu.T("users").As("ug"),
			goqu.On(goqu.Ex{"g.created_by": goqu.I("ug.id")})).
		LeftJoin(goqu.T("users").As("ugi"),
			goqu.On(goqu.Ex{"gi.created_by": goqu.I("ugi.id")})).
		LeftJoin(goqu.T("users").As("uwi"),
			goqu.On(goqu.Ex{"wi.created_by": goqu.I("uwi.id")})).
		GroupBy("g.id", "ug.id", "bi.serial_number", "uc.id", "c.id",
			"qs.id", "qd.delivery_number")
}

func GetCompleteBucketDataQuery(InvoiceStatus string) *goqu.SelectDataset {
	lastInvoiceStatus := goqu.Select("invoices_id",
		goqu.MAX("id").As("status_id")).
		From("invoices_status").
		GroupBy("invoices_id")

	invoiceData := goqu.Select("idinv.id",
		"idinv.invoice_number",
		"idip.purchase_id",
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'status', idis.status,"+
			"	'status_date', idis.created_at at time zone 'utc'"+
			") ORDER BY idis.id DESC)").As("status_list"),
		goqu.I("idis2.status").As("latest_status"),
		goqu.I("idis2.created_at").As("latest_status_at"),
	).
		From(goqu.T("invoices").As("idinv")).
		InnerJoin(goqu.T("invoice_purchase").As("idip"),
			goqu.On(goqu.Ex{"idip.invoice_id": goqu.I("idinv.id")})).
		LeftJoin(goqu.T("invoices_status").As("idis"),
			goqu.On(goqu.Ex{"idis.invoices_id": goqu.I("idinv.id")})).
		LeftJoin(goqu.T("last_invoice_status").As("idlis"),
			goqu.On(goqu.Ex{"idlis.invoices_id": goqu.I("idinv.id")})).
		LeftJoin(goqu.T("invoices_status").As("idis2"),
			goqu.On(goqu.Ex{"idis2.id": goqu.I("idlis.status_id")})).
		GroupBy("idinv.id", "idinv.invoice_number", "idip.purchase_id",
			"idis2.status", "idis2.created_at")

	invoiceDataFilter := goqu.Ex{"idinv.deleted_at": nil}

	if len(InvoiceStatus) > 0 {
		statusList := strings.Split(InvoiceStatus, ",")
		isOnProgress := false
		for _, status := range statusList {
			if status == "ON_PROGRESS" {
				isOnProgress = true
			}
		}
		invoiceDataFilter["idis.status"] = goqu.Op{"in": statusList}
		if isOnProgress {
			invoiceDataFilter["idis.id"] = goqu.Op{"neq": nil}
		} else {
			invoiceDataFilter["idis.id"] = nil
		}
	}

	invoiceData = invoiceData.Where(invoiceDataFilter)

	rejectReason := []string{"REJECTED_BY_GROUPING", "REJECTED"}

	lastGradeInfoIds := goqu.Select(goqu.MAX("id").As("id"), "goods_id").
		From("grade_information").
		GroupBy("goods_id")

	return goqu.Select(
		"uc.name",
		goqu.I("co.id").As("coordinator_id"),
		goqu.I("co.code").As("coordinator_code"),
		goqu.I("qs.id").As("queue_supplies_id"),
		goqu.I("g.id").As("goods_id"),
		goqu.I("g.created_at").As("goods_date"),
		goqu.I("bi.id").As("bucket_id"),
		goqu.I("pi2.id").As("purchase_id"),
		"bi.serial_number",
		"qs.partner_id",
		"qs.farmer_name",
		"qs.product_type",
		goqu.I("lgi.id").As("grade_info_id"),
		"gd.grade",
		"gd.ub",
		"c.client_name",
		"c.company",
		goqu.I("c.code").As("client_code"),
		"cl.code",
		"lgi.grade_price",
		"lgi.unit_price",
		goqu.I("wi.id").As("weight_info_id"),
		"wi.gross_weight",
		goqu.I("pgi.id").As("purchase_grade_info_id"),
		goqu.I("pgd.grade").As("purchase_grade"),
		goqu.I("pc.client_name").As("purchase_client_name"),
		goqu.I("pc.company").As("purchase_company"),
		goqu.I("pc.code").As("purchase_client_code"),
		goqu.I("pcl.code").As("purchase_sales_code"),
		goqu.I("pgi.grade_price").As("purchase_grade_price"),
		goqu.I("pgi.unit_price").As("purchase_unit_price"),
		goqu.I("pi2.gross_weight").As("purchase_gross_weight"),
		goqu.I("pi2.net_weight").As("purchase_net_weight"),
		"pi2.purchase_price",
		goqu.COALESCE(goqu.I("pi2.grade_information_excl_id"),
			goqu.L("ARRAY[]::INT8[]")).As("grade_information_excl_id"),
		goqu.COALESCE(goqu.I("pi2.weight_information_excl_id"),
			goqu.L("ARRAY[]::INT8[]")).As("weight_information_excl_id"),
		goqu.Case().
			When(goqu.I("lgi.deleted_reason").Eq("REJECTED_BY_GROUPING"), "REJECTED_BY_GROUPING").
			When(goqu.I("lgi.deleted_reason").Eq("REJECTED"), "REJECTED").
			When(goqu.I("pi2.id").IsNotNull(), "VALIDATED").
			When(goqu.Ex{
				"wi.id":  goqu.Op{"neq": nil},
				"lgi.id": goqu.Op{"neq": nil},
			}, "WAITING_TO_VALIDATE").
			When(goqu.ExOr{
				"wi.id":  goqu.Op{"neq": nil},
				"lgi.id": goqu.Op{"neq": nil},
			}, "ON_PROGRESS").
			When(goqu.I("wi.id").IsNotNull(), "WEIGH").
			When(goqu.I("lgi.id").IsNotNull(), "GRADE").
			When(goqu.I("g.id").IsNotNull(), "POUR_OUT").
			When(goqu.I("bi.deleted_reason").IsNotNull(), goqu.I("bi.deleted_reason")).
			Else("NOT_DELIVERED").As("status"),
		goqu.I("pi2.created_at").As("purchase_date"),
		goqu.I("inv.id").As("invoice_id"),
		"inv.invoice_number",
		"inv.status_list",
		goqu.Case().When(goqu.Ex{"pi2.id": goqu.Op{"neq": nil}},
			goqu.L("COALESCE(inv.latest_status::TEXT, 'ON_PROGRESS'::TEXT)")).
			Else(goqu.L("'NOT_YET_INVOICED'::TEXT")).As("latest_status"),
		goqu.COALESCE(goqu.I("inv.latest_status_at"), goqu.I("pi2.created_at")).As("latest_status_at"),
	).From(goqu.T("bucket_information").As("bi")).
		LeftJoin(goqu.T("goods").As("g"),
			goqu.On(goqu.Ex{"g.bucket_id": goqu.I("bi.id")})).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.Ex{"qs.id": goqu.I("bi.queue_supplies_id")})).
		InnerJoin(goqu.T("coordinators").As("co"),
			goqu.On(goqu.Ex{"co.id": goqu.I("qs.coordinator_id")})).
		InnerJoin(goqu.T("users").As("uc"),
			goqu.On(goqu.Ex{"uc.id": goqu.I("co.user_id")})).
		InnerJoin(goqu.T("last_grade_info_ids").As("lgii"),
			goqu.On(goqu.Ex{"lgii.goods_id": goqu.I("g.id")})).
		LeftJoin(goqu.T("grade_information").As("lgi"),
			goqu.On(goqu.Or(
				goqu.Ex{
					"lgi.deleted_at": nil,
					"lgi.id":         goqu.I("lgii.id"),
				}, goqu.Ex{
					"lgi.deleted_reason": goqu.Op{"in": rejectReason},
					"lgi.id":             goqu.I("lgii.id"),
				},
			))).
		LeftJoin(goqu.T("weight_information").As("wi"),
			goqu.On(goqu.Ex{
				"wi.deleted_at": nil,
				"wi.goods_id":   goqu.I("g.id"),
			})).
		LeftJoin(goqu.T("grades").As("gd"),
			goqu.On(goqu.Ex{"gd.id": goqu.I("lgi.grade_id")})).
		LeftJoin(goqu.T("clients").As("c"),
			goqu.On(goqu.Ex{"c.id": goqu.I("gd.client_id")})).
		LeftJoin(goqu.T("code_list").As("cl"),
			goqu.On(goqu.Ex{"cl.id": goqu.I("lgi.code_id")})).
		LeftJoin(goqu.T("purchase_information").As("pi2"),
			goqu.On(goqu.Ex{
				"pi2.goods_id":   goqu.I("g.id"),
				"pi2.deleted_at": nil,
			})).
		LeftJoin(goqu.T("grade_information").As("pgi"),
			goqu.On(goqu.Ex{"pgi.id": goqu.I("pi2.grade_information_id")})).
		LeftJoin(goqu.T("grades").As("pgd"),
			goqu.On(goqu.Ex{"pgd.id": goqu.I("pgi.grade_id")})).
		LeftJoin(goqu.T("clients").As("pc"),
			goqu.On(goqu.Ex{"pc.id": goqu.I("pgd.client_id")})).
		LeftJoin(goqu.T("code_list").As("pcl"),
			goqu.On(goqu.Ex{"pcl.id": goqu.I("pgi.code_id")})).
		LeftJoin(goqu.T("invoices_data").As("inv"),
			goqu.On(goqu.Ex{"inv.purchase_id": goqu.I("pi2.id")})).
		Where(goqu.Ex{"bi.deleted_at": nil}).
		With("last_invoice_status", lastInvoiceStatus).
		With("invoices_data", invoiceData).
		With("last_grade_info_ids", lastGradeInfoIds)
}
