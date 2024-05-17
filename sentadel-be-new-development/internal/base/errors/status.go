package errors

type Status string

const (
	BadRequestError             Status = "BadRequestError"
	InternalError               Status = "InternalError"
	ValidationError             Status = "ValidationError"
	InvalidDataError            Status = "InvalidDataError"
	DatabaseError               Status = "DatabaseError"
	UserNotActiveError          Status = "UserNotActiveError"
	NotFoundError               Status = "NotFoundError"
	AlreadyExistsError          Status = "AlreadyExistsError"
	WrongCredentialsError       Status = "WrongCredentialsError"
	UnauthorizedError           Status = "UnauthorizedError"
	NullRequestParams           Status = "NullRequestParams"
	RequestDataNotValid         Status = "RequestDataNotValid"
	CantLoginUsingThisUser      Status = "CantLoginUsingThisUser"
	UserRolesCanLoginIntoMobile Status = "UserRolesCanLoginIntoMobile"
	ParsingParamError           Status = "ParsingParamError"
	ErrorWithData               Status = "ErrorWithData"
)

func (s Status) Message() string {
	switch s {
	case BadRequestError:
		return "bad request error"
	case InternalError:
		return "internal error"
	case ValidationError:
		return "validation error"
	case InvalidDataError:
		return "Invalid Data"
	case DatabaseError:
		return "database error"
	case NotFoundError:
		return "not found error"
	case AlreadyExistsError:
		return "already exists error"
	case WrongCredentialsError:
		return "wrong credentials error"
	case UnauthorizedError:
		return "unauthorized error"
	default:
		return "internal error"
	}
}
