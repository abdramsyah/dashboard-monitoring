package errors

import (
	"context"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgerrcode"
)

type ErrType string

const (
	ErrValidationRole ErrType = "Validation, Role Required"
)

func ParseError(ctx context.Context, err error) error {
	pgError, isPgError := err.(*pgconn.PgError)

	if err.Error() == "no rows in result set" {
		return Wrapf(err, BadRequestError, "Data not found")
	}

	if isPgError && pgError.Code == pgerrcode.UniqueViolation {
		switch pgError.ConstraintName {
		default:
			return Wrapf(err, DatabaseError, "Internal Server Error")
		}
	}

	return Wrapf(err, DatabaseError, "Internal Server Error")
}
