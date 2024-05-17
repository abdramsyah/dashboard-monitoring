package supply_power_management

import "sentadel-backend/internal/user"

type PowerSupplyDTO struct {
	ClientName      string `json:"client_name"`
	Quota           int64  `json:"quota"`
	SupplyFilled    int64  `json:"supply_filled"`
	RemainingSupply int64  `json:"remaining_supply"`
	ClientID        int64  `json:"client_id"`
	ClientCode      int64  `json:"client_code"`
}

type PowerSupplyManagementListResponse struct {
	List []PowerSupplyModel `json:"power_supply_management"`
	Meta user.Meta          `json:"meta"`
}
