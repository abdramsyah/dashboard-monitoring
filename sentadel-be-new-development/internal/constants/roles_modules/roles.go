package roles_modules

type Roles string

const (
	SuperAdmin                Roles = "SUPERADMIN"
	OperationalAdministrator  Roles = "OPERATIONAL_ADMINISTRATOR"
	CoordinatorAdministrator  Roles = "COORDINATOR_ADMINISTRATOR"
	PurchaseAdministrator     Roles = "PURCHASE_ADMINISTRATOR"
	StockAdministrator        Roles = "STOCK_ADMINISTRATOR"
	SalesAdministrator        Roles = "SALES_ADMINISTRATOR"
	General                   Roles = "GENERAL"
	RemunerationAdministrator Roles = "REMUNERATION_ADMINISTRATOR"
	Coordinator               Roles = "COORDINATOR"
)
