package supply_power_management

type PowerSupplyModel struct {
	ClientID        string `json:"client_id,omitempty"`
	ClientCode      string `json:"client_code,omitempty"`
	ClientName      string `json:"client_name,omitempty"`
	Quota           int64  `json:"quota,omitempty"`
	CompanyGrade    string `json:"company_grade,omitempty"`
	ClientGrade     string `json:"client_grade,omitempty"`
	SupplyFilled    int64  `json:"supply_filled"`
	RemainingSupply int64  `json:"remaining_supply,omitempty"`
	Total           int64  `json:"-"`
}

type PowerSupplySearchDto struct {
	//BarcodeID uint     `form:"barcode_id"`
	Filter  []string `form:"filter"`
	SortBy  []string `form:"sortby"`
	Page    uint     `form:"page"`
	Limit   uint     `form:"limit"`
	Keyword string   `form:"keyword"`
}
