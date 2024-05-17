package unique_code_generator

import "context"

type UniqueCodeRepository interface {
	GenerateUniqueCode(ctx context.Context, code string, userId int64) (*UniqueCodeModel, error)
	GetUniqueCodeHistory(ctx context.Context) ([]UniqueCodeModel, error)
	ValidateUniqueCode(ctx context.Context, code string) (bool, error)
	BurnUniqueCode(ctx context.Context, code *string, userId int64) (bool, error)
}
