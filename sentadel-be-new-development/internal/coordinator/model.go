package coordinator

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/user"
	"time"

	validation "github.com/go-ozzo/ozzo-validation"
)

type CoordinatorModel struct {
	ID                int64      `json:"id"`
	UserID            int64      `json:"user_id"`
	CoordinatorNumber string     `json:"coordinator_number"`
	Name              string     `json:"name"`
	Quota             int64      `json:"quota"`
	Code              string     `json:"code"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	DeletedAt         *time.Time `json:"deleted_at"`
	Total             int64      `json:"-"`
}

type CoordinatorPerformance struct {
	CoordinatorID   int64  `json:"coordinator_id"`
	CoordinatorName string `json:"coordinator_name"`
	OutputAccuracy  string `json:"output_accuracy"`
	SupplyAccuracy  string `json:"supply_accuracy"`
	Total           int64  `json:"-"`
}

type CoordinatorDropdown struct {
	CoordinatorID   int64  `json:"coordinator_id,omitempty"`
	CoordinatorName string `json:"coordinator_name,omitempty"`
	Total           int64  `json:"-"`
}

type GoodsHistoryModel struct {
	ID               int64                 `json:"id"`
	Date             *time.Time            `json:"date"`
	FarmerName       string                `json:"farmer_name"`
	CompanyBarcode   string                `json:"company_barcode"`
	ProductType      constants.ProductType `json:"product_type"`
	StringLastStatus string                `json:"string_last_status,omitempty"`
	LastStatus       string                `json:"last_status"`
	LastUpdate       string                `json:"last_update"`
	Total            int64                 `json:"-"`
	//BarcodeData      []barcode_system.BarcodeGroupDataModel `json:"barcode_data"`
}

type GoodsHistoryListResponse struct {
	List []GoodsHistoryModel `json:"data"`
	Meta user.Meta           `json:"meta"`
}

func NewCoordinatorModel(dto CoordinatorDto) (CoordinatorModel, error) {
	model := CoordinatorModel{
		UserID: dto.UserID,
		Code:   dto.Code,
		Quota:  dto.Quota,
	}

	if err := model.Validate(); err != nil {
		return CoordinatorModel{}, err
	}

	return model, nil
}

func (n *CoordinatorModel) Validate() error {
	err := validation.ValidateStruct(n,
		validation.Field(&n.UserID, validation.Required),
		validation.Field(&n.Quota, validation.Required),
		validation.Field(&n.Code, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}
