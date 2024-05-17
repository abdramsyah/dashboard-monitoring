package constants

// Context
const (
	ContextRequestID string = "requestId"
)

type ReqInfoKeyType = string

const (
	ReqInfoKey ReqInfoKeyType = "request-info"
)

type ProductType string

const (
	Kemitraan ProductType = "Kemitraan"
	Lokal     ProductType = "Lokal"
	Dagang    ProductType = "Dagang"
)

type QueueDetailGroupBy string

const (
	Invoice QueueDetailGroupBy = "INVOICE"
	Farmer  QueueDetailGroupBy = "FARMER"
	Product QueueDetailGroupBy = "PRODUCT"
)

type PriceCalculatorMode string

const (
	UPDATE_FINAL_GOODS      PriceCalculatorMode = "UPDATE_FINAL_GOODS"
	CREATE_AND_UPDATE_GOODS PriceCalculatorMode = "CREATE_AND_UPDATE_GOODS"
	CREATE_WEIGHT           PriceCalculatorMode = "CREATE_WEIGHT"
)

type CompanyEnum string

const (
	LAMPION CompanyEnum = "LAMPION"
	TALENTA CompanyEnum = "TALENTA"
)

type PlatformEnum string

const (
	Mobile PlatformEnum = "Mobile"
	Web    PlatformEnum = "WEB"
)
