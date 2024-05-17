package clients

import (
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/grade_management"
	"sentadel-backend/internal/user"
	"time"
)

type ClientRequest struct {
	ID         int64                                           `json:"id"`
	ClientName string                                          `json:"client_name"`
	Code       string                                          `json:"code"`
	Company    constants.CompanyEnum                           `json:"company"`
	Status     constants.Status                                `json:"status"`
	Grades     []grade_management.GradeManagementCreateRequest `json:"grades,omitempty"`
}

func (dto ClientRequest) MapToModel() (ClientModel, error) {
	return NewClientModel(dto.ClientName, dto.Code, dto.Company)
}

type AddressDto struct {
	ID       int64  `json:"id"`
	ClientID int64  `json:"client_id"`
	Address  string `json:"address"`
}

func (dto AddressDto) MapAddressDtoToModel() (AddressModel, error) {
	return NewAddressModel(dto.ID, dto.Address, dto.ClientID)
}

type ClientResponse struct {
	ID         int64                 `json:"id"`
	ClientName string                `json:"client_name"`
	Code       string                `json:"code"`
	Company    constants.CompanyEnum `json:"company"`
	CreatedAt  time.Time             `json:"created_at"`
	UpdatedAt  time.Time             `json:"updated_at"`
	Status     constants.Status      `json:"status"`
}

type ClientListDto struct {
	Filter  []string `form:"filter" json:"filter"`
	SortBy  []string `form:"sortby"`
	Page    uint     `form:"page"`
	Limit   uint     `form:"limit"`
	Keyword string   `form:"keyword"`
}

type ClientListResponse struct {
	Clients []ClientModel `json:"clients"`
	Meta    user.Meta     `json:"meta"`
}
