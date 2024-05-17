package global

import (
	"strconv"
	"strings"
	"time"
)

func GroupingKey(value string) (*int64, *string) {
	if len(value) == 0 {
		return nil, nil
	}

	if val, err := strconv.ParseInt(value, 10, 64); err == nil {
		return &val, nil
	}

	return nil, &value
}

func CreateGroupingNumber(ClientCode string) string {
	return "G-" + strings.ToUpper(ClientCode) + time.Now().Local().Format("060102")
}

func CreateShipmentNumber(ClientCode string) string {
	return "G-" + strings.ToUpper(ClientCode) + time.Now().Local().Format("060102")
}
