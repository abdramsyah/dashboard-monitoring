package tax_and_fee

import (
	"sentadel-backend/internal/user"
)

type NewTaxReqParams struct {
	TaxType  string  `json:"type"`
	TaxValue float32 `json:"value"`
}

type NewFeeReqParams struct {
	FeeLabel string `json:"type"`
	FeeValue int64  `json:"value"`
}

type TaxListResponse struct {
	List []TaxModel `json:"tax"`
	Meta user.Meta  `json:"meta"`
}

type FeeListResponse struct {
	List []FeeModel `json:"tax"`
	Meta user.Meta  `json:"meta"`
}
