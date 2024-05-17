package invoice

import (
	"sentadel-backend/internal/purchase"
	"sentadel-backend/internal/user"
)

type ParamsDto struct {
	Filter  map[string]string `form:"filter"`
	SortBy  map[string]string `form:"sortby"`
	Page    uint              `form:"page"`
	Limit   uint              `form:"limit"`
	Keyword string            `form:"keyword"`
}

type ManageInvoiceStatusDto struct {
	InvoiceID int64  `json:"invoice_id"`
	Status    string `json:"status"`
}

func (dto ManageInvoiceStatusDto) MapToManageInvoiceStatusModel() (ManageInvoiceStatusModel, error) {
	return NewManageInvoiceStatusModel(dto)
}

type InvoiceListDataModel struct {
	List []purchase.InvoiceDetailModel `json:"list"`
	Meta user.Meta                     `json:"meta"`
}
