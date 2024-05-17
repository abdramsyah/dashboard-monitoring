package barcode_system

import (
	"time"
)

type ClientBarcodeModel struct {
	CodeID        int64     `json:"code_id"`
	Code          string    `json:"code"`
	CreatedAt     time.Time `json:"created_at,omitempty"`
	CreatedByID   int64     `json:"created_by_id,omitempty"`
	CreatedByName string    `json:"created_by_name,omitempty"`
}

type ClientBarcodeWithStatusModel struct {
	Code      string `json:"code"`
	Status    string `json:"status"`
	Timestamp int64  `json:"timestamp"`
}

type ClientBarcodeGroupedByInitialModel struct {
	Initial string                         `json:"initial"`
	Codes   []ClientBarcodeWithStatusModel `json:"codes,omitempty"`
}

type ClientBarcodeGroupModel struct {
	UserID                 int64                                `json:"user_id,omitempty"`
	UserName               string                               `json:"user_name,omitempty"`
	ClientID               int64                                `json:"client_id,omitempty"`
	ClientSalesCodeInitial string                               `json:"client_sales_code_initial,omitempty"`
	ClientCode             string                               `json:"client_code,omitempty"`
	ClientName             string                               `json:"client_name,omitempty"`
	Codes                  []ClientBarcodeModel                 `json:"codes,omitempty"`
	CodeData               []ClientBarcodeGroupedByInitialModel `json:"code_data,omitempty"`
	Total                  int64                                `json:"-"`
}

type ClientBarcodesByInitial struct {
	Initial string   `json:"initial"`
	Codes   []string `json:"codes"`
}

type ClientBarcodeInformationModel struct {
	UserID        int64                     `json:"user_id,omitempty"`
	UserName      string                    `json:"user_name,omitempty"`
	ClientID      int64                     `json:"client_id,omitempty"`
	ClientName    string                    `json:"client_name,omitempty"`
	CodeByInitial []ClientBarcodesByInitial `json:"code_by_initial,omitempty"`
	TotalQuantity int64                     `json:"total_quantity"`
	Total         int64                     `json:"-"`
}
