package operational

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"strconv"
	"time"

	validation "github.com/go-ozzo/ozzo-validation"
)

type GradingQueueReferenceDataModel struct {
	SerialNumber string `json:"serial_number"`
	GraderName   string `json:"grader_name"`
	Grade        string `json:"grade"`
	GradePrice   int64  `json:"grade_price"`
	UnitPrice    int64  `json:"unit_price"`
	SalesCode    string `json:"sales_code"`
}

type GradingQueueResModel struct {
	Index         int                              `json:"index"`
	SerialNumber  string                           `json:"serial_number"`
	SalesCode     string                           `json:"sales_code"`
	ClientID      int64                            `json:"client_id"`
	ReferenceData GradingQueueReferenceDataModel   `json:"reference_data"`
	Status        constants.GradingQueueDataStatus `json:"status"`
	Message       *string                          `json:"message"`
}

type GradingQueueDataModel struct {
	Index        int                              `json:"index"`
	SerialNumber string                           `json:"serial_number"`
	ModelID      string                           `json:"model_id"`
	Grade        string                           `json:"grade"`
	ClientCode   string                           `json:"client_code"`
	UnitPrice    int64                            `json:"unit_price"`
	GraderName   string                           `json:"grader_name"`
	SalesCode    string                           `json:"sales_code"`
	Status       constants.GradingQueueDataStatus `json:"status"`
	Message      string                           `json:"message"`
}

func NewGradingQueueDataModel(gradingQueueDatas []GradingQueueDataDto) (valid []GradingQueueDataModel, failed []GradingQueueResModel) {
	for index, data := range gradingQueueDatas {
		newUnitPrice, err := strconv.ParseInt(data.UnitPrice, 10, 64)
		if err != nil {
			newUnitPrice = 0
		}

		model := GradingQueueDataModel{
			Index:        index,
			SerialNumber: data.SerialNumber,
			ModelID:      data.GradeData.ModelID,
			Grade:        data.GradeData.Grade,
			ClientCode:   data.GradeData.ClientCode,
			UnitPrice:    newUnitPrice,
			GraderName:   data.GraderName,
			SalesCode:    data.SalesCode,
			Status:       data.Status,
			Message:      *data.Message,
		}

		if err := model.Validate(); err != nil {
			errMessage := err.Error()
			newFailed := GradingQueueResModel{
				Index:        index,
				SerialNumber: data.SerialNumber,
				SalesCode:    data.SalesCode,
				Status:       constants.GradingFailed,
				Message:      &errMessage,
			}
			failed = append(failed, newFailed)
		} else {
			valid = append(valid, model)
		}

	}

	return valid, failed
}

func (gqm *GradingQueueDataModel) Validate() error {
	err := validation.ValidateStruct(gqm,
		validation.Field(&gqm.SerialNumber, validation.Required),
		validation.Field(&gqm.Grade, validation.Required),
		validation.Field(&gqm.ClientCode, validation.Required),
		validation.Field(&gqm.UnitPrice, validation.Required),
		validation.Field(&gqm.GraderName, validation.Required),
		validation.Field(&gqm.SalesCode, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

type GetGoodsGradingModel struct {
	SalesCode   string     `json:"sales_code"`
	ClientName  string     `json:"client_name"`
	ClientCode  string     `json:"client_code"`
	Grade       string     `json:"grade"`
	GradePrice  int64      `json:"grade_price"`
	UnitPrice   int64      `json:"unit_price"`
	GradingDate time.Time  `json:"grading_date"`
	GraderName  string     `json:"grader_name"`
	GradingBy   string     `json:"grading_by"`
	DeletedDate *time.Time `json:"deleted_date"`
}

type GetGoodsWeighModel struct {
	GrossWeight int64      `json:"gross_weight"`
	WeighDate   time.Time  `json:"weigh_date"`
	WeighBy     string     `json:"weigh_by"`
	DeletedDate *time.Time `json:"deleted_date"`
}

type GetGoodsModel struct {
	CoordinatorName string                 `json:"coordinator_name"`
	CoordinatorCode string                 `json:"coordinator_code"`
	FarmerName      string                 `json:"farmer_name"`
	ProductType     constants.ProductType  `json:"product_type"`
	GoodsID         int64                  `json:"goods_id"`
	PourOutDate     time.Time              `json:"pour_out_date"`
	PourOutBy       string                 `json:"user_grading_name"`
	SerialNumber    string                 `json:"serial_number"`
	DeliveryNumber  string                 `json:"delivery_number"`
	GradingData     []GetGoodsGradingModel `json:"grading_data"`
	WeighData       []GetGoodsWeighModel   `json:"weigh_data"`
	Total           int64                  `json:"*"`
}

type Meta struct {
	Page  int `json:"page"`
	Pages int `json:"pages"`
	Limit int `json:"limit"`
}

type GetWeightDataModel struct {
	Meta Meta            `json:"meta"`
	List []GetGoodsModel `json:"list"`
}

type GetGroupingDataModel struct {
	Meta Meta            `json:"meta"`
	List []GroupingModel `json:"list"`
}

type SetWeightModel struct {
	GoodsID     int64 `json:"goods_id"`
	GrossWeight int64 `json:"gross_weight"`
}

type GoodsDataForGroupingModel struct {
	Index           int64      `json:"index"`
	GroupingListID  *int64     `json:"grouping_list_id"`
	ShipmentGoodsID *int64     `json:"shipment_goods_id"`
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

type GroupingModel struct {
	GroupingID           int64      `json:"grouping_id,omitempty"`
	GroupingNumber       string     `json:"grouping_number,omitempty"`
	GroupingClientNumber *string    `json:"grouping_client_number,omitempty"`
	ClientID             int64      `json:"client_id,omitempty"`
	ClientName           string     `json:"client_name,omitempty"`
	ClientCode           string     `json:"client_code,omitempty"`
	GradeInitial         string     `json:"grade_initial,omitempty"`
	UB                   int64      `json:"ub,omitempty"`
	TotalGoods           int64      `json:"total_goods,omitempty"`
	LastUpdated          *time.Time `json:"last_updated,omitempty"`
	CreatedAt            time.Time  `json:"created_at,omitempty"`
	CreatedBy            string     `json:"created_by,omitempty"`
	Total                int64      `json:"*,omitempty"`
}

type GoodsDataForGroupingParams struct {
	Index              int64  `json:"index"`
	SerialNumberOrCode string `json:"serial_number_or_code"`
	DjarumGrade        string `json:"djarum_grade"`
}

type GoodsDataForGroupingParamsData struct {
	Data []GoodsDataForGroupingParams `json:"data"`
}

func NewSetWeightModel(dto SetWeightDto) (SetWeightModel, error) {
	model := SetWeightModel{
		GoodsID:     dto.GoodsID,
		GrossWeight: dto.GrossWeight,
	}

	if err := model.SetWeightValidate(); err != nil {
		return SetWeightModel{}, err
	}

	return model, nil
}

func (gqm *SetWeightModel) SetWeightValidate() error {
	err := validation.ValidateStruct(gqm,
		validation.Field(&gqm.GoodsID, validation.Required),
		validation.Field(&gqm.GrossWeight, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}
