package clients

import (
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/constants"
	"time"

	validation "github.com/go-ozzo/ozzo-validation"
)

type ClientModel struct {
	ID          int64                 `json:"id"`
	ClientName  string                `json:"client_name"`
	Code        string                `json:"code"`
	Status      constants.Status      `json:"status"`
	Company     constants.CompanyEnum `json:"company"`
	CreatedAt   time.Time             `json:"created_at"`
	UpdatedAt   time.Time             `json:"last_updated_date"`
	DeletedAt   *time.Time            `json:"deleted_at,omitempty"`
	GradeList   []string              `json:"grade_list"`
	AddressList []AddressModel        `json:"address_list"`
	Total       int64                 `json:"-"`
}

type AddressModel struct {
	ID       int64  `json:"id"`
	ClientID int64  `json:"client_id"`
	Address  string `json:"address"`
}

func NewClientModel(clientName, code string, company constants.CompanyEnum) (ClientModel, error) {
	clientModel := ClientModel{
		ClientName: clientName,
		Code:       code,
		Company:    company,
		Status:     constants.Active,
	}

	if err := clientModel.Validate(); err != nil {
		return ClientModel{}, err
	}

	return clientModel, nil
}

func NewAddressModel(id int64, address string, clientID int64) (AddressModel, error) {
	adressModel := AddressModel{
		ID:       id,
		ClientID: clientID,
		Address:  address,
	}

	var err error
	if adressModel.ID == 0 {
		if err = adressModel.ValidateAddress(); err != nil {
			return AddressModel{}, err
		}
	} else {
		if err = adressModel.UpdateAddress(); err != nil {
			return AddressModel{}, err
		}
	}

	return adressModel, nil
}

func (c *ClientModel) Update(clientName, code string, status constants.Status, company constants.CompanyEnum) error {
	if c == nil {
		return errors.New(errors.NotFoundError)
	}

	if len(clientName) > 0 {
		c.ClientName = clientName
	}

	if len(code) > 0 {
		c.Code = code
	}

	if status != "" {
		c.Status = status
	}

	if len(company) > 0 {
		c.Company = company
	}

	return c.Validate()
}

func (clientModel *ClientModel) Validate() error {
	err := validation.ValidateStruct(clientModel,
		validation.Field(&clientModel.ClientName, validation.Required, validation.Length(5, 100)),
		validation.Field(&clientModel.Code, validation.Required, validation.Length(2, 100)),
		validation.Field(&clientModel.Status, validation.Required, validation.Length(5, 100)),
		validation.Field(&clientModel.Company, validation.Required, validation.In(constants.LAMPION, constants.TALENTA)),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

func (clientModel *AddressModel) ValidateAddress() error {
	err := validation.ValidateStruct(clientModel,
		validation.Field(&clientModel.ClientID, validation.Required),
		validation.Field(&clientModel.Address, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}

func (clientModel *AddressModel) UpdateAddress() error {
	err := validation.ValidateStruct(clientModel,
		validation.Field(&clientModel.ID, validation.Required),
		validation.Field(&clientModel.Address, validation.Required),
	)

	if err != nil {
		return errors.New(errors.ValidationError)
	}

	return nil
}
