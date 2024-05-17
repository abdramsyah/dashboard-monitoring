package http

const (
	OneGatePrefix = "/api/v1/one-gate/"
)

type HTTPHandler interface {
	AddRoutes(router *Server)
}
