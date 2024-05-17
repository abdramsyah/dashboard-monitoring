package grade_management

import (
	"sentadel-backend/internal/user"
	"time"
)

type GradeRequestDto struct {
	Quota int64  `json:"quota"`
	Price int64  `json:"price"`
	Grade string `json:"grade"`
	UB    int64  `json:"ub"`
}

type GradeManagementCreateRequest struct {
	ClientID *int64            `json:"client_id"`
	Grades   []GradeRequestDto `json:"grades"`
}

func (dto GradeManagementCreateRequest) MapToModel() (GradeManagementCreateModel, error) {
	return NewGradeManagementModel(*dto.ClientID, dto.Grades)
}

type GradeManagementResponse struct {
	ID        int64     `json:"id"`
	ClientID  int64     `json:"client_id"`
	Quota     int64     `json:"quota"`
	Price     int64     `json:"price"`
	Grade     string    `json:"grade"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type GradePriceResponse struct {
	ID    int64 `json:"id"`
	Price int64 `json:"price"`
}

type GradeDictionarySearchRequest struct {
	Filter []string `form:"filter"`
	SortBy []string `form:"sortby"`
	Page   uint     `form:"page"`
	Limit  uint     `form:"limit"`
}

type GradeDictionaryListDto struct {
	ClientID uint     `form:"client_id"`
	Filter   []string `form:"filter"`
	SortBy   []string `form:"sortby"`
	Page     uint     `form:"page"`
	Limit    uint     `form:"limit"`
	Keyword  string   `form:"keyword"`
}

type GradePriceDto struct {
	ClientID int64 `json:"client_id"`
	GradeID  int64 `json:"grade_id"`
}

type GradeDictionaryListResponse struct {
	GradeDictionaries []ClientGroupResponseModel `json:"grades"`
	Meta              user.Meta                  `json:"meta"`
}
