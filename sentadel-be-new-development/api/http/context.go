package http

import (
	"context"
	"github.com/gin-gonic/gin"
	"sentadel-backend/internal/base/request"
	"sentadel-backend/internal/constants"
)

func setTraceId(c *gin.Context, traceId string) {
	info, exists := c.Get(constants.ReqInfoKey)
	if exists {
		parsedInfo := info.(request.RequestInfo)
		parsedInfo.TraceId = traceId

		c.Set(constants.ReqInfoKey, parsedInfo)

		return
	}
	c.Set(constants.ReqInfoKey, request.RequestInfo{TraceId: traceId})
}

func setUserId(c *gin.Context, userId int64) {
	info, exists := c.Get(constants.ReqInfoKey)
	if exists {
		parsedInfo := info.(request.RequestInfo)
		parsedInfo.UserId = userId

		c.Set(constants.ReqInfoKey, parsedInfo)

		return
	}

	c.Set(constants.ReqInfoKey, request.RequestInfo{UserId: userId})
}

func setUserContext(c *gin.Context, payload map[string]interface{}) {
	c.Set(constants.ReqInfoKey, request.RequestInfo{
		UserId:  int64(payload["userId"].(float64)),
		Modules: payload["modules"].(map[string]bool),
		Name:    payload["name"].(string),
		IsSuper: payload["isSuper"].(bool),
	})
}

func getReqInfo(c *gin.Context) request.RequestInfo {
	info, ok := c.Get(constants.ReqInfoKey)
	if ok {
		return info.(request.RequestInfo)
	}

	return request.RequestInfo{}
}

func contextWithReqInfo(c *gin.Context) context.Context {
	info, ok := c.Get(constants.ReqInfoKey)
	if ok {
		return request.WithRequestInfo(c, info.(request.RequestInfo))
	}

	return request.WithRequestInfo(c, request.RequestInfo{})
}
