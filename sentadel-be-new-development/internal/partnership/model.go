package partnership

import (
	validation "github.com/go-ozzo/ozzo-validation"
	"sentadel-backend/internal/base/errors"
)

type ManagePartnerRequestModel struct {
	PartnerID     int64  `json:"partner_id"`
	Name          string `json:"name"`
	Quota         int64  `json:"quota"`
	CoordinatorID int64  `json:"coordinator_id"`
}

func NewAddNewPartnerRequestModel(dto ManagePartnerRequestDto) (ManagePartnerRequestModel, error) {
	model := ManagePartnerRequestModel{
		Name:          dto.Name,
		Quota:         dto.Quota,
		CoordinatorID: dto.CoordinatorID,
	}

	if err := model.Validate(); err != nil {
		return ManagePartnerRequestModel{}, err
	}

	return model, nil
}

func NewUpdatePartnerRequestModel(dto ManagePartnerRequestDto) (ManagePartnerRequestModel, error) {
	model := ManagePartnerRequestModel{
		PartnerID:     dto.PartnerID,
		Name:          dto.Name,
		Quota:         dto.Quota,
		CoordinatorID: dto.CoordinatorID,
	}

	if err := model.Update(); err != nil {
		return ManagePartnerRequestModel{}, err
	}

	return model, nil
}

func (psm *ManagePartnerRequestModel) Validate() error {
	err := validation.ValidateStruct(psm,
		validation.Field(&psm.Name, validation.Required),
		validation.Field(&psm.Quota, validation.Required),
		validation.Field(&psm.CoordinatorID, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

func (psm *ManagePartnerRequestModel) Update() error {
	err := validation.ValidateStruct(psm,
		validation.Field(&psm.PartnerID, validation.Required),
		validation.Field(&psm.Name, validation.Required),
		validation.Field(&psm.Quota, validation.Required),
		validation.Field(&psm.CoordinatorID, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

type PartnerModel struct {
	PartnerID       int64  `json:"partner_id"`
	PartnerName     string `json:"partner_name"`
	PartnerQuota    int64  `json:"partner_quota"`
	CoordinatorID   int64  `json:"coordinator_id"`
	CoordinatorName string `json:"coordinator_name,omitempty"`
	CoordinatorCode string `json:"coordinator_code,omitempty"`
	Total           int64  `json:"*,omitempty"`
}

type GroupedPartnerListModel struct {
	CoordinatorID   int64          `json:"coordinator_id"`
	CoordinatorName string         `json:"coordinator_name"`
	CoordinatorCode string         `json:"coordinator_code"`
	PartnerData     []PartnerModel `json:"partner_data"`
	Total           int64          `json:"*,omitempty"`
}

type Meta struct {
	Page  int `json:"page"`
	Pages int `json:"pages"`
	Limit int `json:"limit"`
}

type GroupedPartnersDataModel struct {
	Meta Meta                      `json:"meta"`
	List []GroupedPartnerListModel `json:"list"`
}

type PartnersDataModel struct {
	Meta Meta           `json:"meta"`
	List []PartnerModel `json:"list"`
}
