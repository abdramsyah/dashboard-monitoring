package database

import (
	"context"
	"go.uber.org/zap"
	"sentadel-backend/internal/logger"

	"github.com/jackc/pgx/v4/pgxpool"

	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/base/errors"
)

type Client struct {
	pool *pgxpool.Pool
	url  string
	ctx  context.Context
}

func NewClient(ctx context.Context, config database.Config) *Client {
	return &Client{
		ctx: ctx,
		url: config.ConnString(),
	}
}

func (c *Client) Connect() error {
	c.Close()

	config, err := pgxpool.ParseConfig(c.url)
	if err != nil {
		logger.ContextLogger(c.ctx).Info("error db", zap.Error(err))
		return errors.Wrap(err, errors.DatabaseError, "cannot connect to database")
	}

	pool, err := pgxpool.ConnectConfig(c.ctx, config)
	if err != nil {
		logger.ContextLogger(c.ctx).Info("error db", zap.Error(err))
		return errors.Wrap(err, errors.DatabaseError, "cannot connect to database")
	}

	c.pool = pool

	return nil
}

func (c *Client) Close() {
	if c.pool != nil {
		c.pool.Close()
	}
}
