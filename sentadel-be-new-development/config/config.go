package config

import (
	"fmt"
	"time"

	"sentadel-backend/api/http"
	"sentadel-backend/internal/auth"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/base/uploader"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/kelseyhightower/envconfig"
	"github.com/subosito/gotenv"
)

// Config

type Config struct {
	HttpHost          string `envconfig:"HTTP_HOST"`
	HttpPort          int    `envconfig:"HTTP_PORT"`
	HttpDetailedError bool   `envconfig:"HTTP_DETAILED_ERROR"`

	DatabaseURL string `envconfig:"DATABASE_URL"`

	FEHost string `envconfig:"FE_HOST"`

	AccessTokenExpiresTTL int    `envconfig:"ACCESS_TOKEN_EXPIRES_TTL"`
	AccessTokenSecret     string `envconfig:"ACCESS_TOKEN_SECRET"`

	AwsAccessKeyID     string `envconfig:"AWS_ACCESS_KEY_ID"`
	AwsSecretAccessKey string `envconfig:"AWS_SECRET_ACCESS_KEY"`
	S3Region           string `envconfig:"S3_REGION"`
	S3BucketName       string `envconfig:"S3_BUCKET_NAME"`
	S3BaseUrl          string `envconfig:"S3_BASE_URL"`
}

func ParseEnv(envPath string) (*Config, error) {
	if envPath != "" {
		if err := gotenv.OverLoad(envPath); err != nil {
			return nil, err
		}
	}

	var config Config

	if err := envconfig.Process("", &config); err != nil {
		return nil, err
	}

	return &config, nil
}

func (c *Config) HTTP() http.Config {
	return &httpConfig{
		host:          c.HttpHost,
		port:          c.HttpPort,
		detailedError: c.HttpDetailedError,
	}
}

func (c *Config) Database() database.Config {
	return &databaseConfig{
		url: c.DatabaseURL,
	}
}

func (c *Config) Auth() auth.Config {
	return &authConfig{
		accessTokenExpiresTTL: c.AccessTokenExpiresTTL,
		accessTokenSecret:     c.AccessTokenSecret,
	}
}

func (c *Config) S3() uploader.UploaderConfig {
	return &s3Config{
		awsAccessKeyID:     c.AwsAccessKeyID,
		awsSecretAccessKey: c.AwsSecretAccessKey,
		s3Region:           c.S3Region,
		s3Bucket:           c.S3BucketName,
		s3BaseURL:          c.S3BaseUrl,
	}
}

// HTTP

type httpConfig struct {
	host          string
	port          int
	detailedError bool
}

func (c *httpConfig) Address() string {
	return fmt.Sprintf("%s:%d", c.host, c.port)
}

func (c *httpConfig) DetailedError() bool {
	return c.detailedError
}

// Database

type databaseConfig struct {
	url string
}

func (c *databaseConfig) ConnString() string {
	return c.url
}

// Auth

type authConfig struct {
	accessTokenExpiresTTL int
	accessTokenSecret     string
}

func (c *authConfig) AccessTokenSecret() string {
	return c.accessTokenSecret
}

func (c *authConfig) AccessTokenExpiresDate() time.Time {
	duration := time.Duration(c.accessTokenExpiresTTL)
	return time.Now().UTC().Add(time.Minute * duration)
}

// AWS S3

type s3Config struct {
	awsAccessKeyID     string
	awsSecretAccessKey string
	s3Region           string
	s3Bucket           string
	s3BaseURL          string
}

func (c *s3Config) ConnectUploader() (*session.Session, error) {
	sess, err := session.NewSession(
		&aws.Config{
			Region: aws.String(c.s3Region),
			Credentials: credentials.NewStaticCredentials(
				c.awsAccessKeyID,
				c.awsSecretAccessKey,
				"",
			),
		})
	if err != nil {
		return nil, err
	}

	return sess, nil
}
