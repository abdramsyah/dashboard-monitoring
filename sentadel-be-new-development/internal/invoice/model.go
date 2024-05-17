package invoice

import (
	"sentadel-backend/internal/base/errors"

	validation "github.com/go-ozzo/ozzo-validation"
)

type ManageInvoiceStatusModel struct {
	InvoiceID int64  `json:"invoice_id"`
	Status    string `json:"status"`
}

func NewManageInvoiceStatusModel(dto ManageInvoiceStatusDto) (ManageInvoiceStatusModel, error) {
	model := ManageInvoiceStatusModel{
		InvoiceID: dto.InvoiceID,
		Status:    dto.Status,
	}

	if err := model.Validate(); err != nil {
		return ManageInvoiceStatusModel{}, err
	}

	return model, nil
}

func (gqm *ManageInvoiceStatusModel) Validate() error {
	err := validation.ValidateStruct(gqm,
		validation.Field(&gqm.InvoiceID, validation.Required),
		validation.Field(&gqm.Status, validation.In(
			"APPROVED", "REJECTED", "PRINTED", "CONFIRMED_BY_COORDINATOR")),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}
