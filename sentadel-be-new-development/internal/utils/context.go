package utils

import (
	"context"
	"sentadel-backend/internal/base/request"
	"sentadel-backend/internal/constants"
)

func GetReqInfo(ctx context.Context) request.RequestInfo {
	if reqInfo, ok := ctx.Value(constants.ReqInfoKey).(request.RequestInfo); ok {
		return reqInfo
	}

	return request.RequestInfo{}
}
