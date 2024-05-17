package impl

import (
	"bytes"
	"sentadel-backend/config"
	"sentadel-backend/internal/base/uploader"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

type UploaderOption struct {
	awsAccessKeyID     string
	awsSecretAccessKey string
	s3Region           string
	s3Bucket           string
	s3BaseURL          string
	session            *session.Session
}

func NewUploader(cfg *config.Config, sess *session.Session) uploader.Uploader {
	return &UploaderOption{
		awsAccessKeyID:     cfg.AwsAccessKeyID,
		awsSecretAccessKey: cfg.AwsSecretAccessKey,
		s3Region:           cfg.S3Region,
		s3Bucket:           cfg.S3BucketName,
		s3BaseURL:          cfg.S3BaseUrl,
		session:            sess,
	}
}

func (o *UploaderOption) Check(fileName string) error {
	check := s3.New(o.session)

	_, err := check.HeadObject(&s3.HeadObjectInput{
		Bucket: aws.String(o.s3Bucket),
		Key:    aws.String(fileName),
	})

	if err != nil {
		return err
	}

	return nil
}

func (o *UploaderOption) Upload(fileName, mime string, file []byte) (string, error) {
	uploader := s3manager.NewUploader(o.session)

	output, err := uploader.Upload(&s3manager.UploadInput{
		Bucket:      aws.String(o.s3Bucket),
		ACL:         aws.String("public-read"),
		Key:         aws.String(fileName),
		Body:        bytes.NewBuffer(file),
		ContentType: aws.String(string(mime)),
	})
	if err != nil {
		return "", err
	}

	return output.Location, nil
}

func (o *UploaderOption) Delete(fileName string) error {
	deleter := s3.New(o.session)

	_, err := deleter.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(o.s3Bucket),
		Key:    aws.String(fileName),
	})
	if err != nil {
		return err
	}

	err = deleter.WaitUntilObjectNotExists(&s3.HeadObjectInput{
		Bucket: aws.String(o.s3Bucket),
		Key:    aws.String(fileName),
	})
	if err != nil {
		return err
	}

	return nil
}
