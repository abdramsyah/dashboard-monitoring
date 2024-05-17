package queuerequest

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/utils"
	"strconv"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
)

type QueueRequestRepository interface {
	GetCoordinatorId(ctx context.Context, userId int64) (*int64, error)

	GetCoordinatorDropdownList(ctx context.Context) ([]CoordinatorDropdownResponse, error)

	GetByID(ctx context.Context, qsID int64) (*QueueRequestBarcodeResponse, error)
	CheckStatusByIDs(ctx context.Context, qsIDs []int64) ([]QueueRequestBarcodeResponse, error)
	CreateBarcode(ctx context.Context, queueId int64, request QueueRequestStatus) (bool, error)

	CreateQueue(ctx context.Context, model []QueueRequestModel, coordinatorID int64) (response []QueueRequestModel, err error)
	UpdateStatusQueue(ctx context.Context, queueIds []int64, status constants.SupplyStatus, userID int64) (bool, error)
	CreateQueueDelivery(ctx context.Context, model UpdateStatusQueueModel, userID int64) (response bool, err error)
	UpdateQueueDeliveryList(ctx context.Context, model UpdateStatusQueueModel, userID int64) (response bool, err error)
	GetQueueDelivery(ctx context.Context, deliveryNumber int64) (*QueueDeliveryModel, error)
	GetBucketInformationListByQueueIds(ctx context.Context, queueIds []int64) ([]BucketInformationModel, error)
	GetQueueList(ctx context.Context, dto QueueRequestListDto) ([]QueueResponse, error)
	GetQueueGroup(ctx context.Context, dto QueueRequestListDto, userID *int64) ([]QueueGroupModel, error)
	GetBucketListByQueueIds(ctx context.Context, queueIds []int64) ([]BucketInformationModel, error)
	CreateGoods(ctx context.Context, bucketIds []int64, userID int64) ([]CreateGoodsResModel, error)
	RejectBucket(ctx context.Context, bucketIds []int64, userID int64) ([]CreateGoodsResModel, error)
	GetBucketAndGoodsInformationBySerialNumber(ctx context.Context, models []CreateGoodsResModel) ([]CreateGoodsResModel, error)

	GetQueueGroupDetail(ctx context.Context, dto QueueGroupDetailDto) ([]QueueGroupDetailModel, error)
	GetBarcodeDetail(ctx context.Context, barcode string) (*BucketScanModel, error)
}

type queueRequestRepository struct {
	databaseImpl.ConnManager
}

func NewRepository(manager databaseImpl.ConnManager) *queueRequestRepository {
	return &queueRequestRepository{
		manager,
	}
}

func (g queueRequestRepository) GetCoordinatorId(ctx context.Context, userId int64) (*int64, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		From("coordinators").
		Select("id").
		Where(goqu.Ex{"user_id": userId}).
		ToSQL()

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := g.Conn(ctx).QueryRow(ctx, sql)

	var result int64
	if err := row.Scan(&result); err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Coordinator Not Found")
	}

	logger.ContextLogger(ctx).Check(zap.DebugLevel, string(rune(result)))

	return &result, nil
}

func (g queueRequestRepository) GetByID(ctx context.Context, qsID int64) (*QueueRequestBarcodeResponse, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select("queue_supplies.id",
			goqu.I("users.name").As("coordinator_name"),
			goqu.I("users.number_id").As("number_id"),
			"queue_supplies.farmer_name",
			"queue_supplies.product_type",
			"queue_supplies.quantity_bucket",
			"queue_supplies.status",
			goqu.COALESCE(goqu.I("queue_supplies.barcode_id"), 0).As("barcode_id"),
			"queue_supplies.date_in",
			"queue_supplies.created_at",
			"queue_supplies.updated_at",
		).
		From("queue_supplies").
		InnerJoin(goqu.I("coordinators"), goqu.On(goqu.Ex{"coordinators.id": goqu.I("queue_supplies.coordinator_id")})).
		InnerJoin(goqu.I("users"), goqu.On(goqu.Ex{"coordinators.user_id": goqu.I("users.id")})).
		Where(goqu.And(
			goqu.I("queue_supplies.id").Eq(qsID),
		)).ToSQL()

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := g.Conn(ctx).QueryRow(ctx, sql)

	model := QueueRequestBarcodeResponse{}

	err = row.Scan(
		&model.Id,
		&model.CoordinatorName,
		&model.CoordinatorID,
		&model.FarmerName,
		&model.ProductType,
		&model.RequestQuantity,
		&model.Status,
		&model.BarcodeID,
		&model.DateIn,
		&model.CreatedAt,
		&model.UpdatedAt,
	)

	if err != nil {
		return nil, errors.ParseError(ctx, err)
	}

	return &model, nil
}

func (g queueRequestRepository) CheckStatusByIDs(ctx context.Context, qsIDs []int64) ([]QueueRequestBarcodeResponse, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select("queue_supplies.id",
			"queue_supplies.status",
			"queue_supplies.created_at",
			"queue_supplies.updated_at",
			goqu.L("jsonb_agg("+
				"jsonb_build_object("+
				"'company_barcode', barcode_product.company_barcode,"+
				"'scanned', case "+
				"when barcode_product.date_in is null then false::text "+
				"else true::text end))").As("barcode_data"),
		).
		From("queue_supplies").
		LeftJoin(goqu.I("barcode_product"),
			goqu.On(goqu.Ex{"barcode_product.queue_supplies_id": goqu.I("queue_supplies.id")})).
		Where(goqu.And(
			goqu.I("queue_supplies.id").In(qsIDs),
		)).ToSQL()

	fmt.Println("CheckStatusByIDs - sql", sql)

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	rows, err := g.Conn(ctx).Query(ctx, sql)

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	models := []QueueRequestBarcodeResponse{}
	for rows.Next() {
		model := QueueRequestBarcodeResponse{}
		err = rows.Scan(
			&model.Id,
			&model.Status,
			&model.CreatedAt,
			&model.UpdatedAt,
			&model.BarcodeData,
		)

		if err != nil {
			log.Println(err)
		}

		models = append(models, model) // add new row information
	}

	if err != nil {
		return nil, errors.ParseError(ctx, err)
	}

	return models, nil
}

func (g queueRequestRepository) GetCoordinatorDropdownList(ctx context.Context) ([]CoordinatorDropdownResponse, error) {
	sql := "WITH goods(b_id, id) AS ( "
	sql += "	SELECT gi2.barcode_id, gi2.id "
	sql += "	FROM goods_information gi2 "
	sql += "	WHERE gi2.deleted_at IS NULL "
	sql += "), waiting_bucket(b_id, qs_id, date_in) AS ( "
	sql += "	SELECT bp2.id, bp2.queue_supplies_id, bp2.date_in "
	sql += "	FROM barcode_product bp2 "
	sql += "	LEFT JOIN goods gs ON bp2.id = gs.b_id "
	sql += "	LEFT JOIN approval_statuses as2 ON gs.id = as2.goods_information_id "
	sql += "	WHERE (gs.b_id IS NULL or as2.status IN ('RejectedSample', 'RejectedInspection')) "
	sql += "	AND bp2.deleted_at IS NULL "
	sql += ") SELECT c.id, u.name FROM coordinators c "
	sql += "INNER JOIN users u ON c.user_id = u.id "
	sql += "INNER JOIN queue_supplies qs ON c.id = qs.coordinator_id "
	sql += "INNER JOIN waiting_bucket wwb ON qs.id = wwb.qs_id "
	sql += "WHERE c.deleted_at IS NULL "
	sql += "AND u.deleted_at IS NULL "
	sql += "AND qs.deleted_at IS NULL "
	sql += "AND qs.status = 'APPROVED' "
	sql += "AND wwb.date_in IS NOT NULL "
	sql += "GROUP BY c.id, u.id "

	fmt.Println("GetCoordinatorDropdownList - sql", sql)

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Coordinator Repistory Get List", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Coordinators")
	}

	var coordinatorList []CoordinatorDropdownResponse
	for rows.Next() {
		model := CoordinatorDropdownResponse{}
		err = rows.Scan(
			&model.CoordinatorID,
			&model.CoordinatorName,
		)

		if err != nil {
			log.Println(err)
		}

		coordinatorList = append(coordinatorList, model) // add new row information
	}

	return coordinatorList, nil
}

func (g queueRequestRepository) CreateBarcode(ctx context.Context, queueId int64, request QueueRequestStatus) (bool, error) {
	reqQuantity := strconv.FormatInt(request.RequestQuantity, 10)

	sql := "WITH queue(accum_bucket) AS ( "
	sql += "	SELECT COALESCE(SUM(qs.quantity_bucket::INTEGER), 0) "
	sql += "	FROM queue_supplies qs "
	sql += "	WHERE (qs.coordinator_id = $1 "
	sql += "	AND qs.status = 'APPROVED' "
	sql += "	AND qs.deleted_at IS NULL) "
	sql += ") INSERT INTO barcode_product(company_code, queue_supplies_id, company_barcode) "
	sql += "SELECT t.* "
	sql += "FROM GENERATE_SERIES((SELECT accum_bucket FROM queue) + 1, "
	sql += "(SELECT accum_bucket FROM queue) + $2) i "
	sql += "CROSS JOIN LATERAL ( "
	sql += "	SELECT '', $3::BIGINT, "
	sql += "	($4 || right((100000 + + i)::TEXT, -1) || "
	sql += "	'-' || right((1000 + $2)::TEXT, -1) || right((100000 + $3)::TEXT, -1)) "
	sql += ") t "

	fmt.Println("CreateBarcode - sql", sql)

	_, err := g.Conn(ctx).Exec(ctx, sql, request.CoordinatorID, reqQuantity, queueId, request.Code)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	return true, nil
}

func (g queueRequestRepository) CreateQueue(ctx context.Context, model []QueueRequestModel, coordinatorID int64) (response []QueueRequestModel, err error) {
	var params []goqu.Record
	for _, queue := range model {
		params = append(params, goqu.Record{
			"farmer_name":     queue.FarmerName,
			"partner_id":      queue.PartnerID,
			"product_type":    queue.ProductType,
			"quantity_bucket": queue.RequestQuantity,
			"status":          constants.OnProgress,
			"coordinator_id":  coordinatorID,
		})
	}

	sql, _, err := databaseImpl.QueryBuilder.
		Insert("queue_supplies").
		Rows(params).
		Returning("id").
		ToSQL()

	fmt.Println("CreateQueue - sql", sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	queueGroup := []QueueRequestModel{}
	for rows.Next() {
		queue := QueueRequestModel{}

		if err = rows.Scan(&queue.ID); err != nil {
			log.Println(err)
		}

		queueGroup = append(queueGroup, queue) // add new row information
	}

	return queueGroup, nil
}

func (g queueRequestRepository) UpdateStatusQueue(ctx context.Context, queueIds []int64, status constants.SupplyStatus, userID int64) (response bool, err error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("queue_supplies").
		Set(databaseImpl.Ex{
			"status":            status,
			"status_date":       time.Now(),
			"status_changed_by": userID,
		}).
		Where(goqu.I("id").In(queueIds)).
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

func (g queueRequestRepository) CreateQueueDelivery(ctx context.Context, model UpdateStatusQueueModel, userID int64) (response bool, err error) {
	var qdlParams []goqu.Record
	var params []goqu.Record
	var queueIds []int64
	sum := int(model.AccumBucket)

	for _, queue := range model.QueueData {
		queueIds = append(queueIds, queue.ID)
		qdlParams = append(qdlParams, goqu.Record{
			"queue_delivery_id": goqu.Select("id").From("created_qd"),
			"queue_supplies_id": queue.ID,
			"created_by":        userID,
		})
		for i := 1; i <= int(queue.RequestQuantity); i++ {
			sum++
			serial := utils.NumToSerial(sum)
			params = append(params, goqu.Record{
				"queue_supplies_id": queue.ID,
				"serial_number":     model.CoordinatorCode + "-" + serial,
				"created_by":        userID,
			})
		}
	}

	queryBuilder := databaseImpl.QueryBuilder.
		Insert("queue_delivery_list").
		Rows(qdlParams).
		With("created_qs",
			goqu.Update("queue_supplies").
				Set(databaseImpl.Ex{
					"status":            constants.Approved,
					"status_date":       time.Now(),
					"status_changed_by": userID,
				}).
				Where(goqu.I("id").In(queueIds))).
		With("create_bucket",
			goqu.Insert("bucket_information").
				Rows(params)).
		With("created_qd(id)",
			goqu.Insert("queue_delivery").
				Rows(goqu.Record{
					"delivery_number":        createDeliveryNumber(model.CoordinatorCode, model.ScheduledArrivalDate),
					"scheduled_arrival_date": model.ScheduledArrivalDate,
					"created_by":             userID,
				}).
				Returning("id"))

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("CreateQueueDelivery - sql", sql)

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

func (g queueRequestRepository) UpdateQueueDeliveryList(ctx context.Context, model UpdateStatusQueueModel, userID int64) (response bool, err error) {
	var qdlParams []goqu.Record
	var params []goqu.Record
	var queueIds []int64
	sum := int(model.AccumBucket)

	for _, queue := range model.QueueData {
		queueIds = append(queueIds, queue.ID)
		qdlParams = append(qdlParams, goqu.Record{
			"queue_delivery_id": model.QueueDeliveryID,
			"queue_supplies_id": queue.ID,
			"created_by":        userID,
		})
		for i := 1; i <= int(queue.RequestQuantity); i++ {
			sum++
			serial := utils.NumToSerial(sum)
			params = append(params, goqu.Record{
				"queue_supplies_id": queue.ID,
				"serial_number":     model.CoordinatorCode + "-" + serial,
				"created_by":        userID,
			})
		}
	}

	sql, _, err := databaseImpl.QueryBuilder.
		Insert("queue_delivery_list").
		Rows(qdlParams).
		With("created_qs",
			goqu.Update("queue_supplies").
				Set(databaseImpl.Ex{
					"status":            constants.Approved,
					"status_date":       time.Now(),
					"status_changed_by": userID,
				}).
				Where(goqu.I("id").In(queueIds))).
		With("create_bucket",
			goqu.Insert("bucket_information").
				Rows(params)).
		ToSQL()

	fmt.Println("UpdateQueueDeliveryList - sql", sql)

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

func (g queueRequestRepository) GetQueueDelivery(ctx context.Context, deliveryNumber int64) (*QueueDeliveryModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select(
			"qd.id",
			"qd.delivery_number",
			"uc.name",
			goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
				"'queue_id', qs.id,"+
				"'farmer_name', qs.farmer_name,"+
				"'product_type', qs.product_type,"+
				"'quantity_bucket', qs.quantity_bucket,"+
				"'quantity_bucket', qs.quantity_bucket,"+
				"'quantity_bucket', qs.quantity_bucket,"+
				"'created_at', qs.created_at"+
				"))"),
			goqu.SUM("qs.quantity_bucket"),
			"qd.scheduled_arrival_date",
			"qd.created_at",
		).Distinct().
		From(goqu.T("queue_supplies").As("qs")).
		InnerJoin(goqu.T("coordinators").As("c"),
			goqu.On(goqu.I("qs.coordinator_id").Eq(goqu.I("c.id")))).
		InnerJoin(goqu.T("users").As("uc"),
			goqu.On(goqu.I("c.user_id").Eq(goqu.I("uc.id")))).
		InnerJoin(goqu.T("queue_delivery_list").As("qdl"),
			goqu.On(goqu.I("qs.id").Eq(goqu.I("qdl.queue_supplies_id")))).
		InnerJoin(goqu.T("queue_delivery").As("qd"),
			goqu.On(goqu.I("qdl.queue_delivery_id").Eq(goqu.I("qd.id")))).
		Where(goqu.Ex{"qd.delivery_number": deliveryNumber}).
		GroupBy("qd.id").ToSQL()

	fmt.Println("GetBucketListByQueueDelivery - sql", sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := g.Conn(ctx).QueryRow(ctx, sql)

	model := QueueDeliveryModel{}
	if err := row.Scan(
		&model.DeliveryID,
		&model.DeliveryNumber,
		&model.CoordinatorName,
		&model.QueueIds,
		&model.QuantityBucket,
		&model.ScheduledArrivalDate,
		&model.CreatedAt,
	); err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	return &model, nil
}

func (g queueRequestRepository) GetBucketInformationListByQueueIds(ctx context.Context, queueIds []int64) ([]BucketInformationModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select(
			"bi.id",
			"bi.serial_number",
			"qs.farmer_name",
			"qs.product_type",
			goqu.COALESCE("g1.id", 0),
			goqu.COALESCE("cl.code", ""),
			goqu.COALESCE("gd.grade", ""),
			goqu.COALESCE("gd.price", 0),
			goqu.COALESCE("gi.grade_price", 0),
			goqu.COALESCE("gi.grader", ""),
			goqu.COALESCE("gi.unit_price", 0),
			goqu.COALESCE("ugi.name", ""),
			goqu.COALESCE("wi.gross_weight", 0),
			goqu.COALESCE("uwi.name", ""),
		).
		From(goqu.T("bucket_information").As("bi")).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.I("bi.queue_supplies_id").Eq(goqu.I("qs.id")))).
		LeftJoin(goqu.T("goods").As("g1"),
			goqu.On(goqu.I("bi.id").Eq(goqu.I("g1.bucket_id")))).
		LeftJoin(goqu.T("code_list").As("cl"),
			goqu.On(goqu.I("g1.code_id").Eq(goqu.I("cl.id")))).
		LeftJoin(goqu.T("grade_information").As("gi"),
			goqu.On(goqu.I("g1.id").Eq(goqu.I("gi.goods_id")))).
		LeftJoin(goqu.T("users").As("ugi"),
			goqu.On(goqu.I("gi.created_by").Eq(goqu.I("ugi.id")))).
		LeftJoin(goqu.T("grades").As("gd"),
			goqu.On(goqu.I("gi.grade_id").Eq(goqu.I("gd.id")))).
		LeftJoin(goqu.T("weight_information").As("wi"),
			goqu.On(goqu.I("g1.id").Eq(goqu.I("wi.goods_id")))).
		LeftJoin(goqu.T("users").As("uwi"),
			goqu.On(goqu.I("wi.created_by").Eq(goqu.I("uwi.id")))).
		Where(goqu.Ex{"qs.id": goqu.Op{"in": queueIds}}).ToSQL()

	fmt.Println("GetBucketInformationListByQueueIds - sql", sql)

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Queue Request - Get Bucket List By Queue Delivery", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Coordinators")
	}

	var bucketList []BucketInformationModel
	for rows.Next() {
		model := BucketInformationModel{}
		err = rows.Scan(
			&model.BucketID,
			&model.SerialNumber,
			&model.FarmerName,
			&model.ProductType,
			&model.GoodsID,
			&model.GoodsCode,
			&model.Grade,
			&model.GradePrice,
			&model.PreserveGradePrice,
			&model.Grader,
			&model.UnitPrice,
			&model.AdminGrade,
			&model.GrossWeight,
			&model.AdminWeight,
		)

		if err != nil {
			log.Println(err)
		}

		bucketList = append(bucketList, model) // add new row information
	}

	return bucketList, nil
}

func (g queueRequestRepository) GetQueueList(ctx context.Context, dto QueueRequestListDto) ([]QueueResponse, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select("qs.id",
			"u.name",
			"u.number_id",
			"c.id",
			"c.code",
			"qs.farmer_name",
			"qs.product_type",
			"qs.quantity_bucket",
			"qs.created_at",
			"qs.status",
			"qs.status_date",
			goqu.COUNT("*").Over(goqu.W()),
		).
		From(goqu.T("queue_supplies").As("qs")).
		InnerJoin(goqu.T("coordinators").As("c"),
			goqu.On(goqu.Ex{"c.id": goqu.I("qs.coordinator_id")})).
		InnerJoin(goqu.T("users").As("u"),
			goqu.On(goqu.Ex{"c.user_id": goqu.I("u.id")}))

	filterQuery := goqu.Ex{
		"c.deleted_at": nil,
		"u.deleted_at": nil,
	}

	if dto.UserID != -99 {
		queryBuilder = queryBuilder.Where(
			goqu.I("u.id").Eq(dto.UserID))
	}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "status" {
				filterQuery["qs.status"] = strings.ToUpper(filter[1])
			}
			if filter[0] == "coordinator_id" {
				filterQuery["c.id"] = filter[1]
			}
			if filter[0] == "date" {
				dateBetween := strings.Split(filter[1], "/")
				startDate, err := time.Parse("2006-01-02 15:04:05", dateBetween[0]+" 00:00:00")
				if err != nil {
					logger.ContextLogger(ctx).Error("Error parsing date", zap.Error(err))
					return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Data Table")
				}

				endDate, err := time.Parse("2006-01-02 15:04:05", dateBetween[1]+" 23:59:59")
				if err != nil {
					logger.ContextLogger(ctx).Error("Eroor parsing date", zap.Error(err))
					return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Data Table")
				}
				filterQuery["qs.created_at"] = goqu.Op{
					"between": goqu.Range(startDate, endDate),
				}
			}
		}
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"u.number_id":     goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"u.name":          goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"qs.farmer_name":  goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"qs.product_type": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"qs.status":       goqu.Op{"ilike": "%" + dto.Keyword + "%"},
		})
	}

	if dto.CurrentDate != "" {
		var startDate, _ = time.Parse("2006-01-02 15:04:05", dto.CurrentDate+" 00:00:00")
		var endDate, _ = time.Parse("2006-01-02 15:04:05", dto.CurrentDate+" 23:59:59")

		queryBuilder = queryBuilder.Where(goqu.And(
			goqu.I("qs.created_at").Between(goqu.Range(startDate, endDate)),
		))
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
	} else {
		queryBuilder = queryBuilder.Order(goqu.I("qs.created_at").Asc().NullsLast())
	}

	if dto.Limit > 0 {
		queryBuilder = queryBuilder.Limit(dto.Limit)
	}

	if dto.Page > 0 {
		queryBuilder = queryBuilder.Offset(((dto.Page - 1) * (dto.Limit)))
	}

	sql, _, _ := queryBuilder.ToSQL()

	fmt.Println("GetQueueList - sql", sql)

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Queue Request Get List", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Queue Request")
	}

	coordinatorList := []QueueResponse{}
	for rows.Next() {
		model := QueueResponse{}
		err = rows.Scan(
			&model.QueueSuppliesID,
			&model.CoordinatorName,
			&model.NumberID,
			&model.CoordinatorID,
			&model.CoordinatorCode,
			&model.FarmerName,
			&model.ProductType,
			&model.RequestQuantity,
			&model.CreatedAt,
			&model.Status,
			&model.StatusDate,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		coordinatorList = append(coordinatorList, model) // add new row information
	}

	return coordinatorList, nil
}

func (g queueRequestRepository) GetQueueGroup(ctx context.Context, dto QueueRequestListDto, userID *int64) ([]QueueGroupModel, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select(
			"uc.name",
			"c.code",
			"qd.id",
			"qd.delivery_number",
			goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
				"'queue_id', qu.id,"+
				"'delivery_id', qd.id,"+
				"'farmer_name', qu.farmer_name,"+
				"'product_type', qu.product_type,"+
				"'quantity_bucket', qu.quantity_bucket,"+
				"'serial_codes', qu.serial_codes,"+
				"'created_at', qu.created_at at time zone 'utc',"+
				"'status', qu.status,"+
				"'status_date', qu.status_date at time zone 'utc',"+
				"'printed_at', pl.print_at at time zone 'utc',"+
				"'printed_by', upl.name"+
				") ORDER BY qu.id ASC)"),
			goqu.SUM("qu.quantity_bucket"),
			goqu.COALESCE(goqu.I("bk.total"), 0),
			goqu.MAX("qu.created_at"),
			goqu.MAX("qu.status"),
			"qd.scheduled_arrival_date",
			goqu.COUNT("*").Over(goqu.W()),
		).Distinct().
		From(goqu.T("queue").As("qu")).
		With("bucket(total, coordinator_id)",
			goqu.Select(
				goqu.SUM("qs2.quantity_bucket"),
				"qs2.coordinator_id",
			).From(goqu.T("queue_supplies").As("qs2")).
				Where(goqu.Ex{"qs2.status": constants.Approved}).
				GroupBy("qs2.coordinator_id")).
		With("queue", goqu.Select(
			goqu.I("qs.*"),
			goqu.L("JSONB_AGG(bi.serial_number)").As("serial_codes")).
			From(goqu.T("queue_supplies").As("qs")).
			LeftJoin(goqu.T("bucket_information").As("bi"),
				goqu.On(goqu.I("qs.id").Eq(goqu.I("bi.queue_supplies_id")))).
			GroupBy("qs.id")).
		InnerJoin(goqu.T("coordinators").As("c"),
			goqu.On(goqu.I("qu.coordinator_id").Eq(goqu.I("c.id")))).
		InnerJoin(goqu.T("users").As("uc"),
			goqu.On(goqu.I("c.user_id").Eq(goqu.I("uc.id")))).
		LeftJoin(goqu.T("queue_delivery_list").As("qdl"),
			goqu.On(goqu.I("qdl.queue_supplies_id").Eq(goqu.I("qu.id")))).
		LeftJoin(goqu.T("queue_delivery").As("qd"),
			goqu.On(goqu.I("qd.id").Eq(goqu.I("qdl.queue_delivery_id")))).
		LeftJoin(goqu.T("print_list").As("pl"),
			goqu.On(goqu.And(
				goqu.I("qu.id").Eq(goqu.I("pl.ref_id")),
				goqu.I("pl.type").Eq(constants.PrintQueue)))).
		LeftJoin(goqu.T("users").As("upl"),
			goqu.On(goqu.I("pl.print_by").Eq(goqu.I("upl.id")))).
		LeftJoin(goqu.T("bucket").As("bk"),
			goqu.On(goqu.I("c.id").Eq(goqu.I("bk.coordinator_id")))).
		GroupBy("c.id", "uc.id", "bk.total", "qd.id")

	if dto.Mode != "history" {
		queryBuilder = queryBuilder.
			GroupByAppend(goqu.L("DATE(qu.created_at)"))
	}

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
			if filter[0] == "status" {
				filterArg := strings.Split(filter[1], ",")
				filterQuery["qu.status"] = goqu.Op{"in": filterArg}
			}
			if filter[0] == "product_type" {
				filterArg := strings.Split(filter[1], ",")
				filterQuery["qu.product_type"] = goqu.Op{"in": filterArg}
			}
			if filter[0] == "date" {
				dateBetween := strings.Split(filter[1], "/")
				startDate, err := time.Parse("2006-01-02 15:04:05", dateBetween[0]+" 00:00:00")
				if err != nil {
					logger.ContextLogger(ctx).Error("Error parsing date", zap.Error(err))
					return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Data Table")
				}

				endDate, err := time.Parse("2006-01-02 15:04:05", dateBetween[1]+" 23:59:59")
				if err != nil {
					logger.ContextLogger(ctx).Error("Error parsing date", zap.Error(err))
					return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Data Table")
				}
				filterQuery["qu.created_at"] = goqu.Op{
					"between": goqu.Range(startDate, endDate),
				}
			}
		}
	}

	if userID != nil {
		filterQuery["uc.id"] = userID
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"uc.name":        goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"qu.farmer_name": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
		})
	}

	if dto.CurrentDate != "" {
		var startDate, _ = time.Parse("2006-01-02 15:04:05", dto.CurrentDate+" 00:00:00")
		var endDate, _ = time.Parse("2006-01-02 15:04:05", dto.CurrentDate+" 23:59:59")

		queryBuilder = queryBuilder.Where(goqu.And(
			goqu.I("qu.created_at").Between(goqu.Range(startDate, endDate)),
		))
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
	} else {
		queryBuilder = queryBuilder.Order(
			goqu.I("qd.id").Desc().NullsFirst(),
			goqu.MAX("qu.status").Asc(),
		)
	}

	if dto.Limit > 0 {
		queryBuilder = queryBuilder.Limit(dto.Limit)
	}

	if dto.Page > 0 {
		queryBuilder = queryBuilder.Offset(((dto.Page - 1) * (dto.Limit)))
	}

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetQueueGroup - sql", sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Queue Request Get List", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Queue Request")
	}

	queueGroup := []QueueGroupModel{}
	for rows.Next() {
		model := QueueGroupModel{}
		err = rows.Scan(
			&model.CoordinatorName,
			&model.CoordinatorCode,
			&model.DeliveryID,
			&model.DeliveryNumber,
			&model.QueueData,
			&model.TotalBucket,
			&model.AccumBucket,
			&model.LastCreatedAt,
			&model.Status,
			&model.ScheduledArrivalDate,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		queueGroup = append(queueGroup, model) // add new row information
	}

	return queueGroup, nil
}

func (g queueRequestRepository) GetBucketListByQueueIds(ctx context.Context, queueIds []int64) ([]BucketInformationModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select(
			"bi.id",
			"bi.serial_number",
			"qs.farmer_name",
			"qs.product_type",
			"qs.created_at",
		).
		From(goqu.T("bucket_information").As("bi")).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.I("bi.queue_supplies_id").Eq(goqu.I("qs.id")))).
		Where(goqu.Ex{"qs.id": goqu.Op{"in": queueIds}}).ToSQL()

	fmt.Println("GetBucketListByQueueIds - sql", sql)

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Queue Request - Get Bucket List By Queue Delivery", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Coordinators")
	}

	var bucketList []BucketInformationModel
	for rows.Next() {
		model := BucketInformationModel{}
		err = rows.Scan(
			&model.BucketID,
			&model.SerialNumber,
			&model.FarmerName,
			&model.ProductType,
			&model.QueueDate,
		)

		if err != nil {
			log.Println(err)
		}

		bucketList = append(bucketList, model) // add new row information
	}

	return bucketList, nil
}

func (g queueRequestRepository) CreateGoods(ctx context.Context, bucketIds []int64, userID int64) ([]CreateGoodsResModel, error) {
	var params []goqu.Record
	for _, bucketID := range bucketIds {
		params = append(params, goqu.Record{
			"bucket_id":  bucketID,
			"created_at": time.Now(),
			"created_by": userID,
		})
	}

	sql, _, err := databaseImpl.QueryBuilder.
		Select("cg.id",
			"bi.id",
			"bi.serial_number",
			goqu.L("'"+string(constants.ScanToApprove)+"'").As("status"),
			"cg.created_at",
		).From(goqu.T("bucket_information").As("bi")).
		InnerJoin(goqu.T("create_goods").As("cg"),
			goqu.On(goqu.I("bi.id").Eq(goqu.I("cg.bucket_id")))).
		With("create_goods(id, bucket_id)",
			goqu.Insert(goqu.T("goods").As("gds")).
				Rows(params).
				Returning("gds.id", "gds.bucket_id", "gds.created_at")).
		ToSQL()

	fmt.Println("CreateGoods - sql", sql)

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	var models []CreateGoodsResModel
	for rows.Next() {
		var model CreateGoodsResModel
		err = rows.Scan(
			&model.GoodsID,
			&model.BucketID,
			&model.SerialNumber,
			&model.CurrentStatus,
			&model.TransactionDate,
		)

		if err != nil {
			log.Println(err)
		}

		models = append(models, model) // add new row information
	}

	return models, nil
}

func (g queueRequestRepository) RejectBucket(ctx context.Context, bucketIds []int64, userID int64) ([]CreateGoodsResModel, error) {
	var params []goqu.Record
	for _, bucketID := range bucketIds {
		params = append(params, goqu.Record{"bucket_id": bucketID})
	}

	sql, _, err := databaseImpl.QueryBuilder.
		Update("bucket_information").
		Set(goqu.Record{
			"deleted_at":     time.Now(),
			"deleted_by":     userID,
			"deleted_reason": constants.ScanToReject,
		}).
		Where(goqu.Ex{"id": bucketIds}).
		Returning("id",
			"serial_number",
			goqu.L("'"+string(constants.ScanToReject)+"'").As("status"),
			"deleted_at",
		).ToSQL()

	fmt.Println("RejectBucket - sql", sql)

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	var models []CreateGoodsResModel
	for rows.Next() {
		var model CreateGoodsResModel
		err = rows.Scan(
			&model.BucketID,
			&model.SerialNumber,
			&model.CurrentStatus,
			&model.TransactionDate,
		)

		if err != nil {
			log.Println(err)
		}

		models = append(models, model) // add new row information
	}

	return models, nil
}

func (g queueRequestRepository) GetBucketAndGoodsInformationBySerialNumber(ctx context.Context, models []CreateGoodsResModel) ([]CreateGoodsResModel, error) {
	modelsJson, err := json.Marshal(models)
	if err != nil {
		return nil, errors.ParseError(ctx, err)
	}

	modelsString := string(modelsJson)

	sql, _, err := databaseImpl.QueryBuilder.
		Select(
			"gds.id",
			"bi.id",
			"bi.serial_number",
			goqu.Case().
				When(goqu.I("bi.deleted_at").IsNotNull(), constants.ScanAlreadyRejected).
				When(goqu.I("gds.id").IsNotNull(), constants.ScanAlreadyApproved).
				Else(goqu.I("bm.status")),
			goqu.COALESCE(goqu.I("gds.created_at"), goqu.I("bi.deleted_at"))).
		From(goqu.T("bucket_information").As("bi")).
		InnerJoin(goqu.T("barcodes_model").As("bm"),
			goqu.On(goqu.I("bi.serial_number").Eq(goqu.I("bm.serial_number")))).
		LeftJoin(goqu.T("goods").As("gds"),
			goqu.On(goqu.I("bi.id").Eq(goqu.I("gds.bucket_id")))).
		With("barcodes_model(serial_number, status)",
			goqu.Select("*").
				From(goqu.L("JSONB_TO_RECORDSET('"+modelsString+"') AS "+
					"barcodes_model(serial_number VARCHAR, status VARCHAR)"))).
		ToSQL()

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	models = []CreateGoodsResModel{}
	for rows.Next() {
		var model CreateGoodsResModel
		err = rows.Scan(
			&model.GoodsID,
			&model.BucketID,
			&model.SerialNumber,
			&model.CurrentStatus,
			&model.TransactionDate,
		)

		if err != nil {
			log.Println(err)
		}

		models = append(models, model) // add new row information
	}

	return models, nil
}

func (g queueRequestRepository) GetQueueGroupDetail(ctx context.Context, dto QueueGroupDetailDto) ([]QueueGroupDetailModel, error) {
	invoiceData := goqu.Select("idinv.id",
		"idinv.invoice_number",
		"idip.purchase_id",
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"	'status', idis.status,"+
			"	'status_date', idis.created_at at time zone 'utc'"+
			") ORDER BY idis.id DESC)").As("status_list")).
		From(goqu.T("invoices").As("idinv")).
		InnerJoin(goqu.T("invoice_purchase").As("idip"),
			goqu.On(goqu.Ex{"idip.invoice_id": goqu.I("idinv.id")})).
		InnerJoin(goqu.T("invoices_status").As("idis"),
			goqu.On(goqu.Ex{"idis.invoices_id": goqu.I("idinv.id")})).
		Where(goqu.Ex{"idinv.deleted_at": nil}).
		GroupBy("idinv.id", "idinv.invoice_number", "idip.purchase_id")

	purchaseData := goqu.Select(
		"pdbi.queue_supplies_id",
		goqu.I("pdbi.id").As("bucket_id"),
		"pdbi.serial_number",
		"pdgi.unit_price",
		"pdwi.gross_weight",
		goqu.I("pdpi2.gross_weight").As("purchase_gross_weight"),
		goqu.I("pdpi2.net_weight").As("purchase_net_weight"),
		"pdpi2.purchase_price",
		goqu.Case().
			When(goqu.I("pdpi2.id").IsNotNull(), "VALIDATED").
			When(goqu.Ex{
				"pdwi.id": goqu.Op{"neq": nil},
				"pdgi.id": goqu.Op{"neq": nil},
			}, "WAITING_TO_VALIDATE").
			When(goqu.ExOr{
				"pdwi.id": goqu.Op{"neq": nil},
				"pdgi.id": goqu.Op{"neq": nil},
			}, "ON_PROGRESS").
			When(goqu.I("pdwi.id").IsNotNull(), "WEIGH").
			When(goqu.I("pdgi.id").IsNotNull(), "GRADE").
			When(goqu.I("pdg.id").IsNotNull(), "POUR_OUT").
			When(goqu.I("pdbi.deleted_reason").IsNotNull(), goqu.I("pdbi.deleted_reason")).
			Else("NOT_DELIVERED").As("status"),
		goqu.I("pdinv.id").As("invoice_id"),
		"pdinv.invoice_number",
		"pdinv.status_list",
	).From(goqu.T("purchase_information").As("pdpi2")).
		InnerJoin(goqu.T("goods").As("pdg"),
			goqu.On(goqu.Ex{"pdg.id": goqu.I("pdpi2.goods_id")})).
		InnerJoin(goqu.T("bucket_information").As("pdbi"),
			goqu.On(goqu.Ex{"pdbi.id": goqu.I("pdg.bucket_id")})).
		InnerJoin(goqu.T("grade_information").As("pdgi"),
			goqu.On(goqu.Ex{"pdgi.id": goqu.I("pdpi2.grade_information_id")})).
		InnerJoin(goqu.T("weight_information").As("pdwi"),
			goqu.On(goqu.Ex{"pdwi.id": goqu.I("pdpi2.weight_information_id")})).
		InnerJoin(goqu.T("invoices_data").As("pdinv"),
			goqu.On(goqu.Ex{"pdinv.purchase_id": goqu.I("pdpi2.id")}))

	onProgressData := goqu.Select(
		"odbi.queue_supplies_id",
		goqu.I("odbi.id").As("bucket_id"),
		"odbi.serial_number",
		"odgi.unit_price",
		"odwi.gross_weight",
		goqu.V(0).As("purchase_gross_weight"),
		goqu.V(0).As("purchase_net_weight"),
		goqu.V(0).As("purchase_price"),
		goqu.Case().
			When(goqu.Ex{
				"odwi.id": goqu.Op{"neq": nil},
				"odgi.id": goqu.Op{"neq": nil},
			}, "WAITING_TO_VALIDATE").
			When(goqu.ExOr{
				"odwi.id": goqu.Op{"neq": nil},
				"odgi.id": goqu.Op{"neq": nil},
			}, "ON_PROGRESS").
			When(goqu.I("odwi.id").IsNotNull(), "WEIGH").
			When(goqu.I("odgi.id").IsNotNull(), "GRADE").
			When(goqu.I("odg.id").IsNotNull(), "POUR_OUT").
			When(goqu.I("odbi.deleted_reason").IsNotNull(), goqu.I("odbi.deleted_reason")).
			Else("NOT_DELIVERED").As("status"),
		goqu.V(0).As("invoice_id"),
		goqu.V(nil).As("invoice_number"),
		goqu.Cast(goqu.V("[]"), "JSONB").As("status_list"),
	).From(goqu.T("bucket_information").As("odbi")).
		LeftJoin(goqu.T("goods").As("odg"),
			goqu.On(goqu.Ex{"odg.bucket_id": goqu.I("odbi.id")})).
		LeftJoin(goqu.T("grade_information").As("odgi"),
			goqu.On(goqu.Ex{"odgi.goods_id": goqu.I("odg.id")})).
		LeftJoin(goqu.T("weight_information").As("odwi"),
			goqu.On(goqu.Ex{"odwi.goods_id": goqu.I("odg.id")})).
		Where(goqu.Ex{
			"odgi.deleted_at": nil,
			"odwi.deleted_at": nil,
			"odbi.id":         goqu.Op{"notIn": goqu.Select("bucket_id").From("purchase_data")},
		})

	queryBuilder := databaseImpl.QueryBuilder.
		Select(
			"qd.id",
			"qd.delivery_number",
			goqu.Case().
				When(goqu.V(dto.GroupBy).Eq(constants.Farmer),
					goqu.I("qs.farmer_name")).
				When(goqu.V(dto.GroupBy).Eq(constants.Product),
					goqu.I("qs.farmer_name")).
				When(goqu.V(dto.GroupBy).Eq(constants.Invoice),
					goqu.I("bu.invoice_number")),
			goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
				"'bucket_id', bu.bucket_id,"+
				"'farmer_name', qs.farmer_name,"+
				"'product_type', qs.product_type,"+
				"'serial_number', bu.serial_number,"+
				"'gross_weight', bu.gross_weight,"+
				"'purchase_gross_weight', bu.purchase_gross_weight,"+
				"'purchase_net_weight', bu.purchase_net_weight,"+
				"'purchase_price', bu.purchase_price,"+
				"'invoice_number', bu.invoice_number,"+
				"'status_list', bu.status_list,"+
				"'status', bu.status,"+
				"'unit_price', bu.unit_price"+
				") ORDER BY bu.bucket_id ASC)"),
			goqu.SUM("bu.purchase_price"),
		).
		From(goqu.T("queue_delivery").As("qd")).
		InnerJoin(goqu.T("queue_delivery_list").As("qdl"),
			goqu.On(goqu.Ex{"qd.id": goqu.I("qdl.queue_delivery_id")})).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.Ex{"qdl.queue_supplies_id": goqu.I("qs.id")})).
		InnerJoin(goqu.Select("*").From("purchase_data").
			UnionAll(goqu.Select("*").From("onprogress_data")).As("bu"),
			goqu.On(goqu.Ex{"bu.queue_supplies_id": goqu.I("qs.id")})).
		GroupBy("qd.id", goqu.Case().
			When(goqu.V(dto.GroupBy).Eq(constants.Farmer),
				goqu.I("qs.farmer_name")).
			When(goqu.V(dto.GroupBy).Eq(constants.Product),
				goqu.I("qs.farmer_name")).
			When(goqu.V(dto.GroupBy).Eq(constants.Invoice),
				goqu.I("bu.invoice_number"))).
		With("invoices_data", invoiceData).
		With("purchase_data", purchaseData).
		With("onprogress_data", onProgressData)

	filterQuery := goqu.Ex{
		"qd.delivery_number": dto.DeliveryNumber,
	}

	if len(dto.Code) > 0 {
		filterQuery["bu.serial_number"] = goqu.Op{"ilike": dto.Code}
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("GetQueueGroupDetail - sql", sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get queue group detail")
	}

	var queueGroup []QueueGroupDetailModel
	for rows.Next() {
		model := QueueGroupDetailModel{}
		err = rows.Scan(
			&model.DeliveryID,
			&model.DeliveryNumber,
			&model.FilterParam,
			&model.QueueData,
			&model.PurchasePriceAccum,
		)

		if err != nil {
			log.Println(err)
		}

		queueGroup = append(queueGroup, model) // add new row information
	}

	return queueGroup, nil
}

func (g queueRequestRepository) GetBarcodeDetail(ctx context.Context, barcode string) (*BucketScanModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select("bi.serial_number",
			"u.name",
			"qs.farmer_name",
			"qs.product_type",
		).
		From(goqu.T("bucket_information").As("bi")).
		InnerJoin(goqu.T("queue_supplies").As("qs"),
			goqu.On(goqu.Ex{"bi.queue_supplies_id": goqu.I("qs.id")})).
		InnerJoin(goqu.T("coordinators").As("c"),
			goqu.On(goqu.Ex{"qs.coordinator_id": goqu.I("c.id")})).
		InnerJoin(goqu.T("users").As("u"),
			goqu.On(goqu.Ex{"c.user_id": goqu.I("u.id")})).
		Where(goqu.Ex{"bi.serial_number": barcode}).ToSQL()

	fmt.Println("GetClientBarcode - sql", sql)

	rows := g.Conn(ctx).QueryRow(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	var model BucketScanModel
	if err = rows.Scan(
		&model.SerialNumber,
		&model.CoordinatorName,
		&model.FarmerName,
		&model.ProductType,
	); err != nil {
		log.Println(err)
	}

	return &model, nil
}
