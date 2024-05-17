package cache

import (
	"context"
	"time"
)

type Cache interface {
	Set(ctx context.Context, key, val string, ttl time.Duration) bool
	Get(ctx context.Context, key string) (string, error)
	//SetWithoutExpiry(ctx context.Context, key, val string) error
	//Del(ctx context.Context, keys ...string) error
	//GetTTL(ctx context.Context, key string) (interface{}, error)
	//Publish(ctx context.Context, channel string, message string) (int, error)
}
