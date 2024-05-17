package purchase

import (
	"sentadel-backend/internal/operational"
	"sentadel-backend/internal/user"
)

type ParamsDto struct {
	Filter  map[string]string `form:"filter"`
	SortBy  map[string]string `form:"sortby"`
	Page    uint              `form:"page"`
	Limit   uint              `form:"limit"`
	Keyword string            `form:"keyword"`
}

type ValidatePurchaseDto struct {
	DeliveryNumber string           `json:"delivery_number"`
	DeliveryID     int64            `json:"delivery_id"`
	GoodsList      []GoodsDataModel `json:"goods_list"`
}

func (dto ValidatePurchaseDto) MapToManagePurchaseModel() ManagePurchaseModel {
	return NewManagePurchaseModel(dto)
}

type DeliveryWithStatusAccumDataModel struct {
	List []DeliveryWithStatusAccumModel `json:"list"`
	Meta user.Meta                      `json:"meta"`
}

type InvoiceListDataModel struct {
	List []InvoiceDetailModel `json:"list"`
	Meta user.Meta            `json:"meta"`
}

type PendingValidationModel struct {
	List []operational.GetGoodsModel `json:"list"`
	Meta user.Meta                   `json:"meta"`
}
