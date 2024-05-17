package commons

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"strconv"

	"github.com/doug-martin/goqu/v9"
)

type CommonsRepository interface {
	CheckExistIDs(ctx context.Context, ids []int64, tableName string, columnName string, useIsDelete bool, whereArgs ...WhereArgModel) (*ExistingIDModel, error)
	CheckExistID(ctx context.Context, id int64, tableName string, columnName string, useIsDelete bool, whereArgs ...WhereArgModel) (int64, error)
	//GetGoodsByIds(ctx context.Context, ids []int64, whereColumn string) ([]coordinator_supplies.CoordinatorSuppliesJoinModel, error)
	JoinTable() *goqu.SelectDataset
	PriceCalculator(params []PriceCalculatorParamsModel, mode constants.PriceCalculatorMode) *goqu.SelectDataset
}

type CommonsRepositoryOpts struct {
	ConnManager databaseImpl.ConnManager
}

func NewCommonsRepository(opts CommonsRepositoryOpts) CommonsRepository {
	return &commonsRepository{
		ConnManager: opts.ConnManager,
	}
}

type commonsRepository struct {
	databaseImpl.ConnManager
}

func (cmr *commonsRepository) CheckExistIDs(ctx context.Context, ids []int64, tableName string, columnName string, deletedAtIsNil bool, whereArgs ...WhereArgModel) (*ExistingIDModel, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		From(tableName).
		Select(columnName)

	filterQuery := goqu.Ex{}

	if ids != nil || len(ids) != 0 {
		filterQuery[columnName] = goqu.Op{"in": ids}
	}

	if deletedAtIsNil {
		filterQuery["deleted_at"] = nil
	}

	if len(whereArgs) > 0 {
		for _, whereArg := range whereArgs {
			filterQuery[whereArg.Column] = whereArg.Arg
		}
	}

	sql, _, _ := queryBuilder.Where(filterQuery).ToSQL()

	fmt.Println("CheckExistIDs - sql", sql)
	rows, err := cmr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get "+columnName)
	}

	var resIDs []int64
	mapIDs := make(map[string]bool)
	for rows.Next() {
		var resID int64
		err = rows.Scan(&resID)

		if err != nil {
			log.Println(err)
		}

		existID := "exist" + strconv.FormatInt(resID, 10)
		resIDs = append(resIDs, resID)
		mapIDs[existID] = true
	}

	if err != nil {
		return nil, errors.ParseError(ctx, err)
	}

	model := ExistingIDModel{
		ResID: resIDs,
		MapID: mapIDs,
	}

	return &model, nil
}

func (cmr *commonsRepository) CheckExistID(ctx context.Context, id int64, tableName string, columnName string, useIsDelete bool, whereArgs ...WhereArgModel) (int64, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		From(tableName).
		Select(columnName).
		Limit(1)

	filterQuery := goqu.Ex{}

	if useIsDelete {
		filterQuery["deleted_at"] = nil
	}

	if id != 0 {
		filterQuery[columnName] = id
	}

	if len(whereArgs) > 0 {
		for _, whereArg := range whereArgs {
			filterQuery[whereArg.Column] = whereArg.Arg
		}
	}

	sql, _, err := queryBuilder.Where(filterQuery).ToSQL()

	fmt.Println("CheckExistID - sql", sql)
	if err != nil {
		return 0, errors.Wrap(err, errors.DatabaseError, "Error when get "+columnName)
	}

	var resID int64
	row := cmr.Conn(ctx).QueryRow(ctx, sql)
	err = row.Scan(&resID)

	if err != nil {
		return 0, errors.ParseError(ctx, err)
	}

	return resID, nil
}

//func (cmr *commonsRepository) GetGoodsByIds(ctx context.Context, ids []int64, whereColumn string) ([]coordinator_supplies.CoordinatorSuppliesJoinModel, error) {
//	sql, _, err := databaseImpl.QueryBuilder.
//		Select(
//			"goods_information.id",
//			"barcode_product.company_barcode",
//			"weight_information.gross_weight",
//			"weight_information.net_weight",
//			"weight_information.real_gross_weight",
//			"weight_information.real_net_weight",
//			"weight_information.purchase_price",
//			"weight_information.sell_price",
//			"grades.id",
//			"grades.client_grade",
//			"grades.company_grade",
//		).
//		From("goods_information").
//		InnerJoin(
//			goqu.T("barcode_product"),
//			goqu.On(goqu.I("goods_information.barcode_id").Eq(goqu.I("barcode_product.id")))).
//		LeftJoin(
//			goqu.T("weight_information"),
//			goqu.On(goqu.I("goods_information.id").Eq(goqu.I("weight_information.goods_information_id")))).
//		LeftJoin(
//			goqu.T("grades"),
//			goqu.On(goqu.I("goods_information.grade_id").Eq(goqu.I("grades.id")))).
//		Where(goqu.I("goods_information." + whereColumn).In(ids)).
//		ToSQL()
//
//	if err != nil {
//		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
//		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
//	}
//
//	rows, err := cmr.Conn(ctx).Query(ctx, sql)
//
//	fmt.Println("GetGoodsByIds - sql", sql)
//
//	var listModel []coordinator_supplies.CoordinatorSuppliesJoinModel
//	for rows.Next() {
//		model := coordinator_supplies.CoordinatorSuppliesJoinModel{}
//		if err = rows.Scan(
//			&model.ID,
//			&model.CompanyBarcode,
//			&model.GrossWeight,
//			&model.NetWeight,
//			&model.RealGrossWeight,
//			&model.RealNetWeight,
//			&model.PurchasePrice,
//			&model.SellPrice,
//			&model.GradeID,
//			&model.ClientGrade,
//			&model.CompanyGrade,
//		); err != nil {
//			logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
//			return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
//		}
//
//		listModel = append(listModel, model) // add new row information
//	}
//
//	return listModel, nil
//}

func (cmr *commonsRepository) JoinTable() *goqu.SelectDataset {
	ds := databaseImpl.QueryBuilder.From("goods_information").
		LeftJoin(
			goqu.T("clients"),
			goqu.On(goqu.I("goods_information.client_id").Eq(goqu.I("clients.id")))).
		LeftJoin(goqu.T("barcode_product"),
			goqu.On(goqu.I("goods_information.barcode_id").Eq(goqu.I("barcode_product.id")))).
		Join(
			goqu.T("queue_supplies"),
			goqu.On(goqu.I("barcode_product.queue_supplies_id").Eq(goqu.I("queue_supplies.id")))).
		Join(
			goqu.T("coordinators"),
			goqu.On(goqu.I("queue_supplies.coordinator_id").Eq(goqu.I("coordinators.id")))).
		Join(
			goqu.T("coordinator_groups"),
			goqu.On(goqu.I("coordinators.group_id").Eq(goqu.I("coordinator_groups.id")))).
		Join(
			goqu.T("users"),
			goqu.On(goqu.I("coordinators.user_id").Eq(goqu.I("users.id")))).
		LeftJoin(
			goqu.T("grades"),
			goqu.On(goqu.I("goods_information.grade_id").Eq(goqu.I("grades.id")))).
		LeftJoin(goqu.T("profit_taking_dictionaries"),
			goqu.On(goqu.I("goods_information.profit_taking_id").Eq(goqu.I("profit_taking_dictionaries.id"))))

	return ds
}

func (cmr *commonsRepository) PriceCalculator(params []PriceCalculatorParamsModel, mode constants.PriceCalculatorMode) *goqu.SelectDataset {
	goodsJson, err := json.Marshal(params)
	if err != nil {
		return nil
	}
	goodsString := string(goodsJson)
	if len(params) == 0 {
		goodsString = "[]"
	}
	selectDataSet := databaseImpl.QueryBuilder.
		Select(goqu.L("'1' AS asd")).
		With("goods_param(goods_id, barcode_id, grade_id, client_id, grade_price,"+
			" unit_price, gw, client_code)",
			goqu.From(goqu.L("JSONB_TO_RECORDSET('"+goodsString+"') "+
				"AS goods_param(goods_id INT8, barcode_id INT8, grade_id INT8, "+
				"client_id INT8, grade_price INT8, unit_price INT8, gross_weight INT8)")).
				Select("gi4.id",
					"goods_param.barcode_id",
					"goods_param.grade_id",
					"goods_param.client_id",
					"goods_param.grade_price",
					"goods_param.unit_price",
					goqu.Case().
						When(goqu.Or(
							goqu.I("goods_param.gross_weight").Eq(0),
							goqu.I("goods_param.gross_weight").IsNull()),
							goqu.I("wi4.gross_weight")).
						Else(goqu.I("goods_param.gross_weight")),
					"cl.code",
				).
				InnerJoin(goqu.T("goods_information").As("gi4"),
					goqu.On(goqu.Or(
						goqu.I("goods_param.barcode_id").Eq(goqu.I("gi4.barcode_id")),
						goqu.I("goods_param.goods_id").Eq(goqu.I("gi4.id"))))).
				LeftJoin(goqu.T("weight_information").As("wi4"),
					goqu.On(goqu.I("gi4.id").Eq(goqu.I("wi4.goods_information_id")))).
				LeftJoin(goqu.T("clients").As("cl"),
					goqu.On(goqu.Or(
						goqu.I("goods_param.client_id").Eq(goqu.I("cl.id")),
						goqu.I("gi4.client_id").Eq(goqu.I("cl.id"))))),
		).
		With("gross(goods_id, cg_name, gw, rgw, grade_id, client_id, "+
			"grade_price, unit_price, old_client_id, client_code)",
			goqu.From(goqu.T("goods_param").As("gp")).
				Select(
					"gp.goods_id",
					"cg.group_name",
					"gp.gw",
					goqu.Case().
						When(goqu.And(
							goqu.I("gp.gw").Gt(63000),
							goqu.I("cg.group_name").Eq("B"),
							goqu.I("gp.client_code").Eq("DJRM")),
							62000).
						//When(goqu.And(
						//	goqu.L("MOD(gp.gw, 1000)").Gt(500),
						//	goqu.I("cg.group_name").Eq("B"),
						//	goqu.I("gp.client_code").Eq("DJRM")),
						//	goqu.L("gp.gw - MOD(gp.gw, 1000) - 1000")).
						//When(goqu.And(
						//	goqu.L("MOD(gp.gw, 1000)").Lte(500),
						//	goqu.I("cg.group_name").Eq("B"),
						//	goqu.I("gp.client_code").Eq("DJRM")),
						//	goqu.L("gp.gw - MOD(gp.gw, 1000) - 2000")).
						When(goqu.I("gp.gw").Gt(63000), 63000).
						When(goqu.And(
							goqu.I("cg.group_name").Eq("B"),
							goqu.I("gp.client_code").Eq("DJRM")),
							goqu.L("gp.gw - 1000")).
						//When(goqu.And(goqu.L("MOD(gp.gw, 1000)").Gt(500),
						//	goqu.I("gp.client_code").Eq("DJRM")),
						//	goqu.L("gp.gw - MOD(gp.gw, 1000)")).
						When(goqu.And(
							goqu.I("cg.group_name").Eq("A"),
							goqu.I("gp.client_code").Eq("DJRM")),
							goqu.I("gp.gw")).
						Else(goqu.L("FLOOR(gp.gw / 1000) * 1000")),
					"gp.grade_id",
					"gp.client_id",
					"gp.grade_price",
					"gp.unit_price",
					"gi2.client_id",
					"gp.client_code",
				).
				InnerJoin(goqu.T("goods_information").As("gi2"),
					goqu.On(goqu.I("gi2.id").Eq(goqu.I("gp.goods_id")))).
				InnerJoin(goqu.T("barcode_product").As("bp"),
					goqu.On(goqu.I("gi2.barcode_id").Eq(goqu.I("bp.id")))).
				InnerJoin(goqu.T("queue_supplies").As("qs"),
					goqu.On(goqu.I("bp.queue_supplies_id").Eq(goqu.I("qs.id")))).
				InnerJoin(goqu.T("coordinators").As("c"),
					goqu.On(goqu.I("qs.coordinator_id").Eq(goqu.I("c.id")))).
				InnerJoin(goqu.T("coordinator_groups").As("cg"),
					goqu.On(goqu.I("c.group_id").Eq(goqu.I("cg.id")))),
		).
		With("weight(goods_id, weight_id, nw, rnw, gw, rgw, grade_id, "+
			"client_id, grade_price, unit_price, old_client_id, barcode_id)",
			goqu.Select(
				"gross.goods_id",
				"wi2.id",
				"rdj.net_weight",
				goqu.Case().
					When(goqu.And(goqu.L("COALESCE(gross.rgw, wi2.gross_weight)").Lt(31000),
						goqu.I("gross.client_code").Eq("DJRM")),
						goqu.L("FLOOR(gross.rgw / 1000) * 1000 - 7000")).
					When(goqu.And(goqu.I("gross.cg_name").Eq("A"),
						goqu.I("gross.client_code").Eq("DJRM")),
						goqu.L("FLOOR(gross.rgw / 1000) * 1000 - CEIL(((ROUND(gross.rgw::numeric, -3)"+
							" - 1000) * 0.2 + 1000) / 1000::float4) * 1000")).
					When(goqu.And(goqu.I("gross.cg_name").Eq("B"),
						goqu.I("gross.client_code").Eq("DJRM")),
						goqu.L("FLOOR(gross.rgw / 1000) * 1000 - CEIL((((ROUND(gross.rgw::numeric, -3)"+
							" - 1000) - 1000) * 0.2) / 1000::float4) * 1000")).
					When(goqu.And(goqu.I("gross.cg_name").Eq("C"),
						goqu.I("gross.client_code").Eq("DJRM")),
						goqu.L("FLOOR(gross.rgw / 1000) * 1000 - CEIL(((ROUND(gross.rgw::numeric, -3)"+
							" - 1000) * 0.2) / 1000::float4) * 1000 ")).
					Else(goqu.L("FLOOR(gross.rgw / 1000) * 1000 - CEIL(((ROUND(gross.rgw::numeric, -3))"+
						" * 0.2) / 1000::float4) * 1000 ")),
				goqu.COALESCE(goqu.I("gross.gw"), goqu.I("wi2.gross_weight")),
				goqu.COALESCE(goqu.I("gross.rgw"), goqu.I("wi2.real_gross_weight")),
				"gross.grade_id",
				"gross.client_id",
				"gross.grade_price",
				"gross.unit_price",
				"gross.old_client_id",
				goqu.L("0::INT8 as barcode_id"),
			).
				From("gross").
				LeftJoin(goqu.T("weight_information").As("wi2"),
					goqu.On(goqu.I("gross.goods_id").Eq(goqu.I("wi2.goods_information_id")))).
				InnerJoin(goqu.T("rumus_djarum").As("rdj"),
					goqu.On(goqu.L("COALESCE(gross.gw, wi2.gross_weight)").Eq(goqu.I("rdj.gross_weight")))).
				Where(goqu.Ex{"wi2.deleted_at": nil}),
		)

	//if mode == constants.CREATE_WEIGHT || mode == constants.UPDATE_FINAL_GOODS {
	//	selectDataSet = selectDataSet.
	//		With("gross(goods_id, cg_name, gw, rgw, grade_id, client_id, "+
	//			"grade_price, unit_price, old_client_id)",
	//			goqu.From(goqu.T("goods_param").As("gp")).
	//				Select(
	//					"gp.goods_id",
	//					"cg.group_name",
	//					"gp.gw",
	//					goqu.Case().
	//						When(goqu.And(
	//							goqu.I("gp.gw").Gt(63000),
	//							goqu.I("cg.group_name").Eq("B")),
	//							62000).
	//						When(goqu.And(
	//							goqu.L("MOD(gp.gw, 1000)").Gt(500),
	//							goqu.I("cg.group_name").Eq("B")),
	//							goqu.L("gp.gw - MOD(gp.gw, 1000) - 1000")).
	//						When(goqu.I("gp.gw").Gt(63000), 62000).
	//						When(goqu.And(
	//							goqu.L("MOD(gp.gw, 1000)").Lte(500),
	//							goqu.I("cg.group_name").Eq("B")),
	//							goqu.L("gp.gw - MOD(gp.gw, 1000) - 2000")).
	//						When(goqu.L("MOD(gp.gw, 1000)").Gt(500),
	//							goqu.L("gp.gw - MOD(gp.gw, 1000)")).
	//						Else(goqu.L("gp.gw - MOD(gp.gw, 1000) - 1000")),
	//					"gp.grade_id",
	//					"gp.client_id",
	//					"gp.grade_price",
	//					"gp.unit_price",
	//					"gi2.client_id",
	//				).
	//				InnerJoin(goqu.T("goods_information").As("gi2"),
	//					goqu.On(goqu.I("gi2.id").Eq(goqu.I("gp.goods_id")))).
	//				InnerJoin(goqu.T("barcode_product").As("bp"),
	//					goqu.On(goqu.I("gi2.barcode_id").Eq(goqu.I("bp.id")))).
	//				InnerJoin(goqu.T("queue_supplies").As("qs"),
	//					goqu.On(goqu.I("bp.queue_supplies_id").Eq(goqu.I("qs.id")))).
	//				InnerJoin(goqu.T("coordinators").As("c"),
	//					goqu.On(goqu.I("qs.coordinator_id").Eq(goqu.I("c.id")))).
	//				InnerJoin(goqu.T("coordinator_groups").As("cg"),
	//					goqu.On(goqu.I("c.group_id").Eq(goqu.I("cg.id")))),
	//		).
	//		With("weight(goods_id, weight_id, nw, rnw, gw, rgw, grade_id, "+
	//			"client_id, grade_price, unit_price, old_client_id, barcode_id)",
	//			goqu.Select(
	//				"gross.goods_id",
	//				"wi2.id",
	//				"rdj.net_weight",
	//				goqu.Case().
	//					When(goqu.I("gross.rgw").Lt(31000),
	//						goqu.L("gross.rgw - 7000")).
	//					When(goqu.I("gross.cg_name").Eq("A"),
	//						goqu.L("gross.rgw - CEIL(((ROUND(gross.rgw::numeric, -3) - 1000)"+
	//							" * 0.2 + 1000) / 1000::float4) * 1000")).
	//					When(goqu.I("gross.cg_name").Eq("B"),
	//						goqu.L("gross.rgw - CEIL((((ROUND(gross.rgw::numeric, -3) - 1000) - 1000) * 0.2) / 1000::float4) * 1000")).
	//					Else(goqu.L("gross.rgw - CEIL(((ROUND(gross.rgw::numeric, -3) - 1000) * 0.2) / 1000::float4) * 1000 ")),
	//				"gross.gw",
	//				"gross.rgw",
	//				"gross.grade_id",
	//				"gross.client_id",
	//				"gross.grade_price",
	//				"gross.unit_price",
	//				"gross.old_client_id",
	//				goqu.L("0::INT8 as barcode_id"),
	//			).
	//				From("gross").
	//				InnerJoin(goqu.T("rumus_djarum").As("rdj"),
	//					goqu.On(goqu.I("gross.gw").Eq(goqu.I("rdj.gross_weight")))).
	//				LeftJoin(goqu.T("weight_information").As("wi2"),
	//					goqu.On(goqu.I("gross.goods_id").Eq(goqu.I("wi2.goods_information_id")))).
	//				Where(goqu.Ex{"wi2.deleted_at": nil}),
	//		)
	//} else if mode == constants.CREATE_AND_UPDATE_GOODS {
	//	selectDataSet = selectDataSet.
	//		With("weight(goods_id, weight_id, nw, rnw, gw, rgw, grade_id, "+
	//			"client_id, grade_price, unit_price, barcode_id, old_client_id)",
	//			goqu.Select(
	//				"wi.goods_information_id",
	//				"wi.id",
	//				"wi.net_weight",
	//				"wi.real_net_weight",
	//				"wi.gross_weight",
	//				"wi.real_gross_weight",
	//				"gp.grade_id",
	//				"gp.client_id",
	//				"gp.grade_price",
	//				"gp.unit_price",
	//				"gp.barcode_id",
	//				"gi2.client_id",
	//			).
	//				From(goqu.T("goods_param").As("gp")).
	//				InnerJoin(goqu.T("goods_information").As("gi2"),
	//					goqu.On(goqu.Or(
	//						goqu.I("gp.barcode_id").Eq(goqu.I("gi2.barcode_id")),
	//						goqu.I("gp.goods_id").Eq(goqu.I("gi2.id"))))).
	//				LeftJoin(goqu.T("weight_information").As("wi"),
	//					goqu.On(goqu.I("gi2.id").Eq(goqu.I("wi.goods_information_id")))))
	//}

	selectDataSet = selectDataSet.
		With("tax_data(id, val)",
			goqu.Select("id", "value").
				From("tax").
				Where(goqu.Ex{"deleted_at": nil}).Limit(1),
		).
		With("fee_data(id, val)",
			goqu.Select("id", "value").
				From("tax").
				Where(goqu.Ex{"deleted_at": nil}).Limit(1),
		)

	if mode == constants.CREATE_WEIGHT {
		selectDataSet = selectDataSet.
			With("goods(id, weight_id, gw, rgw, nw, rnw, purchase_price, selling_price,"+
				"tax_id, fee_id, tax_price, fee_price, total_purchase)",
				goqu.Select(
					goqu.COALESCE(goqu.I("gi3.id"), 0),
					"wi.id",
					goqu.COALESCE(goqu.I("weight.gw"), 0),
					goqu.COALESCE(goqu.I("weight.rgw"), 0),
					goqu.COALESCE(goqu.I("weight.nw"), 0),
					goqu.COALESCE(goqu.I("weight.rnw"), 0),
					goqu.COALESCE(goqu.L("gi3.price * weight.nw / 1000"), 0),
					goqu.COALESCE(goqu.L("gi3.unit_price * weight.rnw / 1000"), 0),
					goqu.COALESCE(goqu.Select("id").From("tax_data"), 0),
					goqu.COALESCE(goqu.Select("id").From("fee_data"), 0),
					goqu.COALESCE(goqu.L("gi3.unit_price * weight.rnw / 1000"+
						" * (SELECT val FROM tax_data) / 100"), 0),
					goqu.COALESCE(goqu.L("(SELECT val FROM fee_data) / 100"), 0),
					goqu.L("'0'::INT8 AS purchase_price"),
				).
					From(goqu.T("goods_information").As("gi3")).
					InnerJoin(goqu.T("weight"),
						goqu.On(goqu.I("gi3.id").Eq(goqu.I("weight.goods_id")))).
					LeftJoin(goqu.T("weight_information").As("wi"),
						goqu.On(goqu.I("gi3.id").Eq(goqu.I("wi.goods_information_id")))),
			)
	} else if mode == constants.CREATE_AND_UPDATE_GOODS || mode == constants.UPDATE_FINAL_GOODS {
		selectDataSet = selectDataSet.
			With("goods(id, weight_id, gw, rgw, nw, rnw, purchase_price, selling_price,"+
				"tax_id, fee_id, tax_price, fee_price, total_purchase, client_id)",
				goqu.Update(goqu.T("goods_information").As("gi3")).
					Set(goqu.Record{
						"grade_id":   goqu.I("weight.grade_id"),
						"client_id":  goqu.I("weight.client_id"),
						"unit_price": goqu.I("weight.unit_price"),
						"price":      goqu.I("weight.grade_price"),
					}).
					From("weight").
					Where(goqu.ExOr{
						"weight.goods_id":   goqu.I("gi3.id"),
						"weight.barcode_id": goqu.I("gi3.barcode_id"),
					}).
					Returning(
						"gi3.id",
						"weight.weight_id",
						"weight.gw",
						"weight.rgw",
						"weight.nw",
						"weight.rnw",
						goqu.L("gi3.price * weight.nw / 1000"),
						goqu.L("gi3.unit_price * weight.rnw / 1000"),
						goqu.Select("id").From("tax_data"),
						goqu.Select("id").From("fee_data"),
						goqu.L("gi3.unit_price * weight.rnw / 1000"+
							" * (SELECT val FROM tax_data) / 100"),
						goqu.L("(SELECT val FROM fee_data) / 100"),
						goqu.L("'0'::INT8 AS purchase_price"),
						"weight.old_client_id",
					),
			)
	}

	return selectDataSet
}
