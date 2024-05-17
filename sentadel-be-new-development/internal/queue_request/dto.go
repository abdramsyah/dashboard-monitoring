package queuerequest

import (
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/coordinator"
	"sentadel-backend/internal/user"
	"strings"
	"time"
)

type QueueRequestDto struct {
	RequestQuantity int64                 `json:"request_quantity"`
	FarmerName      string                `json:"farmer"`
	PartnerID       *int64                `json:"partner_id"`
	ProductType     constants.ProductType `json:"product_type"`
}

type QueueRequestDataDto struct {
	Queues              []QueueRequestDto              `json:"queues"`
	IsNotMember         *bool                          `json:"is_not_member"`
	CoordinatorID       *int64                         `json:"coordinator_id"`
	CoordinatorUserData coordinator.CoordinatorUserDto `json:"coordinator_user_data"`
}

func (dto QueueRequestDto) MapToModel(userId int64) (QueueRequestModel, error) {
	return NewQueueRequestModel(dto, userId)
}

type QueueIdsDto struct {
	QueueIds []int64 `json:"queue_ids"`
}

type UpdateStatusQueueDto struct {
	QueueData            []QueueRequestModel `json:"queue_data"`
	QueueDeliveryID      *int64              `json:"queue_delivery_id"`
	CoordinatorID        *int64              `json:"coordinator_id"`
	CoordinatorCode      *string             `json:"coordinator_code"`
	ScheduledArrivalDate *string             `json:"scheduled_arrival_date"`
	AccumBucket          *int64              `json:"accum_bucket"`
}

func (dto UpdateStatusQueueDto) MapToModel() (UpdateStatusQueueModel, error) {
	return NewUpdateStatusQueueModel(dto)
}

type QueueResponse struct {
	Id              int64                  `json:"id"`
	QueueSuppliesID int64                  `json:"queue_supplies_id"`
	NumberID        string                 `json:"number_id"`
	CoordinatorID   int64                  `json:"coordinator_id"`
	CoordinatorName string                 `json:"coordinator_name"`
	CoordinatorCode string                 `json:"coordinator_code"`
	FarmerName      string                 `json:"farmer_name"`
	ProductType     constants.ProductType  `json:"product_type"`
	RequestQuantity int64                  `json:"request_quantity"`
	CreatedAt       time.Time              `json:"request_date"`
	Status          constants.SupplyStatus `json:"status"`
	StatusDate      *time.Time             `json:"status_date"`
	Total           int64                  `json:"-"`
}

type QueueRequestBarcodeResponse struct {
	Id              int64                  `json:"id"`
	BarcodeID       int64                  `json:"barcode_id"`
	FarmerName      string                 `json:"farmer_name"`
	ProductType     constants.ProductType  `json:"product_type"`
	RequestQuantity int64                  `json:"request_quantity"`
	Status          constants.SupplyStatus `json:"status"`
	CoordinatorID   string                 `json:"coordinator_id"`
	CoordinatorName string                 `json:"coordinator_name"`
	DateIn          *time.Time             `json:"date_in"`
	CreatedAt       time.Time              `json:"request_date"`
	UpdatedAt       time.Time              `json:"updated_at"`
	BarcodeData     []string               `json:"barcode_data"`
	Total           int64                  `json:"-"`
}

type QueueListResponse struct {
	List []QueueResponse `json:"queuerequest"`
	Meta user.Meta       `json:"meta"`
}

type QueueGroupResponse struct {
	List []QueueGroupModel `json:"queue_group"`
	Meta user.Meta         `json:"meta"`
}

type BucketInformationResponse struct {
	List []BucketInformationModel `json:"list"`
}

type QueueRequestStatus struct {
	Status          constants.SupplyStatus `json:"status"`
	CoordinatorID   int64                  `json:"coordinator_id"`
	Code            string                 `json:"code"`
	RequestQuantity int64                  `json:"request_quantity"`
}

type QueueRequestListDto struct {
	ClientID    uint              `form:"client_id"`
	UserID      int64             `form:"user_id"`
	Filter      map[string]string `form:"filter"`
	SortBy      []string          `form:"sortby"`
	Page        uint              `form:"page"`
	Limit       uint              `form:"limit"`
	Keyword     string            `form:"keyword"`
	CurrentDate string            `form:"current_date"`
	Mode        string            `form:"mode"`
}

type QueueGroupDetailDto struct {
	CoordinatorID  int64                        `form:"coordinator_id"`
	DeliveryNumber string                       `form:"delivery_number"`
	GroupBy        constants.QueueDetailGroupBy `form:"group_by"`
	Code           string                       `form:"keyword"`
}

type CoordinatorDropdownResponse struct {
	CoordinatorID   int64  `json:"coordinator_id"`
	CoordinatorName string `json:"coordinator_name"`
}

type QueueDeliveryDataModel struct {
	QueueDeliveryModel
	List []BucketInformationModel `json:"bucket_list"`
}

func createDeliveryNumber(CoordinatorCode string, ScheduledArrivalDate time.Time) string {
	return "DO-" + strings.ToUpper(CoordinatorCode) + ScheduledArrivalDate.Format("060102")
}
