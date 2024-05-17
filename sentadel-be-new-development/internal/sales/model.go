package sales

import (
	"sentadel-backend/internal/grade_management"
	"time"
)

type Meta struct {
	Page  int `json:"page"`
	Pages int `json:"pages"`
	Limit int `json:"limit"`
}

type GetGroupingDataModel struct {
	Meta Meta            `json:"meta"`
	List []GroupingModel `json:"list"`
}

type GoodsDataForGroupingModel struct {
	Index           int64      `json:"index"`
	GoodsID         *int64     `json:"goods_id"`
	GradeInfoID     *int64     `json:"grade_info_id"`
	WeightInfoID    *int64     `json:"weight_info_id"`
	SerialNumber    *string    `json:"serial_number"`
	SalesCode       *string    `json:"sales_code"`
	ProductType     string     `json:"product_type"`
	FarmerName      string     `json:"farmer_name"`
	CoordinatorName string     `json:"coordinator_name"`
	ClientID        *int64     `json:"client_id"`
	ClientName      *string    `json:"client_name"`
	ClientCode      *string    `json:"client_code"`
	Grade           *string    `json:"grade"`
	DjarumGrade     *string    `json:"djarum_grade"`
	UB              *int64     `json:"ub"`
	Grader          *string    `json:"grader"`
	GradingDate     *time.Time `json:"grading_date"`
	GradingBy       *string    `json:"grading_by"`
	GroupingNumber  *string    `json:"grouping_number"`
	GroupingDate    *time.Time `json:"grouping_date"`
	GroupingBy      *string    `json:"grouping_by"`
	Status          *string    `json:"status"`
}

type GroupingQueueData struct {
	GroupingID           *int64                      `json:"grouping_id,omitempty"`
	GroupingNumber       *string                     `json:"grouping_number,omitempty"`
	GroupingClientNumber *string                     `json:"grouping_client_number,omitempty"`
	GroupingList         []GoodsDataForGroupingModel `json:"grouping_list,omitempty"`
	Message              *string                     `json:"message,omitempty"`
}

type ShipmentQueueData struct {
	ShipmentID           *int64          `json:"shipment_id,omitempty"`
	ShipmentNumber       *string         `json:"shipment_number,omitempty"`
	ShipmentClientNumber *string         `json:"shipment_client_number,omitempty"`
	ShipmentType         *string         `json:"shipment_type,omitempty"`
	ShipmentGroupingList []GroupingModel `json:"shipment_goruping_list,omitempty"`
	ShipmentGoodsList    []GroupingModel `json:"shipment_goods_list,omitempty"`
	Message              *string         `json:"message,omitempty"`
}

type GradeRecapModel struct {
	Grade string `json:"grade"`
	Total int64  `json:"total"`
}

type FarmerRecapModel struct {
	PartnerID *int64 `json:"partner_id"`
	Farmer    string `json:"farmer"`
	Total     int64  `json:"total"`
}

type GroupingModel struct {
	GroupingID           int64              `json:"grouping_id,omitempty"`
	GroupingNumber       *string            `json:"grouping_number,omitempty"`
	GroupingClientNumber *string            `json:"grouping_client_number,omitempty"`
	GradeInitial         *string            `json:"grade_initial,omitempty"`
	ClientName           string             `json:"client_name,omitempty"`
	ClientCode           string             `json:"client_code,omitempty"`
	UB                   *int64             `json:"ub,omitempty"`
	GroupingCreatedAt    time.Time          `json:"grouping_created_at,omitempty"`
	GroupingCreatedBy    string             `json:"grouping_created_by,omitempty"`
	GradeRecapList       []GradeRecapModel  `json:"grade_recap_list,omitempty"`
	FarmerRecapList      []FarmerRecapModel `json:"farmer_recap_list,omitempty"`
	GoodsTotal           int64              `json:"goods_total,omitempty"`
	ClientPriceTotal     int64              `json:"client_price_total,omitempty"`
	ClientNetWeightTotal int64              `json:"client_net_weight_total,omitempty"`
	Total                int64              `json:"*,omitempty"`
}

type GroupingAndGoodsModel struct {
	Type            string `json:"type"`
	GroupingListID  *int64 `json:"grouping_list_id,omitempty"`
	GoodsID         int64  `json:"goods_id"`
	GradeInfoID     int64  `json:"grade_information_id"`
	WeightInfoID    int64  `json:"weight_information_id"`
	SerialNumber    string `json:"serial_number"`
	SalesCode       string `json:"sales_code"`
	Grade           string `json:"grade"`
	GradePrice      int64  `json:"grade_price"`
	UnitPrice       int64  `json:"unit_price"`
	Grader          string `json:"grader"`
	FarmerName      string `json:"farmer_name"`
	ProductType     string `json:"product_type"`
	CoordinatorName string `json:"coordinator_name"`
	CoordinatorCode string `json:"coordinator_code"`
	GrossWeight     int64  `json:"gross_weight"`
	ClientWeight    int64  `json:"client_weight"`
	Total           int64  `json:"*"`
}

type ChangedGradeModel struct {
	Item     GroupingAndGoodsModel       `json:"item"`
	NewGrade grade_management.GradeModel `json:"new_grade"`
}

type GroupingDetailModel struct {
	GroupingID           int64                   `json:"grouping_id,omitempty"`
	GroupingNumber       string                  `json:"grouping_number,omitempty"`
	GroupingClientNumber *string                 `json:"grouping_client_number,omitempty"`
	ClientID             int64                   `json:"client_id,omitempty"`
	ClientName           string                  `json:"client_name,omitempty"`
	ClientCode           string                  `json:"client_code,omitempty"`
	GradeInitial         string                  `json:"grade_initial,omitempty"`
	UB                   *int64                  `json:"ub,omitempty"`
	GroupingDataJson     []GroupingAndGoodsModel `json:"grouping_data_json,omitempty"`
	GoodsDataJson        []GroupingAndGoodsModel `json:"goods_data_json,omitempty"`
	Meta                 Meta                    `json:"meta"`
}

// type GoodsDataForGroupingParams struct {
// 	Index              int64  `json:"index"`
// 	SerialNumberOrCode string `json:"serial_number_or_code"`
// 	DjarumGrade        string `json:"djarum_grade"`
// }

// type GoodsDataForGroupingParamsData struct {
// 	Data []GoodsDataForGroupingParams `json:"data"`
// }
