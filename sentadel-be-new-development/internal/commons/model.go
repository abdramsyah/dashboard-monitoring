package commons

import "github.com/doug-martin/goqu/v9"

type ExistingIDModel struct {
	ResID []int64         `json:"res_id"`
	MapID map[string]bool `json:"map_id"`
}

type WhereArgModel struct {
	Column string  `json:"column"`
	Arg    goqu.Op `json:"arg"`
}

type WeightParamsModel struct {
	GoodsID     int64 `json:"goods_id"`
	GrossWeight int64 `json:"gross_weight"`
}

type PriceCalculatorParamsModel struct {
	GoodsID     int64 `json:"goods_id"`
	GradeID     int64 `json:"grade_id"`
	ClientID    int64 `json:"client_id"`
	BarcodeID   int64 `json:"barcode_id"`
	UnitPrice   int64 `json:"unit_price"`
	Price       int64 `json:"grade_price"`
	GrossWeight int64 `json:"gross_weight"`
}
