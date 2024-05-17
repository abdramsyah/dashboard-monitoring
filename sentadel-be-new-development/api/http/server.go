package http

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/base/request"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/logger"
	"strconv"
	"time"

	"github.com/gofrs/uuid"
	"go.uber.org/zap"

	"github.com/gin-gonic/gin"

	"sentadel-backend/internal/auth"
	"sentadel-backend/internal/base/crypto"
	"sentadel-backend/internal/user"
)

type Config interface {
	DetailedError() bool
	Address() string
}

type ServerOpts struct {
	UserUsecases user.UserUsecases
	AuthService  auth.AuthService
	Crypto       crypto.Crypto
	Config       Config
}

// type bodyLogWriter struct {
// 	gin.ResponseWriter
// 	body *bytes.Buffer
// }

// func (w bodyLogWriter) Write(b []byte) (int, error) {
// 	w.body.Write(b)
// 	return w.ResponseWriter.Write(b)
// }

func readRequestBody(req *http.Request) ([]byte, error) {
	body, err := io.ReadAll(req.Body)
	if err != nil {
		logger.ContextLogger(req.Context()).Error(fmt.Sprintf("Error reading body: %v", err))
		return nil, err
	}

	req.Body = io.NopCloser(bytes.NewBuffer(body))

	return body, nil
}

type ResponseBodyWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func RequestMiddleware() (handler gin.HandlerFunc) {
	return func(ctx *gin.Context) {
		start := time.Now()
		body, _ := readRequestBody(ctx.Request)
		reqData := getRequestParam(ctx.Request, body)
		logger.ContextLogger(ctx).With(reqData...).Info("Request")

		rbw := &ResponseBodyWriter{body: bytes.NewBufferString(""), ResponseWriter: ctx.Writer}
		ctx.Writer = rbw

		stop := time.Now()
		latency := stop.Sub(start).Milliseconds()

		resData := reqData
		resData = append(resData, getResponseParam(rbw, latency)...)
		logger.ContextLogger(ctx).With(resData...).Info("Response")
	}
}

func getResponseParam(rbw *ResponseBodyWriter, latency int64) []zap.Field {
	var resData []zap.Field
	resData = append(resData,
		zap.Any("httpStatus", rbw.Status()),
		zap.Any("body", rbw.body.String()),
		zap.Any("latency_human", strconv.FormatInt(latency, 10)),
		zap.Any("headers", rbw.Header()),
	)

	return resData
}

func getRequestParam(req *http.Request, body []byte) []zap.Field {
	var reqData []zap.Field
	reqData = append(reqData, zap.Any("host", req.Host),
		zap.Any("uri", req.RequestURI),
		zap.Any("method", req.Method),
		zap.Any("path", func() interface{} {
			p := req.URL.Path
			if p == "" {
				p = "/"
			}

			return p
		}()),
		zap.Any("protocol", req.Proto),
		zap.Any("referer", req.Referer()),
		zap.Any("user_agent", req.UserAgent()),
		zap.Any("headers", req.Header),
		zap.Any("remote_ip", req.RemoteAddr),
		zap.Any("body", string(body)),
	)

	return reqData
}

func NewServer(authService auth.AuthService, config Config, feHost string, mhandlers ...HTTPHandler) *Server {
	gin.SetMode(gin.ReleaseMode)

	server := &Server{
		gin.New(),
		authService,
		config,
	}

	server.Use(server.trace())
	server.Use(server.recover())
	server.Use(CORSMiddleware(feHost))
	server.Use(server.logger())
	server.Use(server.Authentication())
	server.NoRoute(server.methodNotFound)

	for _, handler := range mhandlers {
		handler.AddRoutes(server)
	}

	return server
}

func CORSMiddleware(feHost string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "*")
		c.Header("Access-Control-Allow-Methods", "POST, HEAD, PATCH, DELETE, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

type Server struct {
	*gin.Engine
	auth.AuthService
	Config
}

func (s *Server) methodNotFound(c *gin.Context) {
	err := errors.New(errors.NotFoundError)
	errorResponse(err, nil, true).reply(c)
}

func (s *Server) recover() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		response := internalErrorResponse(nil)
		c.AbortWithStatusJSON(response.Status, response)
	})
}

func (s *Server) trace() gin.HandlerFunc {
	return func(c *gin.Context) {
		traceId := c.Request.Header.Get("Trace-Id")
		if traceId == "" {
			traceId, _ = s.GenerateUUID()
		}

		setTraceId(c, traceId)
		c.Set(constants.ContextRequestID, traceId)
	}
}

func (*Server) GenerateUUID() (string, error) {
	id, err := uuid.NewV4()
	if err != nil {
		return "", err
	}

	return id.String(), nil
}

func (s *Server) logger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		var parsedReqInfo request.RequestInfo

		reqInfo, exists := param.Keys[constants.ReqInfoKey]
		if exists {
			parsedReqInfo = reqInfo.(request.RequestInfo)
		}

		return fmt.Sprintf("%s - [HTTP] TraceId: %s; UserId: %d; Method: %s; Path: %s; Status: %d, Latency: %s;\n\n",
			param.TimeStamp.Format(time.RFC1123),
			parsedReqInfo.TraceId,
			parsedReqInfo.UserId,
			param.Method,
			param.Path,
			param.StatusCode,
			param.Latency,
		)
	})
}

func bindBody(payload interface{}, c *gin.Context) error {
	err := c.BindJSON(payload)

	if err != nil {
		return errors.New(errors.BadRequestError)
	}

	return nil
}

func (s *Server) Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		if s.isNotNeedAuthentication(c.Request.RequestURI) {
			return
		}

		token := c.Request.Header.Get("Authorization")

		payload, err := s.VerifyAccessTokenPermission(token)
		if err != nil {
			response := errorResponse(err, nil, s.DetailedError())
			c.AbortWithStatusJSON(response.Status, response)
			return
		}

		setUserContext(c, payload)
	}
}

func (s *Server) isNotNeedAuthentication(path string) bool {
	data := map[string]bool{
		"/api/v1/one-gate/auth/login": true,
	}

	return data[path]
}

type response struct {
	Status  int         `json:"status"`
	Meta    interface{} `json:"meta,omitempty"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func okResponse(data interface{}) *response {
	return &response{
		Status:  http.StatusOK,
		Message: "ok",
		Data:    data,
	}
}

func okResponseWithoutData(message string) *response {
	return &response{
		Status:  http.StatusOK,
		Message: message,
		Data:    nil,
	}
}

// func okResponseComplete(message string, data interface{}, status int) *response {
// 	return &response{
// 		Status:  status,
// 		Data:    data,
// 		Message: message,
// 	}
// }

func searchResponse(meta interface{}, data interface{}) *response {
	return &response{
		Status:  http.StatusOK,
		Message: "ok",
		Meta:    meta,
		Data:    data,
	}
}

func internalErrorResponse(data interface{}) *response {
	status, message := http.StatusInternalServerError, "internal error"

	return &response{
		Status:  status,
		Message: message,
		Data:    data,
	}
}

func errorResponse(err error, data interface{}, withDetails bool) *response {
	status, message, details := parseError(err)

	if withDetails && details != "" {
		message = details
	}
	return &response{
		Status:  status,
		Message: message,
		Data:    data,
	}
}

func (r *response) reply(c *gin.Context) {
	c.JSON(r.Status, r)
}

func (s Server) Listen(address string) error {
	fmt.Printf("API server listening at: %s\n\n", address)
	return s.Run(address)
}
