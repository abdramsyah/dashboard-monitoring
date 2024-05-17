package sales

import (
	"context"
	"fmt"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/global"
	"sentadel-backend/internal/logger"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
)

type SalesRepository interface {
	CreateGrouping(ctx context.Context, params []GoodsDataForGroupingModel, userID int64) (*GroupingQueueData, error)
	GetGroupingList(ctx context.Context, dto GroupingListDto) ([]GroupingModel, error)
	GetGroupingDetail(ctx context.Context, dto GroupingDetailDto, keyParam string) (*GroupingDetailModel, error)
	UpdateGroupingList(ctx context.Context, params UpdateGroupingParamsDto, userID int64) (bool, error)
	CreateShipment(ctx context.Context, params CreateShipmentDto, userID int64) (*ShipmentQueueData, error)
}

type salesRepository struct {
	databaseImpl.ConnManager
}

func NewSalesRepository(conn databaseImpl.ConnManager) *salesRepository {
	return &salesRepository{
		conn,
	}
}

func (sar salesRepository) GetGroupingList(ctx context.Context, dto GroupingListDto) ([]GroupingModel, error) {
	goodsList := goqu.Select(
		goqu.I("grp1.id").As("grouping_id"),
		goqu.I("uco1.name").As("coordinator_name"),
		goqu.I("co1.code").As("coordinator_code"),
		"qs1.farmer_name",
		"bi1.serial_number",
		"cl1.code",
	).From(goqu.T("grouping_list").As("grpl1")).
		InnerJoin(goqu.T("grouping").As("grp1"),
			goqu.On(goqu.Ex{"grp1.id": goqu.I("grpl1.grouping_id")})).
		InnerJoin(goqu.T("goods").As("g1"),
			goqu.On(goqu.Ex{"g1.id": goqu.I("grpl1.goods_id")})).
		InnerJoin(goqu.T("bucket_information").As("bi1"),
			goqu.On(goqu.Ex{"bi1.id": goqu.I("g1.bucket_id")})).
		InnerJoin(goqu.T("queue_supplies").As("qs1"),
			goqu.On(goqu.Ex{"qs1.id": goqu.I("bi1.queue_supplies_id")})).
		InnerJoin(goqu.T("grade_information").As("gi1"),
			goqu.On(goqu.Ex{"gi1.id": goqu.I("grpl1.grade_information_id")})).
		InnerJoin(goqu.T("code_list").As("cl1"),
			goqu.On(goqu.Ex{"cl1.id": goqu.I("gi1.code_id")})).
		InnerJoin(goqu.T("coordinators").As("co1"),
			goqu.On(goqu.Ex{"co1.id": goqu.I("qs1.coordinator_id")})).
		InnerJoin(goqu.T("users").As("uco1"),
			goqu.On(goqu.Ex{"uco1.id": goqu.I("co1.user_id")})).
		Where(goqu.Ex{
			"grp1.deleted_at":  nil,
			"grpl1.deleted_at": nil,
			"co1.deleted_at":   nil,
			"uco1.deleted_at":  nil,
		})

	goodsListForRecap := goqu.Select(
		goqu.I("grp.id").As("grouping_id"),
		"grp.grouping_number",
		"grp.client_number",
		"grp.grade_initial",
		"grp.ub",
		"c.client_name",
		goqu.I("c.code").As("client_code"),
		goqu.I("ugrp.name").As("grouping_created_by"),
		goqu.I("grp.created_at").As("grouping_created_at"),
		goqu.I("g.id").As("goods_id"),
		"qs.product_type",
		goqu.I("uco.name").As("coordinator_name"),
		goqu.I("co.code").As("coordinator_code"),
		"qs.partner_id",
		"qs.farmer_name",
		goqu.I("gi.id").As("grade_info_id"),
		"gd.grade",
		"gi.grade_price",
		"gi.unit_price",
		"gi.grader",
		goqu.I("wi.id").As("weight_info_id"),
		"wi.gross_weight",
		goqu.Func("create_client_weight",
			goqu.I("wi.gross_weight"), goqu.I("c.code")).As("client_net_weight"),
	).From(goqu.T("grouping_list").As("grpl")).
		InnerJoin(goqu.T("grouping").As("grp"),
			goqu.On(goqu.Ex{"grp.id": goqu.I("grpl.grouping_id")})).
		InnerJoin(goqu.T("clients").As("c"),
			goqu.On(goqu.Ex{"c.id": goqu.I("grp.client_id")})).
		InnerJoin(goqu.T("goods").As("g"),
			goqu.On(goqu.Ex{"g.id": goqu.I("grpl.goods_id")})).
		InnerJoin(goqu.T("grade_information").As("gi"),
			goqu.On(goqu.Ex{"gi.id": goqu.I("grpl.grade_information_id")})).
		InnerJoin(goqu.T("grades").As("gd"),
			goqu.On(goqu.Ex{"gd.id": goqu.I("gi.grade_id")})).
		InnerJoin(goqu.T("weight_information").As("wi"),
			goqu.On(goqu.Ex{"wi.id": goqu.I("grpl.weight_information_id")})).
		InnerJoin(goqu.T("bucket_information").As("bi"),
			goqu.On(goqu.Ex{"bi.id": goqu.I("g.bucket_id")})).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.Ex{"qs.id": goqu.I("bi.queue_supplies_id")})).
		InnerJoin(goqu.T("coordinators").As("co"),
			goqu.On(goqu.Ex{"co.id": goqu.I("qs.coordinator_id")})).
		InnerJoin(goqu.T("users").As("uco"),
			goqu.On(goqu.Ex{"uco.id": goqu.I("co.user_id")})).
		InnerJoin(goqu.T("users").As("ugrp"),
			goqu.On(goqu.Ex{"ugrp.id": goqu.I("grp.created_by")})).
		Where(goqu.Ex{
			"grp.deleted_at":  nil,
			"grpl.deleted_at": nil,
			"c.deleted_at":    nil,
			"co.deleted_at":   nil,
			"uco.deleted_at":  nil,
			"ugrp.deleted_at": nil,
		})

	gradeRecap := goqu.Select(
		"grgl.grouping_id",
		"grgl.grade",
		goqu.COUNT("grgl.grade").As("grade_total"),
		goqu.L("SUM(grgl.grade_price * grgl.client_net_weight / 1000) grade_price_total"),
		goqu.SUM("grgl.client_net_weight").As("client_net_weight"),
	).From(goqu.T("goods_list_for_recap").As("grgl")).
		GroupBy("grgl.grouping_id", "grgl.grade")

	gradeRecapFinal := goqu.Select(
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'grade', gr.grade,"+
			"	'total', gr.grade_total"+
			") ORDER BY gr.grade ASC)").As("recap_list"),
		"gr.grouping_id",
	).From(goqu.T("grade_recap").As("gr")).
		GroupBy("gr.grouping_id")

	farmerRecap := goqu.Select(
		"frgl.grouping_id",
		"frgl.partner_id",
		"frgl.farmer_name",
		goqu.COUNT("frgl.farmer_name").As("farmer_total"),
		goqu.L("SUM(frgl.grade_price * frgl.client_net_weight / 1000) farmer_price_total"),
	).From(goqu.T("goods_list_for_recap").As("frgl")).
		GroupBy("frgl.grouping_id", "frgl.partner_id", "frgl.farmer_name")

	farmerRecapFinal := goqu.Select(
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'partner_id', fr.partner_id,"+
			"	'farmer', fr.farmer_name,"+
			"	'total', fr.farmer_total"+
			") ORDER BY fr.farmer_name ASC)").As("recap_list"),
		"fr.grouping_id",
	).From(goqu.T("farmer_recap").As("fr")).
		GroupBy("fr.grouping_id")

	sumRecap := goqu.Select(
		"srgr.grouping_id",
		goqu.SUM("srgr.grade_total").As("goods_total"),
		goqu.SUM("srgr.grade_price_total").As("client_price_total"),
		goqu.SUM("srgr.client_net_weight").As("client_net_weight_total"),
	).From(goqu.T("grade_recap").As("srgr")).
		GroupBy("srgr.grouping_id")

	queryBuilder := databaseImpl.QueryBuilder.
		Select(
			"glfr.grouping_id",
			"glfr.grouping_number",
			"glfr.client_number",
			"glfr.client_name",
			"glfr.client_code",
			"glfr.grade_initial",
			"glfr.ub",
			"glfr.grouping_created_at",
			"glfr.grouping_created_by",
			"grf.recap_list",
			"frf.recap_list",
			"sr.goods_total",
			"sr.client_price_total",
			"sr.client_net_weight_total",
			goqu.COUNT("*").Over(goqu.W()),
		).
		From(goqu.T("goods_list_for_recap").As("glfr")).
		LeftJoin(goqu.T("grade_recap_final").As("grf"),
			goqu.On(goqu.Ex{"grf.grouping_id": goqu.I("glfr.grouping_id")})).
		LeftJoin(goqu.T("farmer_recap_final").As("frf"),
			goqu.On(goqu.Ex{"frf.grouping_id": goqu.I("glfr.grouping_id")})).
		LeftJoin(goqu.T("sum_recap").As("sr"),
			goqu.On(goqu.Ex{"sr.grouping_id": goqu.I("glfr.grouping_id")})).
		LeftJoin(goqu.T("goods_list").As("gl"),
			goqu.On(goqu.Ex{"gl.grouping_id": goqu.I("glfr.grouping_id")})).
		GroupBy("glfr.grouping_id", "glfr.grouping_number", "glfr.client_number",
			"glfr.client_name", "glfr.client_code", "glfr.grade_initial", "glfr.ub",
			"glfr.grouping_created_at", "glfr.grouping_created_by", "grf.recap_list",
			"frf.recap_list", "sr.goods_total", "sr.client_price_total",
			"sr.client_net_weight_total").
		With("goods_list_for_recap", goodsListForRecap).
		With("grade_recap", gradeRecap).
		With("grade_recap_final", gradeRecapFinal).
		With("farmer_recap", farmerRecap).
		With("farmer_recap_final", farmerRecapFinal).
		With("sum_recap", sumRecap).
		With("goods_list", goodsList)

	filterQuery := goqu.Ex{}

	if len(dto.SortBy) > 0 {
		for _, sortVal := range dto.SortBy {
			sort := strings.Split(sortVal, ":")
			if len(sort[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if sort[0] == "client_name" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.I("glfr.client_name").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("glfr.client_name").Desc())
				}
			}
			if sort[0] == "grouping_date" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.I("glfr.grouping_created_at").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("glfr.grouping_created_at").Desc())
				}
			}
		}
	} else {
		queryBuilder = queryBuilder.Order(goqu.MAX(goqu.I("glfr.grouping_created_at")).Desc())
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"glfr.grouping_number": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"glfr.client_number":   goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"gl.coordinator_name":  goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"gl.coordinator_code":  goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"gl.farmer_name":       goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"gl.serial_number":     goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"gl.code":              goqu.Op{"ilike": "%" + dto.Keyword + "%"},
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

	rows, err := sar.Conn(ctx).Query(ctx, sql)
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
			&model.ClientName,
			&model.ClientCode,
			&model.GradeInitial,
			&model.UB,
			&model.GroupingCreatedAt,
			&model.GroupingCreatedBy,
			&model.GradeRecapList,
			&model.FarmerRecapList,
			&model.GoodsTotal,
			&model.ClientPriceTotal,
			&model.ClientNetWeightTotal,
			&model.Total,
		)

		if err != nil {
			logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
		}

		resModels = append(resModels, model)
	}

	return resModels, nil
}

func (sar salesRepository) CreateGrouping(ctx context.Context, params []GoodsDataForGroupingModel, userID int64) (*GroupingQueueData, error) {
	grade := ""
	if params[0].Grade != nil {
		grade = *params[0].Grade
	}

	createGrouping := goqu.Insert("grouping").
		Rows(goqu.Record{
			"grouping_number": goqu.Func("get_grouping_number", global.CreateGroupingNumber(*params[0].ClientCode)),
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

	row := sar.Conn(ctx).QueryRow(ctx, sql)

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

func (sar salesRepository) UpdateGroupingList(ctx context.Context, params UpdateGroupingParamsDto, userID int64) (bool, error) {
	queryBuilder := databaseImpl.QueryBuilder.Select(goqu.V("execute"))

	fmt.Println("UpdateGroupingList - params", params)

	// INSERT NEW DATA
	if len(params.NewData) > 0 {
		var goodsParams []goqu.Record
		for _, goods := range params.NewData {
			goodsParams = append(goodsParams, goqu.Record{
				"grouping_id":           params.GroupingID,
				"goods_id":              goods.GoodsID,
				"grade_information_id":  goods.GradeInfoID,
				"weight_information_id": goods.WeightInfoID,
				"created_by":            userID,
			})
		}

		newGroupingList := goqu.Insert("grouping_list").Rows(goodsParams)
		queryBuilder = queryBuilder.With("new_grouping_list", newGroupingList)
	}

	// GRADE CHANGE
	if len(params.ChangedGrade) > 0 {
		var gradeInfoIds []int64
		var groupingListIds []int64
		var groupingListArr []string

		for _, goods := range params.ChangedGrade {
			groupingListIds = append(groupingListIds, *goods.Item.GroupingListID)
			gradeInfoIds = append(gradeInfoIds, goods.Item.GradeInfoID)
			groupingListData := fmt.Sprintf(`(%d, %d, %d, %s, %d)`,
				goods.Item.GoodsID,
				goods.NewGrade.ID,
				goods.NewGrade.Price,
				"'VERIFICATION'",
				goods.Item.WeightInfoID)
			groupingListArr = append(groupingListArr, groupingListData)
		}

		newGradeInfoParams := goqu.L("(VALUES" + strings.Join(groupingListArr, ",") + ")")

		deleteUpdatedGradeInfo := goqu.Update("grade_information").
			Set(goqu.Record{
				"deleted_at":     time.Now(),
				"deleted_reason": "UPDATED BY GROUPING",
			}).Where(goqu.Ex{"id": goqu.Op{"in": gradeInfoIds}}).
			Returning("code_id", "goods_id")

		deleteUpdatedGroupingList := goqu.Update("grouping_list").
			Set(goqu.Record{
				"deleted_at":     time.Now(),
				"deleted_by":     userID,
				"deleted_reason": "UPDATED",
			}).
			Where(goqu.Ex{"id": goqu.Op{"in": groupingListIds}})

		insertNewGradeInfo := goqu.Insert("grade_information").
			Cols("goods_id", "grade_id", "grade_price", "grader",
				"unit_price", "created_by", "code_id").
			FromQuery(
				goqu.Select(
					"dugi.goods_id",
					"gla.grade_id",
					"gla.grade_price",
					"gla.grader",
					"gla.grade_price",
					goqu.V(userID),
					"dugi.code_id",
				).
					From(goqu.T("delete_updated_grade_info").As("dugi")).
					InnerJoin(goqu.T("grouping_list_arr").As("gla"),
						goqu.On(goqu.Ex{"gla.goods_id": goqu.I("dugi.goods_id")})),
			).Returning(goqu.I("id").As("grade_info_id"), "goods_id")

		insertNewGroupingList := goqu.Insert("grouping_list").
			Cols("grouping_id", "goods_id", "grade_information_id",
				"weight_information_id", "created_by").
			FromQuery(
				goqu.Select(
					goqu.V(params.GroupingID),
					"gla1.goods_id",
					"ingi.grade_info_id",
					"gla1.weight_information_id",
					goqu.V(userID),
				).
					From(goqu.T("insert_new_grade_info").As("ingi")).
					InnerJoin(goqu.T("grouping_list_arr").As("gla1"),
						goqu.On(goqu.Ex{"gla1.goods_id": goqu.I("ingi.goods_id")})),
			)

		queryBuilder = queryBuilder.
			With("grouping_list_arr(goods_id, grade_id, grade_price, grader, weight_information_id)",
				newGradeInfoParams).
			With("delete_updated_grade_info", deleteUpdatedGradeInfo).
			With("delete_updated_grouping_list", deleteUpdatedGroupingList).
			With("insert_new_grade_info", insertNewGradeInfo).
			With("insert_new_grouping_list", insertNewGroupingList)
	}

	// REJECT DATA
	if len(params.RejectData) > 0 {
		var rejectGroupingListIds []int64
		var gradeInfoIds []int64
		for _, goods := range params.RejectData {
			rejectGroupingListIds = append(rejectGroupingListIds, *goods.GroupingListID)
			gradeInfoIds = append(gradeInfoIds, goods.GradeInfoID)
		}

		rejectGradeInfo := goqu.Update("grade_information").
			Set(goqu.Record{
				"deleted_at":     time.Now(),
				"deleted_reason": "REJECTED_BY_GROUPING",
			}).Where(goqu.Ex{"id": goqu.Op{"in": gradeInfoIds}})

		rejectGroupingList := goqu.Update("grouping_list").
			Set(goqu.Record{
				"deleted_at":     time.Now(),
				"deleted_by":     userID,
				"deleted_reason": "REJECTED",
			}).
			Where(goqu.Ex{"id": goqu.Op{"in": rejectGroupingListIds}})

		queryBuilder = queryBuilder.
			With("delete_grade_info", rejectGradeInfo).
			With("reject_grouping_list", rejectGroupingList)
	}

	// REMOVE DATA & REJECT DATA 2/2
	if len(params.DataToRemove) > 0 {
		deleteGroupingList := goqu.Update("grouping_list").
			Set(goqu.Record{
				"deleted_at":     time.Now(),
				"deleted_by":     userID,
				"deleted_reason": "REMOVED",
			}).
			Where(goqu.Ex{"id": goqu.Op{"in": params.DataToRemove}})

		queryBuilder = queryBuilder.
			With("delete_grouping_list", deleteGroupingList)
	}

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("UpdateGroupingList - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Update Grouping List Query Error")
	}

	_, err = sar.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error Execute Query", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Error when try to update grouping list")
	}

	return true, nil
}

func (sar salesRepository) GetGroupingDetail(ctx context.Context, dto GroupingDetailDto, keyParam string) (*GroupingDetailModel, error) {
	groupingID, groupingNumber := global.GroupingKey(keyParam)

	selectedGrouping := goqu.Select(
		goqu.I("grp.id").As("grouping_id"),
		"grp.grouping_number",
		"grp.client_number",
		"grp.client_id",
		"grp.grade_initial",
		"grp.ub",
		"c.client_name",
		goqu.I("c.code").As("client_code"),
	).
		From(goqu.T("grouping").As("grp")).
		InnerJoin(goqu.T("clients").As("c"),
			goqu.On(goqu.Ex{"c.id": goqu.I("grp.client_id")})).
		Where(goqu.Ex{
			"grp.deleted_at": nil,
			"c.deleted_at":   nil,
		}, goqu.ExOr{
			"grp.id":              groupingID,
			"grp.grouping_number": groupingNumber,
		})

	groupingDataList := goqu.Select(
		"sgrp.grouping_id",
		"sgrp.grouping_number",
		"sgrp.client_number",
		"sgrp.client_id",
		"sgrp.grade_initial",
		"sgrp.ub",
		"sgrp.client_name",
		"sgrp.client_code",
		goqu.I("grpl.id").As("grouping_list_id"),
		goqu.I("grpl.goods_id").As("goods_id"),
		goqu.I("grpl.grade_information_id").As("grade_information_id"),
		goqu.I("grpl.weight_information_id").As("weight_information_id"),
		"bi.serial_number",
		goqu.I("cl.code").As("sales_code"),
		"gd.grade",
		"gi.grade_price",
		"gi.unit_price",
		"gi.grader",
		"qs.partner_id",
		"qs.farmer_name",
		"qs.product_type",
		goqu.I("uco.name").As("coordinator_name"),
		goqu.I("co.code").As("coordinator_code"),
		"wi.gross_weight",
		goqu.Func("create_client_weight",
			goqu.I("wi.gross_weight"), goqu.I("sgrp.client_code")).As("client_weight"),
	).From(goqu.T("grouping_list").As("grpl")).
		InnerJoin(goqu.T("selected_grouping").As("sgrp"),
			goqu.On(goqu.Ex{"sgrp.grouping_id": goqu.I("grpl.grouping_id")})).
		InnerJoin(goqu.T("goods").As("g"),
			goqu.On(goqu.Ex{"g.id": goqu.I("grpl.goods_id")})).
		InnerJoin(goqu.T("grade_information").As("gi"),
			goqu.On(goqu.Ex{"gi.id": goqu.I("grpl.grade_information_id")})).
		InnerJoin(goqu.T("weight_information").As("wi"),
			goqu.On(goqu.Ex{"wi.id": goqu.I("grpl.weight_information_id")})).
		InnerJoin(goqu.T("grades").As("gd"),
			goqu.On(goqu.Ex{"gd.id": goqu.I("gi.grade_id")})).
		InnerJoin(goqu.T("bucket_information").As("bi"),
			goqu.On(goqu.Ex{"bi.id": goqu.I("g.bucket_id")})).
		InnerJoin(goqu.T("code_list").As("cl"),
			goqu.On(goqu.Ex{"cl.id": goqu.I("gi.code_id")})).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.Ex{"qs.id": goqu.I("bi.queue_supplies_id")})).
		InnerJoin(goqu.T("coordinators").As("co"),
			goqu.On(goqu.Ex{"co.id": goqu.I("qs.coordinator_id")})).
		InnerJoin(goqu.T("users").As("uco"),
			goqu.On(goqu.Ex{"uco.id": goqu.I("co.user_id")})).
		Where(goqu.Ex{
			"grpl.deleted_at": nil,
			"bi.deleted_at":   nil,
			"co.deleted_at":   nil,
			"uco.deleted_at":  nil,
		})

	groupingDataJson := goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT(" +
		"	'type', 'GROUP'," +
		"	'grouping_list_id', gdl.grouping_list_id," +
		"	'goods_id', gdl.goods_id," +
		"	'grade_information_id', gdl.grade_information_id," +
		"	'weight_information_id', gdl.weight_information_id," +
		"	'serial_number', gdl.serial_number," +
		"	'sales_code', gdl.sales_code," +
		"	'grade', gdl.grade," +
		"	'grade_price', gdl.grade_price," +
		"	'unit_price', gdl.unit_price," +
		"	'grader', gdl.grader," +
		"	'farmer_name', gdl.farmer_name," +
		"	'product_type', gdl.product_type," +
		"	'coordinator_name', gdl.coordinator_name," +
		"	'coordinator_code', gdl.coordinator_code," +
		"	'gross_weight', gdl.gross_weight," +
		"	'client_weight', gdl.client_weight" +
		") ORDER BY gdl.serial_number ASC)").As("grouping_data_json")

	queryBuilder := databaseImpl.QueryBuilder.
		Select(
			"gdl.grouping_id",
			"gdl.grouping_number",
			"gdl.client_number",
			"gdl.client_id",
			"gdl.client_name",
			"gdl.client_code",
			"gdl.grade_initial",
			"gdl.ub",
			groupingDataJson,
			goqu.L("'[]'::JSONB").As("goods_data_json"),
		).
		From(goqu.T("grouping_data_list").As("gdl")).
		GroupBy("gdl.grouping_id", "gdl.grouping_number", "gdl.client_number",
			"gdl.client_id", "gdl.client_name", "gdl.client_code",
			"gdl.grade_initial", "gdl.ub", "goods_data_json").
		With("selected_grouping", selectedGrouping).
		With("grouping_data_list", groupingDataList)

	if dto.IsEdit {
		goodsData := goqu.Select(
			goqu.I("g1.id").As("goods_id"),
			goqu.I("gi1.id").As("grade_information_id"),
			goqu.I("wi1.id").As("weight_information_id"),
			"bi1.serial_number",
			goqu.I("cl1.code").As("sales_code"),
			"gd1.grade",
			"gi1.grade_price",
			"gi1.unit_price",
			"gi1.grader",
			goqu.I("c1.code").As("client_code"),
			"c1.client_name",
			"qs1.farmer_name",
			"qs1.product_type",
			goqu.I("uco1.name").As("coordinator_name"),
			goqu.I("co1.code").As("coordinator_code"),
			"wi1.gross_weight",
			goqu.Func("create_client_weight",
				goqu.I("wi1.gross_weight"), goqu.I("c1.code")).As("client_weight"),
			goqu.COUNT("*").Over(goqu.W()).As("total"),
		).From(goqu.T("goods").As("g1")).
			InnerJoin(goqu.T("grade_information").As("gi1"),
				goqu.On(goqu.Ex{"gi1.goods_id": goqu.I("g1.id")})).
			InnerJoin(goqu.T("weight_information").As("wi1"),
				goqu.On(goqu.Ex{"wi1.goods_id": goqu.I("g1.id")})).
			InnerJoin(goqu.T("grades").As("gd1"),
				goqu.On(goqu.Ex{"gd1.id": goqu.I("gi1.grade_id")})).
			InnerJoin(goqu.T("clients").As("c1"),
				goqu.On(goqu.Ex{"c1.id": goqu.I("gd1.client_id")})).
			InnerJoin(goqu.T("bucket_information").As("bi1"),
				goqu.On(goqu.Ex{"bi1.id": goqu.I("g1.bucket_id")})).
			InnerJoin(goqu.T("code_list").As("cl1"),
				goqu.On(goqu.Ex{"cl1.id": goqu.I("gi1.code_id")})).
			InnerJoin(goqu.T("queue_supplies").As("qs1"),
				goqu.On(goqu.Ex{"qs1.id": goqu.I("bi1.queue_supplies_id")})).
			InnerJoin(goqu.T("coordinators").As("co1"),
				goqu.On(goqu.Ex{"co1.id": goqu.I("qs1.coordinator_id")})).
			InnerJoin(goqu.T("users").As("uco1"),
				goqu.On(goqu.Ex{"uco1.id": goqu.I("co1.user_id")})).
			LeftJoin(goqu.T("grouping_list").As("gl1"),
				goqu.On(goqu.Ex{
					"gl1.goods_id":   goqu.I("g1.id"),
					"gl1.deleted_at": nil,
				})).
			InnerJoin(goqu.T("selected_grouping").As("sgrp"),
				goqu.On(goqu.Ex{
					"sgrp.client_id":     goqu.I("c1.id"),
					"sgrp.grade_initial": goqu.L("SUBSTRING(gd1.grade, 1, 1)"),
					"sgrp.ub":            goqu.I("gd1.ub"),
				})).
			Where(goqu.Ex{
				"gi1.deleted_at":  nil,
				"wi1.deleted_at":  nil,
				"bi1.deleted_at":  nil,
				"co1.deleted_at":  nil,
				"uco1.deleted_at": nil,
				"gl1.id":          nil,
			})

		goodsDataFinal := goqu.Select(
			goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT(" +
				"	'type', 'GOODS'," +
				"	'goods_id', godt.goods_id," +
				"	'grade_information_id', godt.grade_information_id," +
				"	'weight_information_id', godt.weight_information_id," +
				"	'serial_number', godt.serial_number," +
				"	'sales_code', godt.sales_code," +
				"	'grade', godt.grade," +
				"	'grade_price', godt.grade_price," +
				"	'unit_price', godt.unit_price," +
				"	'grader', godt.grader," +
				"	'farmer_name', godt.farmer_name," +
				"	'product_type', godt.product_type," +
				"	'coordinator_name', godt.coordinator_name," +
				"	'coordinator_code', godt.coordinator_code," +
				"	'gross_weight', godt.gross_weight," +
				"	'client_weight', godt.client_weight," +
				"	'total', godt.total" +
				") ORDER BY godt.serial_number ASC)").As("data_list"),
		).From(goqu.T("goods_data").As("godt"))

		filterQuery := goqu.Ex{}

		if len(dto.SortBy) > 0 {
			for _, sortVal := range dto.SortBy {
				sort := strings.Split(sortVal, ":")
				if len(sort[0]) < 2 {
					return nil, errors.New(errors.BadRequestError)
				}
				if sort[0] == "serial_number" {
					sortType := strings.ToLower(sort[1])
					if sortType == "asc" {
						goodsData = goodsData.Order(goqu.I("bi1.serial_number").Asc())
					} else {
						goodsData = goodsData.Order(goqu.I("bi1.serial_number").Desc())
					}
				}
				if sort[0] == "sales_code" {
					sortType := strings.ToLower(sort[1])
					if sortType == "asc" {
						goodsData = goodsData.Order(goqu.I("cl1.code").Asc())
					} else {
						goodsData = goodsData.Order(goqu.I("cl1.code").Desc())
					}
				}
				if sort[0] == "farmer_name" {
					sortType := strings.ToLower(sort[1])
					if sortType == "asc" {
						goodsData = goodsData.Order(goqu.I("qs1.farmer_name").Asc())
					} else {
						goodsData = goodsData.Order(goqu.I("qs1.farmer_name").Desc())
					}
				}
			}
		} else {
			goodsData = goodsData.Order(goqu.I("bi1.serial_number").Asc())
		}

		if dto.Keyword != "" {
			goodsData = goodsData.Where(goqu.ExOr{
				"uco1.name":         goqu.Op{"ilike": "%" + dto.Keyword + "%"},
				"qs1.farmer_name":   goqu.Op{"ilike": "%" + dto.Keyword + "%"},
				"bi1.serial_number": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
				"cl1.code":          goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			})
		}

		if dto.Limit > 0 {
			goodsData = goodsData.Limit(dto.Limit)
		}

		if dto.Page > 0 {
			goodsData = goodsData.Offset((dto.Page - 1) * (dto.Limit))
		}

		goodsData = goodsData.Where(filterQuery)

		queryBuilder = databaseImpl.QueryBuilder.
			Select(
				"gdl.grouping_id",
				"gdl.grouping_number",
				"gdl.client_number",
				"gdl.client_id",
				"gdl.client_name",
				"gdl.client_code",
				"gdl.grade_initial",
				"gdl.ub",
				groupingDataJson,
				goqu.I("gdf.data_list").As("goods_data_json"),
			).
			From(goqu.T("grouping_data_list").As("gdl")).
			CrossJoin(goqu.T("goods_data_final").As("gdf")).
			GroupBy("gdl.grouping_id", "gdl.grouping_number", "gdl.client_number",
				"gdl.client_id", "gdl.client_name", "gdl.client_code",
				"gdl.grade_initial", "gdl.ub", "gdf.data_list").
			With("selected_grouping", selectedGrouping).
			With("grouping_data_list", groupingDataList).
			With("goods_data", goodsData).
			With("goods_data_final", goodsDataFinal)
	}

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetGroupingDetail - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Grouping Detail Query Error")
	}

	row := sar.Conn(ctx).QueryRow(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to get grouping detail")
	}

	var model GroupingDetailModel
	err = row.Scan(
		&model.GroupingID,
		&model.GroupingNumber,
		&model.GroupingClientNumber,
		&model.ClientID,
		&model.ClientName,
		&model.ClientCode,
		&model.GradeInitial,
		&model.UB,
		&model.GroupingDataJson,
		&model.GoodsDataJson,
	)

	if err != nil {
		logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
	}

	return &model, nil
}

func (sar salesRepository) CreateShipment(ctx context.Context, params CreateShipmentDto, userID int64) (*ShipmentQueueData, error) {
	createShipment := goqu.Insert("shipment").
		Rows(goqu.Record{
			"shipment_number": goqu.Func("get_shipment_number", global.CreateShipmentNumber(params.ClientCode)),
			"shipment_type":   "GROUPING",
			"client_id":       params.ClientID,
			"created_by":      userID,
		}).Returning("id", "shipment_number", "shipment_type")

	queryBuilder := databaseImpl.QueryBuilder.
		Select("id", "shipment_number", "shipment_type").
		From("create_shipment").
		With("create_shipment", createShipment)

	if params.Type == "GROUPING" && len(params.GroupingDataArr) > 0 {
		var groupingParams []goqu.Record
		for _, goods := range params.GroupingDataArr {
			groupingParams = append(groupingParams, goqu.Record{
				"shipment_id": goqu.Select("id").From("create_grouping"),
				"grouping_id": goods.GroupingID,
				"created_by":  userID,
			})
		}

		createShipmentGrouping := goqu.
			Insert("shipment_grouping").
			Rows(groupingParams)

		queryBuilder = queryBuilder.
			With("create_shipment_grouping", createShipmentGrouping)
	}

	if params.Type == "GOODS" && len(params.GroupingListDataArr) > 0 {
		var groupingListParams []goqu.Record
		for _, goods := range params.GroupingListDataArr {
			groupingListParams = append(groupingListParams, goqu.Record{
				"shipment_id":      goqu.Select("id").From("create_grouping"),
				"grouping_list_id": goods.GroupingListID,
				"created_by":       userID,
			})
		}

		createShipmentGoods := goqu.
			Insert("shipment_goods").
			Rows(groupingListParams)

		queryBuilder = queryBuilder.
			With("create_shipment_goods", createShipmentGoods)
	}

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("CreateShipment - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Create Shipment Query Error")
	}

	row := sar.Conn(ctx).QueryRow(ctx, sql)

	var model ShipmentQueueData
	err = row.Scan(
		&model.ShipmentID,
		&model.ShipmentNumber,
		&model.ShipmentType,
	)

	if err != nil {
		logger.ContextLogger(ctx).Error("Parsing Error", zap.Error(err))
		log.Println(err)
	}

	return &model, nil
}
