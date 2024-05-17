package uploader

import "github.com/aws/aws-sdk-go/aws/session"

type UploaderConfig interface {
	ConnectUploader() (*session.Session, error)
}

type Uploader interface {
	Check(fileName string) error
	Upload(fileName, mime string, file []byte) (string, error)
	Delete(fileName string) error
}
