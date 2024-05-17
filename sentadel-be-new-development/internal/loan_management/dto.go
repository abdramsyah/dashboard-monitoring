package loan_management

import "sentadel-backend/internal/constants"

type ManageLoanRequestDto struct {
	LoanID        int64                       `json:"id"`
	LoanPrincipal int64                       `json:"loan_principal"`
	Total         int64                       `json:"total"`
	ReferenceType constants.LoanReferenceEnum `json:"reference_type"`
	ReferenceID   int64                       `json:"reference_id"`
	Description   string                      `json:"description"`
}

type AddNewRepaymentDto struct {
	Data      []AddNewRepaymentDataDto `json:"data"`
	InvoiceID *int64                   `json:"invoice_id"`
}

type AddNewRepaymentDataDto struct {
	LoanID      int64  `json:"loan_id"`
	Value       int64  `json:"value"`
	Description string `json:"description"`
}

func (dto ManageLoanRequestDto) MapToModel() (ManageLoanRequestModel, error) {
	return NewAddNewLoanRequestModel(dto)
}

func (dto ManageLoanRequestDto) MapToUpdateModel() (ManageLoanRequestModel, error) {
	return NewUpdateLoanRequestModel(dto)
}

func (dto AddNewRepaymentDto) MapToRepaymentModel() ([]AddNewRepaymentModel, *int64, error) {
	return NewAddNewRepaymentModel(dto)
}

type GetLoanListDto struct {
	Filter  map[string]string `form:"filter"`
	SortBy  map[string]string `form:"sortby"`
	Page    uint              `form:"page"`
	Limit   uint              `form:"limit"`
	Keyword string            `form:"keyword"`
}
