package tax_and_fee

import (
	"time"
)

type TaxModel struct {
	ID         int64      `json:"id"`
	TaxType    string     `json:"tax_type"`
	Tax        float32    `json:"tax"`
	ActiveFrom time.Time  `json:"active_from"`
	ActiveTo   *time.Time `json:"active_to"`
	Total      int64      `json:"-"`
}

type FeeModel struct {
	ID         int64      `json:"id"`
	FeeLabel   string     `json:"fee_label"`
	Fee        int64      `json:"fee"`
	ActiveFrom time.Time  `json:"active_from"`
	ActiveTo   *time.Time `json:"active_to"`
	Total      int64      `json:"-"`
}
