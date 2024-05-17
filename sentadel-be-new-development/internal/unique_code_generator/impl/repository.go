package impl

import (
	"context"
	"fmt"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/unique_code_generator"
	"time"

	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
)

type UniqueCodeRepositoryOpts struct {
	ConnManager databaseImpl.ConnManager
}

func NewUniqueCodeRepository(opts UniqueCodeRepositoryOpts) unique_code_generator.UniqueCodeRepository {
	return &uniqueCodeRepository{
		ConnManager: opts.ConnManager,
	}
}

type uniqueCodeRepository struct {
	databaseImpl.ConnManager
}

func (ur *uniqueCodeRepository) GenerateUniqueCode(ctx context.Context, code string, userId int64) (*unique_code_generator.UniqueCodeModel, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("unique_codes").
		Rows(databaseImpl.Record{
			"code": code,
		}).
		Returning("id").
		ToSQL()

	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "syntax error")
	}

	row := ur.Conn(ctx).QueryRow(ctx, sql)

	model := unique_code_generator.UniqueCodeModel{}

	if err := row.Scan(&model.ID); err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return nil, errors.Wrap(err, errors.DatabaseError, "parsing db error")
	}

	model.Code = code

	return &model, nil
}

func (ur *uniqueCodeRepository) GetUniqueCodeHistory(ctx context.Context) ([]unique_code_generator.UniqueCodeModel, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select("uq.id",
			"uq.code",
			"uq.created_at",
			"uq.used_at",
			"u.name",
		).
		From(goqu.T("unique_codes").As("uq")).
		LeftJoin(goqu.T("users").As("u"),
			goqu.On(goqu.I("uq.used_by").Eq(goqu.I("u.id")))).
		Order(goqu.I("created_at").Desc())

	sql, _, _ := queryBuilder.ToSQL()

	rows, err := ur.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when Get Unique CoordinatorCode History")
	}

	uniqueCodeModels := []unique_code_generator.UniqueCodeModel{}
	for rows.Next() {
		model := unique_code_generator.UniqueCodeModel{}
		err = rows.Scan(
			&model.ID,
			&model.Code,
			&model.CreatedAt,
		)

		if err != nil {
			log.Println(err)
		}

		uniqueCodeModels = append(uniqueCodeModels, model) // add new row information
	}

	return uniqueCodeModels, nil
}

func (ur *uniqueCodeRepository) ValidateUniqueCode(ctx context.Context, code string) (bool, error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select(goqu.Case().
			When(goqu.C("used_at").IsNull(), true).
			Else(false),
		).Distinct().
		From("unique_codes").
		Where(goqu.Ex{
			"code": code,
		})

	sql, _, _ := queryBuilder.ToSQL()

	fmt.Println("ValidateUniqueCode - sql", sql)

	row := ur.Conn(ctx).QueryRow(ctx, sql)

	var result bool
	err := row.Scan(&result)
	if err != nil {
		return false, errors.Errorf(errors.NotFoundError, "unique code not found")
	}

	return result, nil
}

func (ur *uniqueCodeRepository) BurnUniqueCode(ctx context.Context, code *string, userId int64) (bool, error) {
	if code == nil {
		return false, errors.Errorf(errors.BadRequestError, "unique code false")
	}
	queryBuilder := databaseImpl.QueryBuilder.
		Update("unique_codes").
		Set(databaseImpl.Record{
			"used_at": time.Now(),
			"used_by": userId,
		}).
		Where(goqu.I("unique_codes.code").Eq(code))

	sql, _, _ := queryBuilder.ToSQL()

	row := ur.Conn(ctx).QueryRow(ctx, sql)

	var result bool
	row.Scan(&result)

	return result, nil
}
