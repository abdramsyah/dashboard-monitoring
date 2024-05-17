package barcode_system

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"
	"strconv"
	"strings"
)

type BarcodeSystemRepository interface {
	CreateClientBarcode(ctx context.Context, userID int64, params CreateClientBarcodeRequest) (*ClientBarcodeGroupModel, error)
	GetClientBarcode(ctx context.Context, dto ClientBarcodeRequestDto, userID *int64) ([]ClientBarcodeGroupModel, error)
}

type barcodeSystemRepository struct {
	databaseImpl.ConnManager
}

func NewBarcodeSystemRepository(manager databaseImpl.ConnManager) *barcodeSystemRepository {
	return &barcodeSystemRepository{
		ConnManager: manager,
	}
}

func (bsr barcodeSystemRepository) CreateClientBarcode(ctx context.Context, userID int64, params CreateClientBarcodeRequest) (*ClientBarcodeGroupModel, error) {
	qtyString := strconv.FormatInt(params.Quantity, 10)
	sql, _, err := databaseImpl.QueryBuilder.
		Select("u.id",
			"u.name",
			"c.id",
			"c.client_name",
			goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
				"	'code_id', cc.id,"+
				"	'code', cc.code"+
				") ORDER BY cc.id ASC)")).
		From(goqu.T("create_codes").As("cc")).
		InnerJoin(goqu.T("clients").As("c"),
			goqu.On(goqu.I("c.id").Eq(goqu.I("cc.client_id")))).
		InnerJoin(goqu.T("users").As("u"),
			goqu.On(goqu.I("u.id").Eq(goqu.I("cc.user_id")))).
		GroupBy("u.id", "c.id").
		With("codes(num)", goqu.
			Select(goqu.COUNT("cl.id")).
			From(goqu.T("code_list").As("cl")).
			Where(goqu.Ex{"cl.client_id": params.ClientID}).
			Limit(1)).
		With("client_data(initial)", goqu.
			Select(goqu.L("LEFT(c.code, 1)")).
			From(goqu.T("clients").As("c")).
			Where(goqu.Ex{"c.id": params.ClientID}).
			Limit(1)).
		With("series", goqu.Select("t.*").
			From(goqu.L("GENERATE_SERIES((SELECT num FROM codes)::BIGINT + 1,"+
				"(SELECT num FROM codes)::BIGINT + "+qtyString+")").As("num")).
			CrossJoin(goqu.Lateral(
				goqu.Select(
					goqu.L("(SELECT initial FROM client_data) || '-' || "+
						"num_to_char(FLOOR((num-1)/26000)::BIGINT) || "+
						"num_to_char(FLOOR((MOD(num - 1, 26000))/1000)::BIGINT) || "+
						"RIGHT((10000 + MOD(num - 1, 1000) + 1)::TEXT, -1)"),
					goqu.V(userID),
					goqu.V(params.ClientID),
					goqu.V(params.AssigneeID))).As("t"))).
		With("create_codes", goqu.
			Insert("code_list").
			Cols("code", "created_by", "client_id", "user_id").
			FromQuery(goqu.
				Select("*").
				From("series")).
			Returning("*")).
		ToSQL()

	fmt.Println("CreateClientBarcode - sql", sql)

	row := bsr.Conn(ctx).QueryRow(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	var model ClientBarcodeGroupModel
	err = row.Scan(
		&model.UserID,
		&model.UserName,
		&model.ClientID,
		&model.ClientName,
		&model.Codes,
	)

	if err != nil {
		log.Println(err)
	}

	return &model, nil
}

func (bsr barcodeSystemRepository) GetClientBarcode(ctx context.Context, dto ClientBarcodeRequestDto, userID *int64) ([]ClientBarcodeGroupModel, error) {
	allCodesGroupedByInitialQuery := goqu.Select(
		goqu.L("JSONB_AGG(JSONB_BUILD_OBJECT("+
			"'code', cl.code,"+
			"'status', 'free',"+
			"'timestamp', 0"+
			") ORDER BY cl.code ASC)").As("codes"),
		goqu.Func("LEFT",
			goqu.Func("SPLIT_PART", goqu.I("cl.code"), "-", 2),
			2,
		).As("code_initial"),
		"cl.user_id",
		"cl.client_id",
		goqu.COUNT("*").Over(goqu.W()),
	).
		Distinct().
		From(goqu.T("code_list").As("cl")).
		LeftJoin(goqu.T("grade_information").As("gi"),
			goqu.On(goqu.Ex{"gi.code_id": goqu.I("cl.id")})).
		Where(goqu.Ex{
			"gi.id": nil,
		}).
		GroupBy("cl.user_id", "cl.client_id", "code_initial")

	codesGroupedByInitialFilterQuery := goqu.Ex{"gi.id": nil}

	queryBuilder := databaseImpl.QueryBuilder.
		Select("u.id",
			"u.name",
			"c.id",
			"c.sales_code_initial",
			"c.code",
			"c.client_name",
			goqu.Func("JSONB_AGG",
				goqu.L("JSONB_BUILD_OBJECT("+
					"'initial', clt.code_initial,"+
					"'codes', clt.codes"+
					") ORDER BY clt.code_initial ASC")).As("code_data"),
		).
		From(goqu.T("code_list_temp").As("clt")).
		InnerJoin(goqu.T("clients").As("c"),
			goqu.On(goqu.Ex{"clt.client_id": goqu.I("c.id")})).
		InnerJoin(goqu.T("users").As("u"),
			goqu.On(goqu.Ex{"clt.user_id": goqu.I("u.id")})).
		GroupBy("clt.user_id", "c.id", "u.id").
		With("code_list_temp", allCodesGroupedByInitialQuery)

	filterQuery := goqu.Ex{}

	if userID != nil {
		filterQuery["clt.user_id"] = userID
	}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "name" {
				var paramsRole []string
				err := json.Unmarshal([]byte(filter[1]), &paramsRole)
				if err != nil {
					log.Println(err)
				}
				filterQuery["u.id"] = goqu.Op{"in": paramsRole}
			}

			if filter[0] == "client" {
				var paramsRole []string
				err := json.Unmarshal([]byte(filter[1]), &paramsRole)
				if err != nil {
					log.Println(err)
				}
				filterQuery["c.id"] = goqu.Op{"in": paramsRole}
			}
		}
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"u.name":        goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"c.client_name": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
		})

		codesGroupedByInitialFilterQuery["cl.code"] = goqu.Op{"ilike": "%" + dto.Keyword + "%"}
	}

	queryBuilder = queryBuilder.Where(filterQuery)

	allCodesGroupedByInitialQuery = allCodesGroupedByInitialQuery.Where(codesGroupedByInitialFilterQuery)

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
		queryBuilder = queryBuilder.Order(goqu.I("u.id").Asc().NullsLast())
	}

	if dto.Limit > 0 {
		queryBuilder = queryBuilder.Limit(dto.Limit)
	}

	if dto.Page > 0 {
		queryBuilder = queryBuilder.Offset(((dto.Page - 1) * (dto.Limit)))
	}

	sql, _, _ := queryBuilder.ToSQL()

	fmt.Println("GetClientBarcode - sql", sql)

	rows, err := bsr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	var models []ClientBarcodeGroupModel
	for rows.Next() {
		var model ClientBarcodeGroupModel
		err = rows.Scan(
			&model.UserID,
			&model.UserName,
			&model.ClientID,
			&model.ClientSalesCodeInitial,
			&model.ClientCode,
			&model.ClientName,
			&model.CodeData,
		)

		if err != nil {
			log.Println(err)
		}

		models = append(models, model) // add new row information
	}

	return models, nil
}
