package unique_code_generator

import "time"

type UniqueCodeModel struct {
	ID        int64      `json:"id"`
	Code      string     `json:"code"`
	CreatedAt time.Time  `json:"created_at"`
	UsedAt    *time.Time `json:"used_at"`
	UsedBy    *int64     `json:"used_by"`
}
