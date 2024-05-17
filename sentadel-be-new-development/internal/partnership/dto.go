package partnership

type ManagePartnerRequestDto struct {
	PartnerID     int64  `json:"partner_id"`
	Name          string `json:"name"`
	Quota         int64  `json:"quota"`
	CoordinatorID int64  `json:"coordinator_id"`
}

func (dto ManagePartnerRequestDto) MapToModel() (ManagePartnerRequestModel, error) {
	return NewAddNewPartnerRequestModel(dto)
}

func (dto ManagePartnerRequestDto) MapToUpdateModel() (ManagePartnerRequestModel, error) {
	return NewUpdatePartnerRequestModel(dto)
}

type GetPartnerListDto struct {
	Filter  map[string]string `form:"filter"`
	SortBy  map[string]string `form:"sortby"`
	Page    uint              `form:"page"`
	Limit   uint              `form:"limit"`
	Keyword string            `form:"keyword"`
}
