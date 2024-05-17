package loan_management

import (
	"context"
	"fmt"
	"github.com/doug-martin/goqu/v9"
	"go.uber.org/zap"
	"log"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/logger"
	"strings"
	"time"
)

type LoanManagementRepository interface {
	AddNewLoan(ctx context.Context, model ManageLoanRequestModel, userID int64) (bool, error)
	UpdateLoan(ctx context.Context, model ManageLoanRequestModel, userID int64) (bool, error)
	GetLoanList(ctx context.Context, dto GetLoanListDto) (res []LoanModel, err error)
	AddNewRepayment(ctx context.Context, models []AddNewRepaymentModel, invoiceID *int64, userID int64) (bool, error)
}

type loanManagementRepository struct {
	databaseImpl.ConnManager
}

func NewLoanManagementRepository(conn databaseImpl.ConnManager) *loanManagementRepository {
	return &loanManagementRepository{
		conn,
	}
}

func (lmr loanManagementRepository) AddNewLoan(ctx context.Context, model ManageLoanRequestModel, userID int64) (bool, error) {
	sql, _, err := databaseImpl.QueryBuilder.
		Insert("loan").
		Rows(goqu.Record{
			"code": goqu.COALESCE(
				goqu.Select("last_num").
					From("max_code"),
				goqu.V("L"+time.Now().Format("0601")+"001")),
			"loan_principal": model.LoanPrincipal,
			"total":          model.Total,
			"reference_type": model.ReferenceType,
			"reference_id":   model.ReferenceID,
			"created_by":     userID,
			"description":    model.Description,
		}).
		With("max_code",
			goqu.L("(SELECT LEFT(MAX(code), 5) || "+
				"TO_CHAR(SUBSTRING(MAX(code), 6)::INT + 1, 'fm000') "+
				"AS last_num "+
				"FROM loan "+
				"WHERE EXTRACT(MONTH from created_at) = EXTRACT(MONTH from CURRENT_TIMESTAMP) "+
				"AND EXTRACT(YEAR from created_at) = EXTRACT(YEAR from CURRENT_TIMESTAMP))")).
		ToSQL()

	fmt.Println("AddNewLoan - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Add new loan error")
	}

	_, err = lmr.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Add new loan error")
	}

	return true, nil
}

func (lmr loanManagementRepository) UpdateLoan(ctx context.Context, model ManageLoanRequestModel, userID int64) (bool, error) {
	fmt.Println("UpdateLoan - model", model)

	sql, _, err := databaseImpl.QueryBuilder.
		Insert("loan").
		Rows(goqu.Record{
			"code":           goqu.Select("code").From("delete_loan"),
			"loan_principal": model.LoanPrincipal,
			"total":          model.Total,
			"reference_type": model.ReferenceType,
			"reference_id":   model.ReferenceID,
			"created_by":     userID,
			"description":    model.Description,
		}).
		With("delete_loan",
			goqu.Update("loan").
				Set(goqu.Record{
					"deleted_at":    time.Now(),
					"deleted_by":    userID,
					"delete_reason": "UPDATE",
				}).
				Where(goqu.Ex{"id": model.LoanID}).
				Returning("*"),
		).
		ToSQL()

	fmt.Println("UpdateLoan - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Add new loan error")
	}

	_, err = lmr.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Add new loan error")
	}

	return true, nil
}

func (lmr loanManagementRepository) GetLoanList(ctx context.Context, dto GetLoanListDto) (res []LoanModel, err error) {
	queryBuilder := databaseImpl.QueryBuilder.
		Select("l.id",
			"l.code",
			"l.loan_principal",
			"l.total",
			"l.reference_type",
			"l.reference_id",
			goqu.Case().
				When(goqu.I("l.reference_type").Eq(constants.LoanPartner),
					goqu.I("pd.name")).
				When(goqu.I("l.reference_type").Eq(constants.LoanCoordinator),
					goqu.I("cd.name")).As("reference_name"),
			goqu.COALESCE(goqu.I("pd.code"), goqu.I("cd.code")),
			"pd.coordinator_name",
			"l.description",
			"l.created_at",
			"u.name",
			goqu.COUNT("*").Over(goqu.W()),
		).From(goqu.T("loan").As("l")).
		InnerJoin(goqu.T("users").As("u"),
			goqu.On(goqu.Ex{"l.created_by": goqu.I("u.id")})).
		LeftJoin(goqu.T("partner_data").As("pd"),
			goqu.On(goqu.Ex{"l.reference_id": goqu.I("pd.id")})).
		LeftJoin(goqu.T("coodinator_data").As("cd"),
			goqu.On(goqu.Ex{"l.reference_id": goqu.I("cd.id")})).
		With("partner_data",
			goqu.Select("p.*",
				"cp.code",
				goqu.I("ucp.name").As("coordinator_name"),
			).From(goqu.T("partnership").As("p")).
				InnerJoin(goqu.T("coordinators").As("cp"),
					goqu.On(goqu.Ex{"p.coordinator_id": goqu.I("cp.id")})).
				InnerJoin(goqu.T("users").As("ucp"),
					goqu.On(goqu.Ex{"cp.user_id": goqu.I("ucp.id")})),
		).
		With("coodinator_data",
			goqu.Select("c.*", "uc.name").
				From(goqu.T("coordinators").As("c")).
				InnerJoin(goqu.T("users").As("uc"),
					goqu.On(goqu.Ex{"c.user_id": goqu.I("uc.id")})))

	filterQuery := goqu.Ex{
		"cd.deleted_at": nil,
		"pd.deleted_at": nil,
		"u.deleted_at":  nil,
		"l.deleted_at":  nil,
	}

	if len(dto.Filter) > 0 {
		for _, filterVal := range dto.Filter {
			filter := strings.Split(filterVal, ":")
			if len(filter[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if filter[0] == "reference_id" {
				filterQuery["l.reference_id"] = filter[1]
			}
		}
	}

	if len(dto.SortBy) > 0 {
		for _, sortVal := range dto.SortBy {
			sort := strings.Split(sortVal, ":")
			if len(sort[0]) < 2 {
				return nil, errors.New(errors.BadRequestError)
			}
			if sort[0] == "reference_name" {
				sortType := strings.ToLower(sort[1])
				if sortType == "asc" {
					queryBuilder = queryBuilder.Order(goqu.I("reference_name").Asc())
				} else {
					queryBuilder = queryBuilder.Order(goqu.I("reference_name").Desc())
				}
			}
		}
	} else {
		queryBuilder = queryBuilder.Order(goqu.I("l.created_at").Asc())
	}

	if dto.Keyword != "" {
		queryBuilder = queryBuilder.Where(goqu.ExOr{
			"reference_name": goqu.Op{"ilike": "%" + dto.Keyword + "%"},
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

	fmt.Println("GetLoanList - sql", sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Get Loan Query Error")
	}

	rows, err := lmr.Conn(ctx).Query(ctx, sql)
	if err != nil {
		return nil, errors.Wrap(err, errors.DatabaseError, "Error when try to get loan")
	}

	for rows.Next() {
		var model LoanModel
		err = rows.Scan(
			&model.ID,
			&model.Code,
			&model.LoanPrincipal,
			&model.TotalLoan,
			&model.ReferenceType,
			&model.ReferenceID,
			&model.ReferenceName,
			&model.CoordinatorCode,
			&model.CoordinatorName,
			&model.Description,
			&model.CreatedAt,
			&model.CreatedBy,
			&model.Total,
		)

		if err != nil {
			log.Println(err)
		}

		res = append(res, model) // add new row information
	}

	return res, nil
}

func (lmr loanManagementRepository) AddNewRepayment(ctx context.Context, models []AddNewRepaymentModel, invoiceID *int64, userID int64) (bool, error) {
	var params []goqu.Record
	for _, model := range models {
		params = append(params, goqu.Record{
			"loan_id":     model.LoanID,
			"value":       model.Value,
			"created_by":  userID,
			"description": model.Description,
		})
	}

	var queryBuilder *goqu.InsertDataset
	if invoiceID == nil {
		queryBuilder = databaseImpl.QueryBuilder.
			Insert("repayment").
			Rows(params)
	} else {
		queryBuilder = databaseImpl.QueryBuilder.
			Insert("repayment_invoice").
			Cols("repayment_id", "invoice_id").
			FromQuery(
				goqu.Select("id", goqu.V(invoiceID)).
					From("create_repayment")).
			With("create_repayment",
				goqu.Insert("repayment").
					Rows(params).
					Returning("*"))
	}

	sql, _, err := queryBuilder.ToSQL()

	fmt.Println("AddNewRepayment - sql", sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Db Syntax Error", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Add new repayment error")
	}

	_, err = lmr.Conn(ctx).Exec(ctx, sql)
	if err != nil {
		logger.ContextLogger(ctx).Error("Error When Parsing Data DB", zap.Error(err))
		return false, errors.Wrap(err, errors.DatabaseError, "Add new repayment error")
	}

	return true, nil
}
