package sales

type GroupingListDto struct {
	Filter  map[string]string `form:"filter"`
	SortBy  map[string]string `form:"sortby"`
	Page    uint              `form:"page"`
	Limit   uint              `form:"limit"`
	Keyword string            `form:"keyword"`
}

type GroupingDetailDto struct {
	Filter  map[string]string `form:"filter"`
	SortBy  map[string]string `form:"sortby"`
	Page    uint              `form:"page"`
	Limit   uint              `form:"limit"`
	Keyword string            `form:"keyword"`
	IsEdit  bool              `form:"is_edit"`
}

type UpdateGroupingParamsDto struct {
	GroupingID   int64                   `json:"grouping_id"`
	DataToRemove []int64                 `json:"data_to_remove"`
	ChangedGrade []ChangedGradeModel     `json:"changed_grade"`
	RejectData   []GroupingAndGoodsModel `json:"reject_data"`
	NewData      []GroupingAndGoodsModel `json:"new_data"`
}

type CreateShipmentDto struct {
	Type                string                  `json:"type"`
	ClientID            int64                   `json:"client_id"`
	ClientCode          string                  `json:"client_code"`
	GroupingDataArr     []GroupingModel         `json:"grouping_data_arr"`
	GroupingListDataArr []GroupingAndGoodsModel `json:"grouping_list_data_arr"`
}
