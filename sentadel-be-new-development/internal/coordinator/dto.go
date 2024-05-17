package coordinator

import (
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/user"
	"time"
)

type CoordinatorDto struct {
	ID     int64  `json:"id"`
	UserID int64  `json:"user_id"`
	Quota  int64  `json:"quota"`
	Code   string `json:"code"`
}

type CoordinatorUserDto struct {
	UserParam        user.AddUserDto `json:"user_param"`
	CoordinatorParam CoordinatorDto  `json:"coordinator_param"`
}

type QueueRequestResponse struct {
	ID              int64                 `json:"id"`
	RequestQuantity float64               `json:"request_quantity"`
	FarmerName      string                `json:"farmer"`
	ProductType     constants.ProductType `json:"product_type"`
	CreatedAt       time.Time             `json:"created_at"`
	UpdatedAt       time.Time             `json:"updated_at"`
}

func (dto CoordinatorDto) MapToModel() (CoordinatorModel, error) {
	return NewCoordinatorModel(dto)
}

type CoordinatorGroupResponse struct {
	ID            int64     `json:"id"`
	GroupName     string    `json:"group_name"`
	PurchasePrice *float64  `json:"purchase_price"`
	NetPercentage int       `json:"net_percentage"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
type CoordinatorResponse struct {
	ID                int64      `json:"id"`
	UserID            int64      `json:"user_id"`
	CoordinatorNumber string     `json:"coordinator_number"`
	Quota             int64      `json:"quota"`
	Code              string     `json:"code"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	DeletedAt         *time.Time `json:"deleted_at"`
}

type CoordinatorListDto struct {
	Filter []string `form:"filter"`
	SortBy []string `form:"sortby"`
	Page   uint     `form:"page"`
	Limit  uint     `form:"limit"`
}

type CoordinatorListResponse struct {
	List []CoordinatorModel `json:"coordinators"`
	Meta user.Meta          `json:"meta"`
}

type CoordinatorDropdownListResponse struct {
	List []CoordinatorDropdown `json:"coordinators"`
}

type CoordinatorPerformanceResponse struct {
	List []CoordinatorPerformance `json:"coordinator_performances"`
	Meta user.Meta                `json:"meta"`
}
