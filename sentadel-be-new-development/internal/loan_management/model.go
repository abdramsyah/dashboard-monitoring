package loan_management

import (
	validation "github.com/go-ozzo/ozzo-validation"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"time"
)

type ManageLoanRequestModel struct {
	LoanID        int64                       `json:"loan_id"`
	LoanPrincipal int64                       `json:"loan_principal"`
	Total         int64                       `json:"total"`
	ReferenceType constants.LoanReferenceEnum `json:"reference_type"`
	ReferenceID   int64                       `json:"reference_id"`
	Description   string                      `json:"description"`
}

type AddNewRepaymentModel struct {
	LoanID      int64  `json:"loan_id"`
	Value       int64  `json:"value"`
	Description string `json:"description"`
}

func NewAddNewLoanRequestModel(dto ManageLoanRequestDto) (ManageLoanRequestModel, error) {
	model := ManageLoanRequestModel{
		LoanPrincipal: dto.LoanPrincipal,
		Total:         dto.Total,
		ReferenceType: dto.ReferenceType,
		ReferenceID:   dto.ReferenceID,
		Description:   dto.Description,
	}

	if err := model.Validate(); err != nil {
		return ManageLoanRequestModel{}, err
	}

	return model, nil
}

func NewUpdateLoanRequestModel(dto ManageLoanRequestDto) (ManageLoanRequestModel, error) {
	model := ManageLoanRequestModel{
		LoanID:        dto.LoanID,
		LoanPrincipal: dto.LoanPrincipal,
		Total:         dto.Total,
		ReferenceType: dto.ReferenceType,
		ReferenceID:   dto.ReferenceID,
		Description:   dto.Description,
	}

	if err := model.Update(); err != nil {
		return ManageLoanRequestModel{}, err
	}

	return model, nil
}

func NewAddNewRepaymentModel(dto AddNewRepaymentDto) ([]AddNewRepaymentModel, *int64, error) {
	var models []AddNewRepaymentModel

	for _, data := range dto.Data {
		model := AddNewRepaymentModel{
			LoanID:      data.LoanID,
			Value:       data.Value,
			Description: data.Description,
		}

		if err := model.RepaymentValidate(); err != nil {
			return nil, nil, err
		}

		models = append(models, model)
	}

	return models, dto.InvoiceID, nil
}

func (psm *ManageLoanRequestModel) Validate() error {
	err := validation.ValidateStruct(psm,
		validation.Field(&psm.LoanPrincipal, validation.Required),
		validation.Field(&psm.Total, validation.Required),
		validation.Field(&psm.ReferenceType, validation.Required),
		validation.Field(&psm.ReferenceID, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

func (psm *ManageLoanRequestModel) Update() error {
	err := validation.ValidateStruct(psm,
		validation.Field(&psm.LoanID, validation.Required),
		validation.Field(&psm.LoanPrincipal, validation.Required),
		validation.Field(&psm.Total, validation.Required),
		validation.Field(&psm.ReferenceType, validation.Required),
		validation.Field(&psm.ReferenceID, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

func (psm *AddNewRepaymentModel) RepaymentValidate() error {
	err := validation.ValidateStruct(psm,
		validation.Field(&psm.LoanID, validation.Required),
		validation.Field(&psm.Value, validation.Required),
		validation.Field(&psm.Description, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

type LoanModel struct {
	ID              int64                       `json:"id"`
	Code            string                      `json:"code"`
	LoanPrincipal   int64                       `json:"loan_principal"`
	TotalLoan       int64                       `json:"total"`
	ReferenceID     int64                       `json:"reference_id"`
	ReferenceType   constants.LoanReferenceEnum `json:"reference_type"`
	ReferenceName   string                      `json:"reference_name"`
	CoordinatorCode string                      `json:"coordinator_code"`
	CoordinatorName *string                     `json:"coordinator_name"`
	Description     *string                     `json:"description"`
	CreatedAt       time.Time                   `json:"created_at"`
	CreatedBy       string                      `json:"created_by"`
	Total           int64                       `json:"*"`
}

type Meta struct {
	Page  int `json:"page"`
	Pages int `json:"pages"`
	Limit int `json:"limit"`
}

type LoanListDataModel struct {
	Meta Meta        `json:"meta"`
	List []LoanModel `json:"list"`
}
