package cache

import (
	"context"
	"errors"
	"fmt"
	"github.com/dgraph-io/ristretto"
	"go.uber.org/zap"
	"sentadel-backend/internal/logger"
	"time"
)

var (
	ErrKeyNotFound = errors.New("key not found")
)

type localCache struct {
	client *ristretto.Cache
}

func NewLocalCache() (Cache, error) {
	localCacheRistretto, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e7,     // number of keys to track frequency of (10M).
		MaxCost:     1 << 30, // maximum cost of cache (1GB).
		BufferItems: 64,      // number of keys per Get buffer.
	})

	if err != nil {
		logger.GetLogger().Error("Error When Contruct Cache", zap.Error(err))
	}

	return localCache{
		client: localCacheRistretto,
	}, nil
}

func (l localCache) Get(ctx context.Context, key string) (s string, string error) {
	ret, found := l.client.Get(key)

	if !found {
		logger.ContextLogger(ctx).Warn("Key Not Found or Expiry")

		return "", ErrKeyNotFound
	}

	return fmt.Sprintf("%v", ret), nil
}

func (l localCache) Set(ctx context.Context, key, val string, ttl time.Duration) bool {
	successSet := l.client.Set(key, val, int64(ttl.Seconds()))

	if !successSet {
		logger.ContextLogger(ctx).Warn("Fail to Seet Key Local Cache")
	}

	return successSet
}
