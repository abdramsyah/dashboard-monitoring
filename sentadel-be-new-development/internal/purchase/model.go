package purchase

import (
	"sentadel-backend/internal/constants"
	"time"
)

type DeliveryStatusAccumModel struct {
	Valid             int64 `json:"VALIDATED"`
	WaitingToValidate int64 `json:"WAITING_TO_VALIDATE"`
	OnProgress        int64 `json:"ON_PROGRESS"`
	Weigh             int64 `json:"WEIGH"`
	Grade             int64 `json:"GRADE"`
	PourOut           int64 `json:"POUR_OUT"`
	Reject            int64 `json:"REJECT"`
	NotDelivered      int64 `json:"NOT_DELIVERED"`
}

type InvoiceLastStatusType struct {
	InvoiceID     int64                       `json:"invoice_id"`
	InvoiceNumber string                      `json:"invoice_number"`
	Status        constants.InvoiceStatusEnum `json:"status"`
	StatusDate    time.Time                   `json:"status_date"`
}

type DeliveryWithStatusAccumModel struct {
	DeliveryID           int64                    `json:"delivery_id"`
	DeliveryNumber       string                   `json:"delivery_number"`
	CoordinatorName      string                   `json:"coordinator_name"`
	ScheduledArrivalDate time.Time                `json:"scheduled_arrival_date"`
	DeliveryCreatedAt    time.Time                `json:"delivery_created_at"`
	TotalQueue           int64                    `json:"total_queue"`
	TotalBucket          int64                    `json:"total_bucket"`
	StatusAccum          DeliveryStatusAccumModel `json:"status_accum"`
	InvoiceList          []InvoiceLastStatusType  `json:"invoice_list"`
	Total                int64                    `json:"*"`
}

type DeliveryDetailModel struct {
	DeliveryNumber  string            `json:"delivery_number"`
	DeliveryID      int64             `json:"delivery_id"`
	CoordinatorName string            `json:"coordinator_name"`
	BucketQuantity  int64             `json:"bucket_quantity"`
	DeliveryDate    time.Time         `json:"delivery_date"`
	BucketList      []BucketDataModel `json:"bucket_list"`
}

type InvoiceDetailModel struct {
	InvoiceID          int64                `json:"invoice_id"`
	InvoiceNumber      string               `json:"invoice_number"`
	DeliveryNumber     string               `json:"delivery_number"`
	InvoiceDate        time.Time            `json:"invoice_date"`
	CoordinatorName    string               `json:"coordinator_name"`
	CoordinatorCode    string               `json:"coordinator_code"`
	BucketQuantity     int64                `json:"bucket_quantity"`
	PurchasePriceAccum int64                `json:"purchase_price_accum"`
	BucketList         []BucketDataModel    `json:"bucket_list"`
	LoanList           []LoanDataModel      `json:"loan_list"`
	RepaymentList      []RepaymentDataModel `json:"repayment_list"`
	InvoiceStatusList  []InvoiceStatusModel `json:"invoice_status_list"`
	TaxValue           float64              `json:"tax_value"`
	FeeValue           int64                `json:"fee_value"`
	TaxPrice           int64                `json:"tax_price"`
	FeePrice           int64                `json:"fee_price"`
	RepaymentAccum     *int64               `json:"repayment_accum,omitempty"`
	InvoicedBy         string               `json:"invoiced_by,omitempty"`
	Total              int64                `json:"*"`
}

type BucketDataModel struct {
	BucketID                int64                `json:"bucket_id"`
	GoodsID                 *int64               `json:"goods_id"`
	PartnerID               *int64               `json:"partner_id"`
	CoordinatorName         string               `json:"coordinator_name,omitempty"`
	FarmerName              string               `json:"farmer_name"`
	ProductType             string               `json:"product_type"`
	SerialNumber            string               `json:"serial_number"`
	GradeInfoID             *int64               `json:"grade_info_id"`
	SalesCode               *string              `json:"sales_code"`
	ClientName              *string              `json:"client_name"`
	ClientCompany           *string              `json:"client_company"`
	ClientCode              *string              `json:"client_code"`
	Grade                   *string              `json:"grade"`
	UnitPrice               *int64               `json:"unit_price"`
	GradePrice              *int64               `json:"grade_price"`
	WeightInfoID            *int64               `json:"weight_info_id"`
	GrossWeight             *int64               `json:"gross_weight"`
	PurchaseID              *int64               `json:"purchase_id"`
	PurchaseGradeInfoID     *int64               `json:"purchase_grade_info_id"`
	PurchaseSalesCode       *string              `json:"purchase_sales_code"`
	PurchaseClientName      *string              `json:"purchase_client_name"`
	PurchaseClientCompany   *string              `json:"purchase_client_company"`
	PurchaseClientCode      *string              `json:"purchase_client_code"`
	PurchaseGrade           *string              `json:"purchase_grade"`
	PurchaseUnitPrice       *int64               `json:"purchase_unit_price"`
	PurchaseGradePrice      *int64               `json:"purchase_grade_price"`
	PurchaseGrossWeight     *int64               `json:"purchase_gross_weight"`
	PurchaseNetWeight       *int64               `json:"purchase_net_weight"`
	GradeInformationExclID  []int64              `json:"grade_information_excl_id,omitempty"`
	WeightInformationExclID []int64              `json:"weight_information_excl_id,omitempty"`
	Status                  string               `json:"status,omitempty"`
	GoodsDate               *time.Time           `json:"goods_date,omitempty"`
	PurchaseDate            *time.Time           `json:"purchase_date,omitempty"`
	InvoiceID               *int64               `json:"invoice_id,omitempty"`
	InvoiceNumber           *string              `json:"invoice_number,omitempty"`
	PurchasePrice           *int64               `json:"purchase_price,omitempty"`
	StatusList              []InvoiceStatusModel `json:"status_list,omitempty"`
	LatestStatus            string               `json:"latest_status,omitempty"`
	LatestStatusAt          *time.Time           `json:"latest_status_at,omitempty"`
	Total                   int64                `json:"*"`
}

type LoanDataModel struct {
	LoanID             int64                       `json:"loan_id"`
	ReferenceName      string                      `json:"reference_name"`
	LoanCode           string                      `json:"loan_code"`
	LoanPrincipal      int64                       `json:"loan_principal"`
	LoanTotal          int64                       `json:"loan_total"`
	ReferenceType      constants.LoanReferenceEnum `json:"reference_type"`
	ReferenceID        int64                       `json:"reference_id"`
	PurchasePriceAccum int64                       `json:"purchase_price_accum"`
	RepaymentAccum     int64                       `json:"repayment_accum"`
	QuantityBucket     int64                       `json:"quantity_bucket"`
}

type RepaymentDataModel struct {
	LoanID        int64  `json:"loan_id"`
	LoanCode      string `json:"loan_code"`
	ReferenceName string `json:"reference_name"`
	Value         int64  `json:"value"`
}

type InvoiceStatusModel struct {
	Status     constants.InvoiceStatusEnum `json:"status,omitempty"`
	StatusDate time.Time                   `json:"status_date,omitempty"`
}

type GoodsDataModel struct {
	PurchaseID   *int64 `json:"purchase_id"`
	GoodsID      int64  `json:"goods_id"`
	GradeInfoID  int64  `json:"grade_info_id"`
	WeightInfoID int64  `json:"weight_info_id"`
}

type ManagePurchaseModel struct {
	DeliveryNumber string           `json:"delivery_number"`
	DeliveryID     int64            `json:"delivery_id"`
	Valid          []GoodsDataModel `json:"valid"`
	Invoiced       []GoodsDataModel `json:"invoiced"`
}

func NewManagePurchaseModel(dto ValidatePurchaseDto) (model ManagePurchaseModel) {
	for _, goods := range dto.GoodsList {
		if goods.PurchaseID != nil {
			model.Invoiced = append(model.Invoiced, goods)
		} else {
			model.Valid = append(model.Valid, goods)
		}
	}

	model.DeliveryID = dto.DeliveryID
	model.DeliveryNumber = dto.DeliveryNumber

	return model
}
