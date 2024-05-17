package stock

import (
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/purchase"
	"sentadel-backend/internal/user"
	"time"
)

type GetStockListDataModel struct {
	List []purchase.BucketDataModel `json:"list"`
	Meta user.Meta                  `json:"meta"`
}

type GradeInfoDataModel struct {
	GradeInfoID   int64      `json:"grade_info_id"`
	Grade         string     `json:"grade"`
	UnitPrice     int64      `json:"unit_price"`
	GradePrice    int64      `json:"grade_price"`
	SalesCode     string     `json:"sales_code"`
	ClientName    string     `json:"client_name"`
	ClientCode    string     `json:"client_code"`
	Grader        string     `json:"grader"`
	CreatedAt     time.Time  `json:"created_at"`
	CreatedBy     string     `json:"created_by"`
	DeletedAt     *time.Time `json:"deleted_at"`
	DeletedReason string     `json:"deleted_reason"`
}

type WeightInfoDataModel struct {
	WeightInfoID  int64      `json:"weight_info_id"`
	GrossWeight   int64      `json:"gross_weight"`
	CreatedAt     time.Time  `json:"created_at"`
	CreatedBy     string     `json:"created_by"`
	DeletedAt     *time.Time `json:"deleted_at"`
	DeletedReason string     `json:"deleted_reason"`
}

type PurchaseInfoDataModel struct {
	PurchaseInfoID      int64                `json:"purchase_info_id"`
	GradeInfoID         int64                `json:"grade_info_id"`
	Grade               string               `json:"grade"`
	UnitPrice           int64                `json:"unit_price"`
	GradePrice          int64                `json:"grade_price"`
	SalesCode           string               `json:"sales_code"`
	ClientName          string               `json:"client_name"`
	ClientCode          string               `json:"client_code"`
	Grader              string               `json:"grader"`
	WeightInfoID        int64                `json:"weight_info_id"`
	GrossWeight         int64                `json:"gross_weight"`
	PurchaseGrossWeight int64                `json:"purchase_gross_weight"`
	PurchaseNetWeight   int64                `json:"purchase_net_weight"`
	InvoiceNumber       string               `json:"invoice_number"`
	StatusList          []InvoiceStatusModel `json:"status_list"`
	CreatedAt           time.Time            `json:"created_at"`
	CreatedBy           string               `json:"created_by"`
	DeletedAt           *time.Time           `json:"deleted_at"`
	DeletedReason       string               `json:"deleted_reason"`
}

type InvoiceStatusModel struct {
	Status     constants.InvoiceStatusEnum `json:"status"`
	StatusDate time.Time                   `json:"status_date"`
	CreatedBy  string                      `json:"created_by"`
}

type GetStockDetailModel struct {
	BucketID             int64                   `json:"bucket_id"`
	SerialNumber         string                  `json:"serial_number"`
	CoordinatorName      string                  `json:"coordinator_name"`
	FarmerName           string                  `json:"farmer_name"`
	GoodsID              int64                   `json:"goods_id"`
	GradeInfoDataList    []GradeInfoDataModel    `json:"grade_info_data_list"`
	WeightInfoDataList   []WeightInfoDataModel   `json:"weight_info_data_list"`
	PurchaseInfoDataList []PurchaseInfoDataModel `json:"purchase_info_data_list"`
}

type GetStockSummaryModel struct {
	SummaryGeneralValues
	ParentsTotalGoods      int64                       `json:"parents_total_goods"`
	ClientGroupList        []SummaryClientGroup        `json:"client_group_list"`
	CoordinatorGroupList   []SummaryCoordinatorGroup   `json:"coordinator_group_list"`
	StatusGroupList        []SummaryStatusGroup        `json:"status_group_list"`
	InvoiceStatusGroupList []SummaryInvoiceStatusGroup `json:"invoice_status_group_list"`
}

type SummaryGeneralValues struct {
	TotalGoods         int64 `json:"total_goods,omitempty"`
	AveragePrice       int64 `json:"average_price,omitempty"`
	TotalNetWeight     int64 `json:"total_net_weight,omitempty"`
	TotalGrossWeight   int64 `json:"total_gross_weight,omitempty"`
	TotalPurchasePrice int64 `json:"total_purchase_price,omitempty"`
}

type SummaryClientGroup struct {
	SummaryGeneralValues
	ClientCode     string                    `json:"client_code"`
	ClientName     string                    `json:"client_name"`
	GradeRecapList []SummaryGradeClientGroup `json:"grade_recap_list"`
}

type SummaryGradeClientGroup struct {
	SummaryGeneralValues
	Grade string `json:"grade"`
}

type SummaryCoordinatorGroup struct {
	SummaryGeneralValues
	CoordinatorCode      string               `json:"coordinator_code"`
	CoordinatorName      string               `json:"coordinator_name"`
	ClientGradeRecapList []SummaryClientGroup `json:"client_grade_recap_list"`
}

type SummaryStatusGroup struct {
	Status     string `json:"status"`
	TotalGoods int64  `json:"total_goods"`
}

type SummaryInvoiceStatusGroup struct {
	Status     string `json:"status"`
	TotalGoods int64  `json:"total_goods"`
}
