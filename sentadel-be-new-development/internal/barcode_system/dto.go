package barcode_system

type CreateClientBarcodeRequest struct {
	AssigneeID int64 `json:"assignee_id"`
	ClientID   int64 `json:"client_id"`
	Quantity   int64 `json:"quantity"`
}

type ClientBarcodeRequestDto struct {
	Filter  map[string]string `form:"filter"`
	SortBy  []string          `form:"sortby"`
	Page    uint              `form:"page"`
	Limit   uint              `form:"limit"`
	Keyword string            `form:"keyword"`
	Mode    string            `form:"mode"`
}

type Meta struct {
	Page  int `json:"page"`
	Pages int `json:"pages"`
	Limit int `json:"limit"`
}

type ClientBarcodeGroupDataModel struct {
	Meta Meta                      `json:"meta"`
	List []ClientBarcodeGroupModel `json:"list"`
}
