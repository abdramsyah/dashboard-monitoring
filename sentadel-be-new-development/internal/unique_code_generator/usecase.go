package unique_code_generator

import "context"

type UniqueCodeUseCases interface {
	Generate(ctx context.Context, userId int64) (*UniqueCodeResponse, error)
	GetUniqueCodeHistory(ctx context.Context) (UniqueCodeHistoryResponse, error)
	ValidateUniqueCode(ctx context.Context, code string) (bool, error)
	BurnUniqueCode(ctx context.Context, code string, userId int64) (bool, error)
}
