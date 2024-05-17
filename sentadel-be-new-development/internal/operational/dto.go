package operational

import (
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/grade_management"
)

type GradingQueueDataDto struct {
	Index        int                              `json:"index"`
	SerialNumber string                           `json:"serial_number"`
	GradeData    grade_management.GradeModel      `json:"grade_data"`
	UnitPrice    string                           `json:"unit_price"`
	GraderName   string                           `json:"grader_name"`
	SalesCode    string                           `json:"sales_code"`
	Status       constants.GradingQueueDataStatus `json:"status"`
	Message      *string                          `json:"message"`
}

type ArrayOfGradingQueueDataDto []GradingQueueDataDto

func (dto ArrayOfGradingQueueDataDto) MapToModel() (valid []GradingQueueDataModel, failed []GradingQueueResModel) {
	return NewGradingQueueDataModel(dto)
}

type GradingDataRequestDto struct {
	Data ArrayOfGradingQueueDataDto `json:"data"`
}

type GoodsInformationListDto struct {
	Filter  map[string]string `form:"filter"`
	SortBy  map[string]string `form:"sortby"`
	Page    uint              `form:"page"`
	Limit   uint              `form:"limit"`
	Keyword string            `form:"keyword"`
}

type SetWeightDto struct {
	GoodsID     int64 `json:"goods_id"`
	GrossWeight int64 `json:"gross_weight"`
}

func (dto SetWeightDto) SetWeightMapToModel() (SetWeightModel, error) {
	return NewSetWeightModel(dto)
}
