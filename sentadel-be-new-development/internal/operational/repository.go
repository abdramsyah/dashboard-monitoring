package operational

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/global"
	"sentadel-backend/internal/logger"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
)

type OperationalRepository interface {
	CreateGradeInformation(ctx context.Context, models []GradingQueueDataModel, userID int64, isStockAdministrator bool) ([]GradingQueueResModel, error)
	GetGoodsInformation(ctx context.Context, dto GoodsInformationListDto) ([]GetGoodsModel, error)
	GetGoodsDetail(ctx context.Context, param string) (*GetGoodsModel, error)
	SetWeight(ctx context.Context, model SetWeightModel, userID int64) (bool, error)
	DeleteGradeInformation(ctx context.Context, models []GradingQueueDataModel) (bool, error)
	GetGoodsListForGrouping(ctx context.Context, params []GoodsDataForGroupingParams) ([]GoodsDataForGroupingModel, error)
	CreateGrouping(ctx context.Context, params []GoodsDataForGroupingModel, userID int64) (*GroupingQueueData, error)
	GetGroupingList(ctx context.Context, dto GoodsInformationListDto) ([]GroupingModel, error)
}

type operationalRepository struct {
	databaseImpl.ConnManager
}

func NewOperationalRepository(conn databaseImpl.ConnManager) *operationalRepository {
	return &operationalRepository{
		conn,
	}
}

func (opr operationalRepository) CreateGradeInformation(ctx context.Context, models []GradingQueueDataModel, userID int64, isStockAdministrator bool) ([]GradingQueueResModel, error) {
	jsonGradingData, _ := json.Marshal(models)

	goodsAllNewStatus := goqu.Case().
		When(goqu.I("pi2.id").IsNotNull(), constants.GradingValidated).
		When(goqu.I("gi.id").IsNotNull(), constants.GradingCreated).
		When(goqu.I("giused.id").IsNotNull(), constants.GradingUsed).
		Else(constants.GradingSuccess).As("new_status")

	handledStatus := []constants.GradingQueueDataStatus{
		constants.GradingSuccess,
	}

	if isStockAdministrator {
		handledStatus = []constants.GradingQueueDataStatus{
			constants.GradingSuccess,
			constants.GradingCreated,
			constants.GradingValidated,
		}
	}

	gradingParams := goqu.Select("*").
		From(goqu.L("JSONB_TO_RECORDSET('" + string(jsonGradingData) + "')" +
			"AS grading_params(index INT, serial_number VARCHAR, model_id VARCHAR, grade VARCHAR, " +
			"client_code VARCHAR, unit_price BIGINT, grader_name VARCHAR, " +
			"sales_code VARCHAR, status VARCHAR, message VARCHAR)"))

	goodsNA := goqu.Select("gp.*",
		goqu.I("bi.id").As("bucket_id"),
		goqu.I("g.id").As("goods_id"),
	).From(goqu.T("grading_params").As("gp")).
		InnerJoin(goqu.T("bucket_information").As("bi"),
			goqu.On(goqu.Ex{"gp.serial_number": goqu.I("bi.serial_number")})).
		LeftJoin(goqu.T("goods").As("g"),
			goqu.On(goqu.Ex{"bi.id": goqu.I("g.bucket_id")})).
		Where(goqu.Ex{"g.id": nil})

	createGoods := goqu.Insert("goods").
		Cols("bucket_id", "created_by").
		FromQuery(
			goqu.Select("bucket_id", goqu.V(userID)).
				From("goods_na")).
		Returning(goqu.I("id").As("goods_id"), "bucket_id")

	createNewCode := goqu.Insert("code_list").
		Cols("code", "created_by").
		FromQuery(goqu.Select("cncgp.sales_code", goqu.V(userID)).
			From(goqu.T("grading_params").As("cncgp")).
			LeftJoin(goqu.T("code_list").As("cnccl"),
				goqu.On(goqu.Ex{"cnccl.code": goqu.I("cncgp.sales_code")})).
			Where(goqu.Ex{
				"cncgp.client_code": "DJRM",
				"cnccl.id":          nil,
			}))

	goodsAll := goqu.Select("gp1.*",
		goqu.COALESCE(goqu.I("cg.goods_id"), goqu.I("g1.id")).As("goods_id"),
		goqu.I("gr.id").As("grade_id"),
		goqu.I("gr.price").As("grade_price"),
		goqu.I("cl.id").As("code_id"),
		goqu.I("c.id").As("client_id"),
		goqu.Case().
			When(goqu.I("pi2.id").IsNotNull(), "Barang sudah divalidasi").
			When(goqu.I("gi.id").IsNotNull(), goqu.L("'Barang sudah digrade oleh ' || ugi.name")).
			When(goqu.I("giused.id").IsNotNull(), "Barcode penjualan sudah digunakan").
			Else("").As("new_message"),
		goqu.Case().
			When(goqu.I("pi2.id").IsNotNull(), goqu.I("pi2.grade_information_id")).
			When(goqu.I("gi.id").IsNotNull(), goqu.I("gi.id")).
			When(goqu.I("giused.id").IsNotNull(), goqu.I("giused.id")).
			Else(0).As("reference_id"),
		goodsAllNewStatus,
	).From(goqu.T("grading_params").As("gp1")).
		InnerJoin(goqu.T("clients").As("c"),
			goqu.On(goqu.Ex{"gp1.client_code": goqu.I("c.code")})).
		InnerJoin(goqu.T("grades").As("gr"),
			goqu.On(goqu.Ex{
				"gp1.grade":     goqu.I("gr.grade"),
				"c.id":          goqu.I("gr.client_id"),
				"gr.deleted_at": nil,
			})).
		InnerJoin(goqu.T("bucket_information").As("bi1"),
			goqu.On(goqu.Ex{
				"gp1.serial_number": goqu.I("bi1.serial_number"),
				"bi1.deleted_at":    nil,
			})).
		LeftJoin(goqu.T("goods").As("g1"),
			goqu.On(goqu.Ex{"bi1.id": goqu.I("g1.bucket_id")})).
		LeftJoin(goqu.T("create_goods").As("cg"),
			goqu.On(goqu.Ex{"bi1.id": goqu.I("cg.bucket_id")})).
		InnerJoin(goqu.T("code_list").As("cl"),
			goqu.On(goqu.Ex{"gp1.sales_code": goqu.I("cl.code")})).
		LeftJoin(goqu.T("grade_information").As("gi"),
			goqu.On(goqu.Ex{
				"gi.goods_id": goqu.COALESCE(
					goqu.I("cg.goods_id"),
					goqu.I("g1.id")),
				"gi.deleted_at": nil,
			})).
		LeftJoin(goqu.T("grade_information").As("giused"),
			goqu.On(goqu.Ex{
				"giused.code_id":    goqu.I("cl.id"),
				"giused.deleted_at": nil,
			})).
		LeftJoin(goqu.T("users").As("ugi"),
			goqu.On(goqu.Ex{"gi.created_by": goqu.I("ugi.id")})).
		LeftJoin(goqu.T("purchase_information").As("pi2"),
			goqu.On(goqu.Ex{"g1.id": goqu.I("pi2.goods_id")}))

	createGradeInfo := goqu.Insert("grade_information").
		Cols("goods_id", "grade_id", "grade_price", "grader",
			"unit_price", "created_by", "code_id").
		FromQuery(
			goqu.Select("goods_id", "grade_id", "grade_price", "grader_name",
				"unit_price", goqu.V(userID), "code_id").
				From("goods_all").
				Where(goqu.Ex{"new_status": goqu.Op{"in": handledStatus}})).
		Returning("*")

	rollbackNotHandledStatus := goqu.Update("grade_information").
		Set(goqu.Record{"deleted_at": nil}).
		From(goqu.Select("grade_id").
			From("goods_all").
			Where(goqu.Ex{"new_status": goqu.Op{"notIn": handledStatus}}).As("rbga")).
		Where(goqu.Ex{"grade_information.id": goqu.I("rbga.grade_id")})

	sql, _, err := databaseImpl.QueryBuilder.
		Select("ga.index",
			"ga.serial_number",
			"ga.sales_code",
			"ga.client_id",
			goqu.Func("JSONB_BUILD_OBJECT",
				"serial_number", goqu.I("bi2.serial_number"),
				"grader_name", goqu.I("gi2.grader"),
				"grade", goqu.I("gr2.grade"),
				"grade_price", goqu.I("gi2.grade_price"),
				"unit_price", goqu.I("gi2.unit_price"),
				"sales_code", goqu.I("cl2.code"),
			),
			"ga.new_status",
			"ga.new_message",
		).From(goqu.T("goods_all").As("ga")).
		LeftJoin(goqu.T("grade_information").As("gi2"),
			goqu.On(goqu.Ex{"ga.reference_id": goqu.I("gi2.id")})).
		LeftJoin(goqu.T("grades").As("gr2"),
			goqu.On(goqu.Ex{"gi2.grade_id": goqu.I("gr2.id")})).
		LeftJoin(goqu.T("goods").As("g2"),
			goqu.On(goqu.Ex{"gi2.goods_id": goqu.I("g2.id")})).
		LeftJoin(goqu.T("bucket_information").As("bi2"),
			goqu.On(goqu.Ex{"g2.bucket_id": goqu.I("bi2.id")})).
		LeftJoin(goqu.T("code_list").As("cl2"),
			goqu.On(goqu.Ex{"cl2.id": goqu.I("gi2.code_id")})).
		With("grading_params", gradingParams).
		With("goods_na", goodsNA).
		With("create_goods", createGoods).
		With("create_new_code", createNewCode).
		With("goods_all", goodsAll).
		With("create_grade_info", createGradeInfo).
		With("rollback_not_handled_status", rollbackNotHandledStatus).
		ToSQL()

	fmt.Println("CreateGradeInformation - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Create Grade Information Query Error")
	}

	rows, err := opr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to create grade information")
	}

	var resModels []GradingQueueResModel
	for rows.Next() {
		var model GradingQueueResModel
		err = rows.Scan(
			&model.Index,
			&model.SerialNumber,
			&model.SalesCode,
			&model.ClientID,
			&model.ReferenceData,
			&model.Status,
			&model.Message,
		)

		if err != nil {
			logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
			log.Println(err)
		}

		resModels = append(resModels, model) // add new row information
	}

	return resModels, nil
}

func (opr operationalRepository) DeleteGradeInformation(ctx context.Context, models []GradingQueueDataModel) (bool, error) {
	var serialNumberList []string
	for _, model := range models {
		serialNumberList = append(serialNumberList, model.SerialNumber)
	}

	getGradeInfo := goqu.Select("gi.id").
		From(goqu.T("grade_information").As("gi")).
		InnerJoin(goqu.T("goods").As("g"),
			goqu.On(goqu.Ex{"g.id": goqu.I("gi.goods_id")})).
		InnerJoin(goqu.T("bucket_information").As("bi"),
			goqu.On(goqu.Ex{"bi.id": goqu.I("g.bucket_id")})).
		Where(goqu.Ex{
			"bi.serial_number": goqu.Op{"in": serialNumberList},
			"gi.deleted_at":    nil,
		})

	sql, _, err := databaseImpl.QueryBuilder.
		Update("grade_information").
		Set(goqu.Record{
			"deleted_at":     time.Now(),
			"deleted_reason": "UPDATED",
		}).Where(goqu.Ex{
		"id": goqu.Op{"in": goqu.Select("id").From("get_grade_info")},
	}).
		With("get_grade_info", getGradeInfo).
		ToSQL()

	fmt.Println("DeleteGradeInformation - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Delete Grade Information Query Error")
	}

	_, err = opr.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Error when try to delete grade information")
	}

	return true, nil
}

func (opr operationalRepository) GetGoodsInformation(ctx context.Context, dto GoodsInformationListDto) ([]GetGoodsModel, error) {
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
			if filter[0] == "is_weighed" {
				if len(filter[1]) > 0 && filter[1] == "true" {
					filterQuery["wi.id"] = goqu.Op{"neq": nil}
				}
			}
			if filter[0] == "on_progress" {
				filterQuery["pd.goods_id"] = nil
			}
		}
	}

	//if dto.IsWaitingToValidate != nil {
	//	if *dto.IsWaitingToValidate == true {
	//		queryBuilder = queryBuilder.
	//			LeftJoin(goqu.T("purchase_information").As("pi2"),
	//				goqu.On(goqu.Ex{"pi2.goods_id": goqu.I("g.id")}))
	//
	//		filterQuery["g.id"] = goqu.Op{"neq": nil}
	//		filterQuery["gi.id"] = goqu.Op{"neq": nil}
	//		filterQuery["wi.id"] = goqu.Op{"neq": nil}
	//	} else if *dto.IsWaitingToValidate == false {
	//		filterQuery["g.id"] = nil
	//		filterQuery["gi.id"] = nil
	//		filterQuery["wi.id"] = nil
	//	}
	//}

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

	fmt.Println("GetGoodsInformation - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Goods Information Query Error")
	}

	rows, err := opr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to create grade information")
	}

	var resModels []GetGoodsModel
	for rows.Next() {
		var model GetGoodsModel
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
			logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
			log.Println(err)
		}

		resModels = append(resModels, model) // add new row information
	}

	return resModels, nil
}

func (opr operationalRepository) GetGoodsDetail(ctx context.Context, param string) (*GetGoodsModel, error) {
	queryBuilder := global.GetGoodsQuery().Limit(1)

	queryBuilder = queryBuilder.Where(goqu.And(
		goqu.I("c.deleted_at").IsNull(),
		goqu.I("uc.deleted_at").IsNull(),
		goqu.Or(
			goqu.I("cl.code").Eq(param),
			goqu.I("bi.serial_number").Eq(param),
		),
	))

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetGoodDetail - sql", sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Goods Detail Query Error")
	}

	row := opr.Conn(ctx).QueryRow(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to get goods detail")
	}

	var model GetGoodsModel
	err = row.Scan(
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
		logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
		log.Println(err)
	}

	return &model, nil
}

func (opr operationalRepository) SetWeight(ctx context.Context, model SetWeightModel, userID int64) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("weight_information").
		Rows(goqu.Record{
			"goods_id":     model.GoodsID,
			"gross_weight": model.GrossWeight,
			"net_weight":   0,
			"created_by":   userID,
		}).
		With("get_weight",
			goqu.Select("id").
				From(goqu.T("weight_information").As("wi")).
				Where(goqu.Ex{
					"wi.goods_id":   model.GoodsID,
					"wi.deleted_at": nil,
				}).Limit(1),
		).
		With("update_weight",
			goqu.Update("weight_information").
				Set(goqu.Record{
					"deleted_at":     goqu.L("CURRENT_TIMESTAMP"),
					"deleted_reason": "UPDATED",
				}).
				Where(goqu.Ex{"id": goqu.Select("id").From("get_weight")}),
		).ToSQL()

	fmt.Println("SetWeight - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Set Weight Query Error")
	}

	_, err = opr.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Error when try to set weight")
	}

	if err != nil {
		log.Println(err)
	}

	return true, nil
}

func (opr operationalRepository) GetGoodsListForGrouping(ctx context.Context, params []GoodsDataForGroupingParams) ([]GoodsDataForGroupingModel, error) {
	paramsJson, _ := json.Marshal(params)
	paramsString := string(paramsJson)
	if len(params) == 0 {
		paramsString = "[]"
	}

	paramsTable := goqu.Select("*").
		From(goqu.L("JSONB_TO_RECORDSET('" + paramsString + "') " +
			"AS params_table(index INT8, serial_number_or_code VARCHAR, djarum_grade VARCHAR)"))

	queryBuilder := databaseImpl.QueryBuilder.
		Select("pst.index",
			"gl.id",
			"sg.id",
			"g.id",
			"gi.id",
			"wi.id",
			"bi.serial_number",
			"cl.code",
			"qs.product_type",
			"uc.name",
			"qs.farmer_name",
			"c.id",
			"c.client_name",
			"c.code",
			"gd.grade",
			"pst.djarum_grade",
			"gd.ub",
			"gi.grader",
			"gi.created_at",
			"ugi.name",
			"grp.grouping_number",
			"grp.created_at",
			"ugrp.name",
			goqu.Case().
				When(goqu.I("g.id").IsNull(), "NOT_YET_POURED_OUT").
				When(goqu.I("gi.id").IsNull(), "NOT_YET_GRADED").
				When(goqu.I("wi.id").IsNull(), "NOT_YET_WEIGHED").
				When(goqu.I("gl.id").IsNull(), "READY").
				When(goqu.I("gl.id").IsNotNull(), "GROUPED_ALREADY").
				When(goqu.I("sg.id").IsNotNull(), "SHIPPED_ALREADY"),
		).From(goqu.T("bucket_information").As("bi")).
		LeftJoin(goqu.T("goods").As("g"),
			goqu.On(goqu.Ex{"g.bucket_id": goqu.I("bi.id")})).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.Ex{"qs.id": goqu.I("bi.queue_supplies_id")})).
		InnerJoin(goqu.T("coordinators").As("co"),
			goqu.On(goqu.Ex{"co.id": goqu.I("qs.coordinator_id")})).
		InnerJoin(goqu.T("users").As("uc"),
			goqu.On(goqu.Ex{"uc.id": goqu.I("co.user_id")})).
		LeftJoin(goqu.T("grade_information").As("gi"),
			goqu.On(goqu.Ex{
				"gi.deleted_at": nil,
				"gi.goods_id":   goqu.I("g.id"),
			})).
		LeftJoin(goqu.T("weight_information").As("wi"),
			goqu.On(goqu.Ex{
				"wi.deleted_at": nil,
				"wi.goods_id":   goqu.I("g.id"),
			})).
		LeftJoin(goqu.T("grades").As("gd"),
			goqu.On(goqu.Ex{"gd.id": goqu.I("gi.grade_id")})).
		LeftJoin(goqu.T("clients").As("c"),
			goqu.On(goqu.Ex{"c.id": goqu.I("gd.client_id")})).
		LeftJoin(goqu.T("code_list").As("cl"),
			goqu.On(goqu.Ex{"cl.id": goqu.I("gi.code_id")})).
		LeftJoin(goqu.T("grouping_list").As("gl"),
			goqu.On(goqu.Ex{
				"gl.deleted_at": nil,
				"gl.goods_id":   goqu.I("g.id"),
			})).
		LeftJoin(goqu.T("shipment_goods").As("sg"),
			goqu.On(goqu.Ex{
				"sg.deleted_at":       nil,
				"sg.grouping_list_id": goqu.I("gl.id"),
			})).
		LeftJoin(goqu.T("grouping").As("grp"),
			goqu.On(goqu.Ex{"grp.id": goqu.I("gl.grouping_id")})).
		LeftJoin(goqu.T("users").As("ugi"),
			goqu.On(goqu.Ex{"ugi.id": goqu.I("gi.created_by")})).
		LeftJoin(goqu.T("users").As("ugrp"),
			goqu.On(goqu.Ex{"ugrp.id": goqu.I("grp.created_by")})).
		LeftJoin(goqu.T("params_table").As("pst"),
			goqu.On(goqu.ExOr{
				"cl.code":          goqu.I("pst.serial_number_or_code"),
				"bi.serial_number": goqu.I("pst.serial_number_or_code"),
			})).
		Where(goqu.Ex{
			"pst.index": goqu.Op{"neq": nil},
		}).
		Order(goqu.I("pst.index").Asc()).
		With("params_table", paramsTable)

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetGoodsListForGrouping - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Goods List For Grouping Query Error")
	}

	rows, err := opr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to get goods list for grouping")
	}

	var resModels []GoodsDataForGroupingModel
	for rows.Next() {
		var model GoodsDataForGroupingModel
		err = rows.Scan(
			&model.Index,
			&model.GroupingListID,
			&model.ShipmentGoodsID,
			&model.GoodsID,
			&model.GradeInfoID,
			&model.WeightInfoID,
			&model.SerialNumber,
			&model.SalesCode,
			&model.ProductType,
			&model.CoordinatorName,
			&model.FarmerName,
			&model.ClientID,
			&model.ClientName,
			&model.ClientCode,
			&model.Grade,
			&model.DjarumGrade,
			&model.UB,
			&model.Grader,
			&model.GradingDate,
			&model.GradingBy,
			&model.GroupingNumber,
			&model.GroupingDate,
			&model.GroupingBy,
			&model.Status,
		)

		if err != nil {
			log.Println(err)
		}

		resModels = append(resModels, model) // add new row information
	}

	if err != nil {
		logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
		log.Println(err)
	}

	return resModels, nil
}

func (opr operationalRepository) GetGroupingList(ctx context.Context, dto GoodsInformationListDto) ([]GroupingModel, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select(
			"grp.id",
			"grp.grouping_number",
			"grp.client_number",
			"grp.client_id",
			"c.client_name",
			"c.code",
			"grp.grade_initial",
			"grp.ub",
			goqu.COUNT("grpl.id"),
			goqu.MAX("grpl.created_at"),
			"grp.created_at",
			"u.name",
			goqu.COUNT("*").Over(goqu.W()),
		).
		From(goqu.T("grouping").As("grp")).
		InnerJoin(goqu.T("grouping_list").As("grpl"),
			goqu.On(goqu.Ex{
				"grpl.grouping_id": goqu.I("grp.id"),
				"grpl.deleted_at":  nil,
			})).
		InnerJoin(goqu.T("clients").As("c"),
			goqu.On(goqu.Ex{"c.id": goqu.I("grp.client_id")})).
		InnerJoin(goqu.T("users").As("u"),
			goqu.On(goqu.Ex{"u.id": goqu.I("grp.created_by")})).
		GroupBy("grp.id", "grp.grouping_number", "grp.client_number",
			"grp.client_id", "c.client_name", "c.code", "grp.grade_initial",
			"grp.ub", "grp.created_at", "u.name")

	filterQuery := goqu.Ex{
		"grp.deleted_at": nil,
		"u.deleted_at":   nil,
		"c.deleted_at":   nil,
	}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "grouping_number" {
				filterArg := strings.Split(filter[1], ",")
				filterQuery["grp.grouping_number"] = goqu.Op{"in": filterArg}
			}
		}
	}

	if len(dto.SortBy) > 0 {
		for _, sortVal := range dto.SortBy {
			sort := strings.Split(sortVal, ":")
			if len(sort[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if sort[0] == "client_name" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.I("c.client_name").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("c.client_name").Desc())
				}
			}
			if sort[0] == "grouping_date" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.I("grp.created_at").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("grp.created_at").Desc())
				}
			}
			if sort[0] == "last_update_date" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.MAX("grpl.created_at").Asc().NullsLast())
				} else {
					queryBuilder = queryBuilder.Order(goqu.MAX("grpl.created_at").Desc().NullsLast())
				}
			}
		}
	} else {
		queryBuilder = queryBuilder.Order(goqu.MAX(goqu.I("grpl.created_at")).Desc())
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"grp.grouping_number": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"grp.client_number":   goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			// "grpl.serial_number":  goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			// "grpl.sales_code":     goqu.Op{"ilike": "%" + dto.Keyword + "%"},
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

	fmt.Println("GetGroupingList - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Grouping List Query Error")
	}

	rows, err := opr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to get grouping list")
	}

	var resModels []GroupingModel
	for rows.Next() {
		var model GroupingModel
		err = rows.Scan(
			&model.GroupingID,
			&model.GroupingNumber,
			&model.GroupingClientNumber,
			&model.ClientID,
			&model.ClientName,
			&model.ClientCode,
			&model.GradeInitial,
			&model.UB,
			&model.TotalGoods,
			&model.LastUpdated,
			&model.CreatedAt,
			&model.CreatedBy,
			&model.Total,
		)

		if err != nil {
			logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
			log.Println(err)
		}

		resModels = append(resModels, model) // add new row information
	}

	return resModels, nil
}

func createGroupingNumber(ClientCode string) string {
	return "G-" + strings.ToUpper(ClientCode) + time.Now().Local().Format("060102")
}

func (opr operationalRepository) CreateGrouping(ctx context.Context, params []GoodsDataForGroupingModel, userID int64) (*GroupingQueueData, error) {
	grade := ""
	if params[0].Grade != nil {
		grade = *params[0].Grade
	}

	createGrouping := goqu.Insert("grouping").
		Rows(goqu.Record{
			"grouping_number": goqu.Func("get_grouping_number", createGroupingNumber(*params[0].ClientCode)),
			"client_id":       *params[0].ClientID,
			"grade_initial":   string(grade[0]),
			"ub":              *params[0].UB,
			"created_by":      userID,
		}).Returning("id", "grouping_number")

	var goodsParams []goqu.Record
	for _, goods := range params {
		goodsParams = append(goodsParams, goqu.Record{
			"grouping_id":           goqu.Select("id").From("create_grouping"),
			"goods_id":              goods.GoodsID,
			"grade_information_id":  goods.GradeInfoID,
			"weight_information_id": goods.WeightInfoID,
			"created_by":            userID,
		})
	}

	createGroupingList := goqu.Insert("grouping_list").Rows(goodsParams)

	sql, _, err := databaseImpl.QueryBuilder.
		Select("id", "grouping_number").
		From("create_grouping").
		With("create_grouping", createGrouping).
		With("create_grouping_list", createGroupingList).
		ToSQL()

	fmt.Println("CreateGrouping - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Create Grouping Query Error")
	}

	row := opr.Conn(ctx).QueryRow(ctx, sql)

	var model GroupingQueueData
	err = row.Scan(
		&model.GroupingID,
		&model.GroupingNumber,
	)

	if err != nil {
		logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
		log.Println(err)
	}

	return &model, nil
}

// func (opr operationalRepository) GetDataTypeGoods(ctx context.Context, groupingIds []int64) (*GroupingQueueData, error) {
// 	grade := ""
// 	if params[0].Grade != nil {
// 		grade = *params[0].Grade
// 	}

// 	createGrouping := goqu.Insert("grouping").
// 		Rows(goqu.Record{
// 			"grouping_number": goqu.Func("get_grouping_number", createGroupingNumber(*params[0].ClientCode)),
// 			"client_id":       *params[0].ClientID,
// 			"grade_initial":   string(grade[0]),
// 			"ub":              *params[0].UB,
// 			"created_by":      userID,
// 		}).Returning("id", "grouping_number")

// 	var goodsParams []goqu.Record
// 	for _, goods := range params {
// 		goodsParams = append(goodsParams, goqu.Record{
// 			"grouping_id":           goqu.Select("id").From("create_grouping"),
// 			"goods_id":              goods.GoodsID,
// 			"grade_information_id":  goods.GradeInfoID,
// 			"weight_information_id": goods.WeightInfoID,
// 			"created_by":            userID,
// 		})
// 	}

// 	createGroupingList := goqu.Insert("grouping_list").Rows(goodsParams)

// 	sql, _, err := databaseImpl.QueryBuilder.
// 		Select("id", "grouping_number").
// 		From("create_grouping").
// 		With("create_grouping", createGrouping).
// 		With("create_grouping_list", createGroupingList).
// 		ToSQL()

// 	fmt.Println("CreateGrouping - sql", sql)
// 	if err != nil {
// 		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
// 		return nil, errors.Wrap(err, errors.DatabaseError, "Create Grouping Query Error")
// 	}

// 	row := opr.Conn(ctx).QueryRow(ctx, sql)

// 	var model GroupingQueueData
// 	err = row.Scan(
// 		&model.GroupingID,
// 		&model.GroupingNumber,
// 	)

// 	if err != nil {
// 		logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
// 		log.Println(err)
// 	}

// 	return &model, nil
// }
