package logger

import (
	"context"
	"fmt"
	"sentadel-backend/internal/constants"
	"sync"

	"go.uber.org/zap"
)

var mainLogger *zap.Logger = nil

var mainLoggerInit sync.Once

func NewMainLoggerSingleton() *zap.Logger {
	mainLoggerInit.Do(func() {
		logger, err := zap.NewProduction()
		if err != nil {
			logger.Error("logger initialization failed", zap.Any("error", err))
			panic(fmt.Sprintf("logger initialization failed %v", err))
		}
		logger.Info("logger started")
		mainLogger = logger
	})

	return mainLogger
}

func NewMainNoOpLoggerSingleton() *zap.Logger {
	mainLoggerInit.Do(func() {
		logger := zap.NewNop()
		logger.Info("logger started")
		mainLogger = logger
	})

	return mainLogger
}

func NewNoOp() *zap.Logger {
	return zap.NewNop()
}

func GetLogger() *zap.Logger {
	return mainLogger
}

func ContextLogger(ctx context.Context) *zap.Logger {
	logger := GetLogger()

	if ctxRqID, ok := ctx.Value(constants.ContextRequestID).(string); ok {
		return logger.With(zap.String(constants.ContextRequestID, ctxRqID))
	}

	return logger
}
