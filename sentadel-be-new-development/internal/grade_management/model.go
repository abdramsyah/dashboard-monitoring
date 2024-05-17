package grade_management

import (
	"sentadel-backend/internal/base/errors"
	"time"

	validation "github.com/go-ozzo/ozzo-validation"
)

type GradeModel struct {
	ModelID                string    `json:"model_id,omitempty"`
	ID                     int64     `json:"id"`
	Index                  int       `json:"index,omitempty"`
	Grade                  string    `json:"grade"`
	Price                  int64     `json:"price"`
	Quota                  int64     `json:"quota"`
	UB                     int64     `json:"ub"`
	ClientID               int64     `json:"client_id,omitempty"`
	ClientSalesCodeInitial string    `json:"client_sales_code_initial,omitempty"`
	ClientCode             string    `json:"client_code,omitempty"`
	ClientName             string    `json:"client_name,omitempty"`
	CreatedAt              time.Time `json:"created_at"`
	UpdatedAt              time.Time `json:"updated_at"`
}

type GradeManagementCreateModel struct {
	ClientID   int64        `json:"client_id" db:"client_id"`
	ClientName int64        `json:"quota" db:"quota"`
	Grades     []GradeModel `json:"grades" db:"grades"`
	Duplicate  []GradeModel `json:"duplicate"`
	Created    []GradeModel `json:"created"`
	Total      int64        `json:"-" goqu:"skipinsert"`
}

type GradeManagementModel struct {
	ID        int64     `json:"id" goqu:"skipinsert"`
	ClientID  int64     `json:"client_id" db:"client_id"`
	Quota     int64     `json:"quota" db:"quota"`
	Price     int64     `json:"price" db:"price"`
	Grade     string    `json:"grade" db:"grade"`
	CreatedAt time.Time `json:"created_at" db:"created_at" goqu:"skipinsert"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Total     int64     `json:"-" goqu:"skipinsert"`
}

type GroupedGradeModel struct {
	Key    string       `json:"key"`
	Group  string       `json:"group"`
	Grades []GradeModel `json:"grades"`
}

type ClientGroupResponseModel struct {
	ClientID     int64               `json:"client_id"`
	ClientCode   string              `json:"client_code"`
	ClientName   string              `json:"client_name"`
	GroupedGrade []GroupedGradeModel `json:"grouped_grade"`
	Total        int64               `json:"-" goqu:"skipinsert"`
}

type GradePriceModel struct {
	ID    int64 `json:"id"`
	Price int64 `json:"price"`
}

func NewGradeManagementModel(clientID int64, grades []GradeRequestDto) (GradeManagementCreateModel, error) {
	model := GradeManagementCreateModel{
		ClientID: clientID,
	}

	var duplicate []GradeModel
	var toCreate []GradeModel
	gradeMap := make(map[string]bool)
	for idx, grade := range grades {
		if gradeMap[grade.Grade] {
			duplicate = append(duplicate, GradeModel{
				Index:    idx + 1,
				ClientID: clientID,
				Grade:    grade.Grade,
				Quota:    grade.Quota,
				Price:    grade.Price,
				UB:       grade.UB,
			})
		} else {
			toCreate = append(toCreate, GradeModel{
				Index:    idx + 1,
				ClientID: clientID,
				Grade:    grade.Grade,
				Quota:    grade.Quota,
				Price:    grade.Price,
				UB:       grade.UB,
			})
			gradeMap[grade.Grade] = true
		}
	}

	model.Grades = toCreate
	model.Duplicate = duplicate

	//if err := model.Validate(); err != nil {
	//	return GradeManagementModel{}, nil, err
	//}

	return model, nil
}

func (c *GradeManagementModel) Update(quota *int64, price *int64, grade string, clientId *int64) error {
	if len(grade) > 0 {
		c.Grade = grade
	}

	if quota != nil {
		c.Quota = *quota
	}

	if price != nil {
		c.Price = *price
	}

	if clientId != nil {
		c.ClientID = *clientId
	}

	return c.Validate()
}

func (g *GradeManagementModel) Validate() error {
	err := validation.ValidateStruct(g,
		validation.Field(&g.ClientID, validation.Required),
		validation.Field(&g.Grade, validation.Required, validation.Length(2, 100)),
		//validation.Field(&g.CompanyGrade, validation.Required, validation.Length(2, 100)),
		//validation.Field(&g.GradeInitial, validation.Required, validation.Length(1, 1)),
		validation.Field(&g.Price, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}
