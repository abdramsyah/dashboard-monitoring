package shipping

import "time"

type ReqShippingGroupDto struct {
	ClientGroupId []int64 `json:"client_group_id"`
	AddressId     int64   `json:"address_id"`
	ClientCode    string  `json:"client_code"`
	UniqueCode    *string `json:"unique_code"`
}

type ShippingList struct {
	Id                int64     `json:"id,omitempty"`
	GroupCode         string    `json:"group_code"`
	ClientID          int64     `json:"client_id,omitempty"`
	ClientName        string    `json:"client_name"`
	ClientGroupNumber *string   `json:"client_group_number"`
	Address           string    `json:"address"`
	Send              bool      `json:"send_status"`
	CreatedAt         time.Time `json:"created_at"`
	Total             int64     `json:"-"`
}

type ShippingDetail struct {
	Id                int64       `json:"id,omitempty"`
	GroupCode         string      `json:"group_code"`
	ClientID          int64       `json:"client_id,omitempty"`
	ClientName        string      `json:"client_name"`
	ClientGroupNumber *string     `json:"client_group_number"`
	Address           string      `json:"address"`
	Send              bool        `json:"send_status"`
	Detail            interface{} `json:"detail,omitempty"`
}

type AddressList struct {
	Id      int64  `json:"id"`
	Address string `json:"address"`
}
