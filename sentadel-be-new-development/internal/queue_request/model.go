package queuerequest

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/models"
	"sentadel-backend/internal/purchase"
	"time"

	validation "github.com/go-ozzo/ozzo-validation"
)

type SearchQueueModel struct {
	models.SearchRequest
	CoordinatorID int64 `form:"coordinator_id"`
}

type QueueRequestModel struct {
	ID              int64                  `db:"id" json:"id"`
	FarmerName      string                 `db:"farmer_name" json:"farmer_name"`
	ProductType     constants.ProductType  `db:"product_type" json:"product_type"`
	RequestQuantity int64                  `db:"quantity_bucket" json:"request_quantity"`
	PartnerID       *int64                 `db:"partner_id" json:"partner_id"`
	Status          constants.SupplyStatus `db:"status" json:"status"`
	IsPrinted       bool                   `db:"is_printed" json:"is_printed"`
	CoordinatorID   int64                  `db:"coordinator_id" json:"coordinator_id"`
	CreatedAt       time.Time              `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time              `db:"updated_at" json:"updated_at"`
	DeletedAt       time.Time              `db:"deleted_at" json:"deleted_at"`
}

type UpdateStatusQueueModel struct {
	QueueData            []QueueRequestModel `json:"queue_data"`
	AccumBucket          int64               `json:"accum_bucket"`
	QueueDeliveryID      *int64              `json:"queue_delivery_id"`
	CoordinatorID        int64               `json:"coordinator_id"`
	CoordinatorCode      string              `json:"coordinator_code"`
	ScheduledArrivalDate time.Time           `json:"scheduled_arrival_date"`
}

type QueueModel struct {
	ID              int64                  `json:"queue_id"`
	QueueDeliveryID int64                  `json:"queue_delivery_id"`
	DeliveryNumber  string                 `json:"delivery_number"`
	FarmerName      string                 `json:"farmer_name"`
	ProductType     string                 `json:"product_type"`
	SerialCodes     []string               `json:"serial_codes"`
	QuantityBucket  int64                  `json:"quantity_bucket"`
	CreatedAt       time.Time              `json:"created_at"`
	Status          constants.SupplyStatus `json:"status"`
	StatusDate      time.Time              `json:"status_date"`
	PrintedAt       *time.Time             `json:"printed_at"`
	PrintedBy       *string                `json:"printed_by"`
}

type QueueGroupModel struct {
	CoordinatorName      string                 `json:"coordinator_name"`
	CoordinatorCode      string                 `json:"coordinator_code"`
	DeliveryID           *int64                 `json:"delivery_id"`
	DeliveryNumber       *string                `json:"delivery_number"`
	QueueData            []QueueModel           `json:"queue_data"`
	TotalBucket          int64                  `json:"quantity_bucket"`
	AccumBucket          int64                  `json:"accum_bucket"`
	LastCreatedAt        time.Time              `json:"last_created_at"`
	Status               constants.SupplyStatus `json:"status"`
	ScheduledArrivalDate *time.Time             `json:"scheduled_arrival_date"`
	Total                int64                  `json:"-"`
}

type QueueDetailModel struct {
	BucketID            int64                         `json:"bucket_id"`
	FarmerName          string                        `json:"farmer_name"`
	ProductType         constants.ProductType         `json:"product_type"`
	SerialNumber        string                        `json:"serial_number"`
	GrossWeight         int64                         `json:"gross_weight"`
	PurchaseGrossWeight int64                         `json:"purchase_gross_weight"`
	PurchaseNetWeight   int64                         `json:"purchase_net_weight"`
	PurchasePrice       int64                         `json:"purchase_price"`
	InvoiceNumber       string                        `json:"invoice_number"`
	StatusList          []purchase.InvoiceStatusModel `json:"status_list"`
	Status              string                        `json:"status"`
	UnitPrice           *int64                        `json:"unit_price"`
}

type QueueGroupDetailModel struct {
	DeliveryID         int64              `json:"delivery_id"`
	DeliveryNumber     *string            `json:"delivery_number"`
	FilterParam        *string            `json:"filter_param"`
	QueueData          []QueueDetailModel `json:"queue_data"`
	PurchasePriceAccum int64              `json:"purchase_price_accum"`
}

type QueueDeliveryModel struct {
	DeliveryID           int64     `json:"delivery_id"`
	DeliveryNumber       int64     `json:"delivery_number"`
	CoordinatorName      string    `json:"coordinator_name"`
	QueueIds             []int64   `json:"queue_ids"`
	QuantityBucket       int64     `json:"quantity_bucket"`
	ScheduledArrivalDate time.Time `json:"scheduled_arrival_date"`
	CreatedAt            time.Time `json:"created_at"`
}

type BucketInformationModel struct {
	BucketID           int64     `json:"bucket_id"`
	SerialNumber       string    `json:"serial_number"`
	FarmerName         string    `json:"farmer_name"`
	ProductType        string    `json:"product_type"`
	GoodsID            int64     `json:"goods_id,omitempty"`
	GoodsCode          string    `json:"goods_code,omitempty"`
	Grade              string    `json:"grade,omitempty"`
	GradePrice         int64     `json:"grade_price,omitempty"`
	PreserveGradePrice int64     `json:"preserve_grade_price,omitempty"`
	Grader             string    `json:"grader,omitempty"`
	UnitPrice          int64     `json:"unit_price,omitempty"`
	AdminGrade         string    `json:"admin_grade,omitempty"`
	GrossWeight        int64     `json:"gross_weight,omitempty"`
	AdminWeight        string    `json:"admin_weight,omitempty"`
	QueueDate          time.Time `json:"QueueDate,omitempty"`
}

type CreateGoodsResModel struct {
	GoodsID         *int64               `json:"goods_id"`
	BucketID        int64                `json:"bucket_id"`
	SerialNumber    string               `json:"serial_number"`
	CurrentStatus   constants.ScanStatus `json:"current_status"`
	Status          constants.ScanStatus `json:"status"`
	TransactionDate *time.Time           `json:"transaction_date"`
}

type CreateGoodsReqModel struct {
	Data []CreateGoodsResModel `json:"data"`
}

type BucketScanModel struct {
	BucketID        int64                 `json:"bucket_id"`
	SerialNumber    string                `json:"serial_number"`
	CoordinatorName string                `json:"coordinator_name"`
	FarmerName      string                `json:"farmer_name"`
	ProductType     string                `json:"product_type"`
	ScanStatus      *constants.ScanStatus `json:"scan_status,omitempty"`
	ScannedAt       *time.Time            `json:"scanned_at,omitempty"`
}

func NewQueueRequestModel(dto QueueRequestDto, userId int64) (QueueRequestModel, error) {
	model := QueueRequestModel{
		FarmerName:      dto.FarmerName,
		PartnerID:       dto.PartnerID,
		ProductType:     dto.ProductType,
		RequestQuantity: dto.RequestQuantity,
		CoordinatorID:   userId,
		Status:          constants.OnProgress,
	}

	if err := model.Validate(); err != nil {
		return QueueRequestModel{}, err
	}

	return model, nil
}

func NewUpdateStatusQueueModel(dto UpdateStatusQueueDto) (UpdateStatusQueueModel, error) {

	var (
		CoordinatorID   int64
		CoordinatorCode string
		AccumBucket     int64
		date            time.Time
	)

	if dto.ScheduledArrivalDate != nil {
		parsedDate, err := time.Parse("2006-01-02", *dto.ScheduledArrivalDate)
		if err != nil {
			return UpdateStatusQueueModel{}, errors.New(errors.BadRequestError)
		}
		date = parsedDate
	}

	if dto.CoordinatorID != nil {
		CoordinatorID = *dto.CoordinatorID
	}

	if dto.CoordinatorCode != nil {
		CoordinatorCode = *dto.CoordinatorCode
	}

	if dto.AccumBucket != nil {
		AccumBucket = *dto.AccumBucket
	}

	model := UpdateStatusQueueModel{
		QueueData:            dto.QueueData,
		QueueDeliveryID:      dto.QueueDeliveryID,
		CoordinatorID:        CoordinatorID,
		CoordinatorCode:      CoordinatorCode,
		ScheduledArrivalDate: date,
		AccumBucket:          AccumBucket,
	}

	if err := model.Validate(); err != nil {
		return UpdateStatusQueueModel{}, err
	}

	return model, nil
}

func (n *UpdateStatusQueueModel) Validate() error {
	err := validation.ValidateStruct(n,
		validation.Field(&n.QueueData, validation.Required),
		//validation.Field(&n.QueueDeliveryID),
		//validation.Field(&n.CoordinatorID),
		//validation.Field(&n.CoordinatorCode),
		//validation.Field(&n.ScheduledArrivalDate),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

func ParseBucketScanModel(model BucketScanModel, status constants.ScanStatus) BucketScanModel {
	return BucketScanModel{
		BucketID:     model.BucketID,
		SerialNumber: model.SerialNumber,
		ScanStatus:   &status,
	}
}

func (n *QueueRequestModel) Validate() error {
	err := validation.ValidateStruct(n,
		validation.Field(&n.FarmerName, validation.Required),
		validation.Field(&n.ProductType, validation.Required),
		validation.Field(&n.RequestQuantity, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}
