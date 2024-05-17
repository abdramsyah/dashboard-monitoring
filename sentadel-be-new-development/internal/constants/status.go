package constants

type Status string

const (
	Active   Status = "ACTIVE"
	InActive Status = "INACTIVE"
)

type SupplyStatus string

const (
	OnProgress SupplyStatus = "ON_PROGRESS"
	Rejected   SupplyStatus = "REJECTED"
	Approved   SupplyStatus = "APPROVED"
	Paid       SupplyStatus = "PAID"
)

type GoodsSuppliesStatusEnum string

const (
	APPROVED_BY_PURCHASING   GoodsSuppliesStatusEnum = "APPROVED_BY_PURCHASING"
	REQUEST_AS_INVOICE       GoodsSuppliesStatusEnum = "REQUEST_AS_INVOICE"
	APPROVED_AS_INVOICE      GoodsSuppliesStatusEnum = "APPROVE_AS_INVOICE"
	DECLINE_AS_INVOICE       GoodsSuppliesStatusEnum = "DECLINE_AS_INVOICE"
	MARK_AS_PAID_ADMIN       GoodsSuppliesStatusEnum = "MARK_AS_PAID_ADMIN"
	MARK_AS_PAID_COORDINATOR GoodsSuppliesStatusEnum = "MARK_AS_PAID_COORDINATOR"
	MARK_AS_SHIPPED          GoodsSuppliesStatusEnum = "MARK_AS_SHIPPED"
	NULL                     GoodsSuppliesStatusEnum = "-"
)

type GoodsListStatusEnum string

const (
	ASE_GOODS              GoodsListStatusEnum = "ASE_GOODS"
	ASE_WEIGHT             GoodsListStatusEnum = "ASE_WEIGHT"
	AP                     GoodsListStatusEnum = "AP"
	REQUEST_PAYMENT        GoodsListStatusEnum = "REQUEST_PAYMENT"
	SALES_REQUEST_PAYMENT  GoodsListStatusEnum = "SALES_REQUEST_PAYMENT"
	INVOICE_LIST           GoodsListStatusEnum = "INVOICE_LIST"
	PAYMENT_REVISION       GoodsListStatusEnum = "PAYMENT_REVISION"
	PAYMENT_HISTORY        GoodsListStatusEnum = "PAYMENT_HISTORY"
	FINAL_GOODS_GROUPING   GoodsListStatusEnum = "FINAL_GOODS_GROUPING"
	FINAL_GOODS_INVOICE    GoodsListStatusEnum = "FINAL_GOODS_INVOICE"
	FINAL_GOODS_PURCHASING GoodsListStatusEnum = "FINAL_GOODS_PURCHASING"
	APPROVED_PURCHASING    GoodsListStatusEnum = "APPROVED_PURCHASING"
)

type ScanStatus string

const (
	ScanAlreadyApproved ScanStatus = "ALREADY_APPROVED"
	ScanAlreadyRejected ScanStatus = "ALREADY_REJECTED"
	ScanExpired         ScanStatus = "EXPIRED"
	ScanApproved        ScanStatus = "APPROVED"
	ScanRejected        ScanStatus = "REJECTED"
	ScanToApprove       ScanStatus = "APPROVE"
	ScanToReject        ScanStatus = "REJECT"
)

type HarboringMethod string

const (
	HB_POST   HarboringMethod = "POST"
	HB_PUT    HarboringMethod = "PUT"
	HB_DELETE HarboringMethod = "DELETE"
)

type GoodsStatusEnum string

const (
	ApprovedGoods      GoodsStatusEnum = "APPROVED"
	RejectedSample     GoodsStatusEnum = "REJECTED_SAMPLE"
	RejectedInspection GoodsStatusEnum = "REJECTED_INSPECTION"
)

type PrintListEnum string

const (
	PrintQueue     PrintListEnum = "QUEUE"
	PrintInvoice   PrintListEnum = "INVOICE"
	PrintTravelDoc PrintListEnum = "TRAVEL_DOC"
)

type GradingQueueDataStatus string

const (
	GradingSuccess    GradingQueueDataStatus = "SUCCESS"
	GradingFailed     GradingQueueDataStatus = "FAILED"
	GradingOnProgress GradingQueueDataStatus = "ON_PROGRESS"
	GradingCreated    GradingQueueDataStatus = "CREATED"
	GradingValidated  GradingQueueDataStatus = "VALIDATED"
	GradingUsed       GradingQueueDataStatus = "USED"
)

type LoanReferenceEnum string

const (
	LoanCoordinator LoanReferenceEnum = "COORDINATOR"
	LoanPartner     LoanReferenceEnum = "PARTNER"
)

type InvoiceStatusEnum string

const (
	InvoiceApproved               = "APPROVED"
	InvoiceRejected               = "REJECTED"
	InvoicePrinted                = "PRINTED"
	InvoiceConfirmedByCoordinator = "CONFIRMED_BY_COORDINATOR"
)
