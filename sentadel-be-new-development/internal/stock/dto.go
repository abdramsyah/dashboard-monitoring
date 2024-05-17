package stock

type ParamsDto struct {
	Filter  map[string]string `form:"filter"`
	SortBy  map[string]string `form:"sortby"`
	Page    uint              `form:"page"`
	Limit   uint              `form:"limit"`
	Keyword string            `form:"keyword"`
}

type GetStockListDto struct {
	Page           uint   `form:"page"`
	Limit          uint   `form:"limit"`
	Keyword        string `form:"keyword"`
	GoodsStatus    string `form:"goods_status"`
	InvoiceStatus  string `form:"invoice_status"`
	GoodsDate      string `form:"goods_date"`
	PurchaseDate   string `form:"purchase_date"`
	GoodsDateTo    string `form:"goods_date_to"`
	PurchaseDateTo string `form:"purchase_date_to"`
	ClientCode     string `form:"client_code"`
	SortBy         string `form:"sort_by"`
}
