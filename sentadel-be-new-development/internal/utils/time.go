package utils

import "time"

func GetDate(str string) (time.Time, error) {
	layout := "2006-01-02"
	return time.Parse(layout, str)
}
