package models

import "sentadel-backend/internal/user"

type SearchRequest struct {
	Filter    []string `form:"filter" json:"filter,omitempty"`
	SortBy    []string `form:"sortby" json:"sortby,omitempty"`
	Page      uint     `form:"page" json:"page,omitempty"`
	Limit     uint     `form:"limit" json:"limit,omitempty"`
	Keyword   string   `form:"keyword" json:"keyword,omitempty"`
	StartDate string   `form:"start_date" json:"start_date,omitempty"`
	EndDate   string   `form:"end_date" json:"end_date,omitempty"`
}

type SearchResponse struct {
	List interface{} `json:"data"`
	Meta user.Meta   `json:"meta"`
}
