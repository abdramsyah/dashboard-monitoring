package unique_code_generator

import "time"

type UniqueCodeResponse struct {
	ID        int64      `json:"id"`
	Code      string     `json:"code"`
	CreatedAt time.Time  `json:"created_at"`
	UsedAt    *time.Time `json:"used_at"`
	UsedBy    *int64     `json:"used_by"`
}

type UniqueCodeDto struct {
	Code string `json:"code"`
}

type UniqueCodeHistoryResponse struct {
	UniqueCodes []UniqueCodeModel `json:"unique_codes"`
}
