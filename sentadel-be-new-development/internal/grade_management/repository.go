package grade_management

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
)

type GradeDictionaryRepository interface {
	SearchDuplicate(ctx context.Context, codeGrade []GradeModel) (map[int]GradeModel, error)
	Create(ctx context.Context, model []GradeModel) (bool, error)
	Update(ctx context.Context, model GradeManagementModel) (*GradeManagementModel, error)
	GetByID(ctx context.Context, userID int64) (*GradeManagementModel, error)
	GetGroupList(ctx context.Context, dto GradeDictionaryListDto) ([]ClientGroupResponseModel, error)
	GetByIDAndClientID(ctx context.Context, gdID int64, clientID int64) (*GradeManagementModel, error)
	Delete(ctx context.Context, userID int64) (bool, error)

	GetAllGrade(ctx context.Context, dto GradeDictionaryListDto) ([]GradeModel, error)
}

type gradeDictionaryRepository struct {
	databaseImpl.ConnManager
}

func NewGradeDictionaryRepository(manager databaseImpl.ConnManager) *gradeDictionaryRepository {
	return &gradeDictionaryRepository{
		manager,
	}
}

func (g gradeDictionaryRepository) SearchDuplicate(ctx context.Context, codeGrade []GradeModel) (map[int]GradeModel, error) {
	jsonGrades, _ := json.Marshal(codeGrade)

	sql, _, err := databaseImpl.QueryBuilder.
		Select("gd.grade", "gp.index").
		From(goqu.T("grades").As("gd")).
		InnerJoin(goqu.T("grade_params").As("gp"),
			goqu.On(goqu.Ex{
				"gd.grade":     goqu.I("gp.grade"),
				"gd.client_id": goqu.I("gp.client_id"),
			})).
		With("grade_params",
			goqu.Select("*").
				From(goqu.L("JSONB_TO_RECORDSET('"+string(jsonGrades)+"')"+
					"AS grade_params(index BIGINT, client_id BIGINT, grade VARCHAR)"))).
		ToSQL()

	fmt.Println("SearchDuplicate - sql", sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	rows, err := g.Conn(ctx).Query(ctx, sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	alreadyCreated := make(map[int]GradeModel)
	for rows.Next() {
		model := GradeModel{}
		err = rows.Scan(
			&model.Grade,
			&model.Index,
		)

		if err != nil {
			log.Println(err)
		}

		alreadyCreated[model.Index] = model
	}

	return alreadyCreated, nil
}

func (g gradeDictionaryRepository) Create(ctx context.Context, models []GradeModel) (bool, error) {
	fmt.Println("GradeCreate - model", models)
	var params []goqu.Record
	for _, model := range models {
		params = append(params, goqu.Record{
			"client_id": model.ClientID,
			"grade":     model.Grade,
			"quota":     model.Quota,
			"price":     model.Price,
			"ub":        model.UB,
		})
	}

	sql, _, err := databaseImpl.QueryBuilder.
		Insert("grades").
		Rows(params).
		ToSQL()

	fmt.Println("GradeCreate - sql", sql)

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

func (g gradeDictionaryRepository) Update(ctx context.Context, model GradeManagementModel) (*GradeManagementModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("grades").
		Set(databaseImpl.Record{
			"client_id": model.ClientID,
			"quota":     model.Quota,
			"price":     model.Price,
			"grade":     model.Grade,
		}).
		Where(databaseImpl.Ex{"id": model.ID}).
		Returning("id").
		ToSQL()

	fmt.Println("GradeUpdate - sql", sql)

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := g.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&model.ID); err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	return &model, nil
}

func (g gradeDictionaryRepository) GetByID(ctx context.Context, gdID int64) (*GradeManagementModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select("id",
			"client_id",
			"quota",
			"price",
			"grade",
			"created_at",
			"updated_at").
		From("grades").
		Where(databaseImpl.Ex{"id": gdID}).
		ToSQL()

	fmt.Println("GradeGetById - sql", sql)

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := g.Conn(ctx).QueryRow(ctx, sql)

	model := GradeManagementModel{ID: gdID}

	err = row.Scan(
		&model.ID,
		&model.ClientID,
		&model.Quota,
		&model.Price,
		&model.Grade,
		&model.CreatedAt,
		&model.UpdatedAt,
	)

	if err != nil {
		return nil, errors.ParseError(ctx, err)
	}

	return &model, nil
}

func (g gradeDictionaryRepository) GetByIDAndClientID(ctx context.Context, gdID int64, clientID int64) (*GradeManagementModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Select("id",
			"client_id",
			"quota",
			"price",
			"grade",
			"created_at",
			"updated_at").
		From("grades").
		Where(databaseImpl.Ex{"id": gdID, "client_id": clientID}).
		ToSQL()

	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := g.Conn(ctx).QueryRow(ctx, sql)

	model := GradeManagementModel{ID: gdID}

	err = row.Scan(
		&model.ID,
		&model.ClientID,
		&model.Quota,
		&model.Price,
		&model.Grade,
		&model.CreatedAt,
		&model.UpdatedAt,
	)

	if err != nil {
		return nil, errors.ParseError(ctx, err)
	}

	return &model, nil
}

func (g gradeDictionaryRepository) GetGroupList(ctx context.Context, dto GradeDictionaryListDto) ([]ClientGroupResponseModel, error) {
	gradesQuery := goqu.Select("*").
		From(goqu.T("grades").As("gd"))

	gradesFilter := goqu.Ex{
		"gd.deleted_at": nil,
	}

	groupedGradesQuery := goqu.Select(
		goqu.Func("LEFT", goqu.I("gq.grade"), 1).As("group"),
		"gq.client_id",
		goqu.Func("JSONB_AGG",
			goqu.L("JSONB_BUILD_OBJECT("+
				"'id', gq.id,"+
				"'grade', gq.grade,"+
				"'price', gq.price,"+
				"'quota', gq.quota,"+
				"'ub', gq.ub,"+
				"'created_at', gq.created_at at time zone 'utc',"+
				"'updated_at', gq.updated_at at time zone 'utc'"+
				") ORDER BY gq.grade ASC"),
		).As("list"),
	).
		From(goqu.T("grades_query").As("gq")).
		GroupBy("group", "gq.client_id")

	queryBuilder := databaseImpl.QueryBuilder.
		Select("c.id",
			"c.code",
			"c.client_name",
			goqu.Func("JSONB_AGG",
				goqu.L("JSONB_BUILD_OBJECT("+
					"'key', c.code || '-' || ggq.group,"+
					"'group', ggq.group,"+
					"'grades', ggq.list"+
					") ORDER BY ggq.group ASC"),
			),
			goqu.COUNT("*").Over(goqu.W())).
		From(goqu.T("clients").As("c")).
		LeftJoin(goqu.T("grouped_grade_query").As("ggq"),
			goqu.On(goqu.Ex{"c.id": goqu.I("ggq.client_id")})).
		GroupBy("c.id")

	filterQuery := goqu.Ex{}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
		}
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"clients.client_name": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"clients.client_id":   goqu.Op{"ilike": "%" + dto.Keyword + "%"},
			"clients.code":        goqu.Op{"ilike": "%" + dto.Keyword + "%"},
		})

		gradesFilter["gd.grade"] = goqu.Op{"ilike": "%" + dto.Keyword + "%"}
	}

	gradesQuery = gradesQuery.Where(gradesFilter)
	queryBuilder = queryBuilder.Where(filterQuery).
		With("grades_query", gradesQuery).
		With("grouped_grade_query", groupedGradesQuery)

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
		queryBuilder = queryBuilder.Order(goqu.I("c.id").Asc().NullsLast())
	}

	if dto.Limit > 0 {
		queryBuilder = queryBuilder.Limit(dto.Limit)
	}

	if dto.Page > 0 {
		queryBuilder = queryBuilder.Offset(((dto.Page - 1) * (dto.Limit)))
	}

	sql, _, _ := queryBuilder.ToSQL()

	fmt.Println("getGradeList - sql", sql)

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get List Clients")
	}

	GradeDictionaryModels := []ClientGroupResponseModel{}
	for rows.Next() {
		model := ClientGroupResponseModel{}
		err = rows.Scan(
			&model.ClientID,
			&model.ClientCode,
			&model.ClientName,
			&model.GroupedGrade,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		GradeDictionaryModels = append(GradeDictionaryModels, model) // add new row information
	}

	return GradeDictionaryModels, nil
}

func (g gradeDictionaryRepository) GetAllGrade(ctx context.Context, dto GradeDictionaryListDto) ([]GradeModel, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select(
			goqu.Func("uuid_generate_v4"),
			"g.id",
			"g.grade",
			"g.price",
			"g.quota",
			goqu.COALESCE(goqu.I("g.ub"), 0),
			"c.id",
			"c.sales_code_initial",
			"c.code",
			"c.client_name",
		).From(goqu.T("grades").As("g")).
		LeftJoin(goqu.T("clients").As("c"),
			goqu.On(goqu.Ex{"c.id": goqu.I("g.client_id")})).
		Order(goqu.I("c.client_name").Asc(), goqu.I("g.grade").Asc())

	filterQuery := goqu.Ex{
		"c.deleted_at": nil,
		"g.deleted_at": nil,
	}

	if dto.ClientID != 0 {
		filterQuery["c.id"] = dto.ClientID
	}

	sql, _, _ := queryBuilder.Where(filterQuery).ToSQL()

	fmt.Println("GetAllGrade - sql", sql)

	rows, err := g.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when get all grade")
	}

	var GradeList []GradeModel
	for rows.Next() {
		var model GradeModel
		err = rows.Scan(
			&model.ModelID,
			&model.ID,
			&model.Grade,
			&model.Price,
			&model.Quota,
			&model.UB,
			&model.ClientID,
			&model.ClientSalesCodeInitial,
			&model.ClientCode,
			&model.ClientName,
		)

		if err != nil {
			log.Println(err)
		}

		GradeList = append(GradeList, model) // add new row information
	}

	return GradeList, nil
}

func (g gradeDictionaryRepository) Delete(ctx context.Context, clientID int64) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Update("grades").
		Set(databaseImpl.Record{
			"deleted_at": time.Now(),
		}).
		Where(databaseImpl.Ex{"id": clientID}).
		Returning("id").
		ToSQL()

	if err != nil {
		return false, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := g.Conn(ctx).QueryRow(ctx, sql)

	if err := row.Scan(&clientID); err != nil {
		return false, errors.Wrap(err, errors.DatabaseError, "Error When Delete grade dictionary")
	}

	return true, nil
}
