package main

import (
	"context"
	"log"
	"sentadel-backend/api/cli"
	"sentadel-backend/api/http"
	"sentadel-backend/internal/barcode_system"
	"sentadel-backend/internal/cache"
	"sentadel-backend/internal/clients"
	"sentadel-backend/internal/commons"
	"sentadel-backend/internal/coordinator"
	"sentadel-backend/internal/grade_management"
	"sentadel-backend/internal/invoice"
	"sentadel-backend/internal/loan_management"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/operational"
	"sentadel-backend/internal/partnership"
	"sentadel-backend/internal/purchase"
	queuerequest "sentadel-backend/internal/queue_request"
	"sentadel-backend/internal/roles"
	"sentadel-backend/internal/sales"
	"sentadel-backend/internal/shipping"
	"sentadel-backend/internal/stock"
	"sentadel-backend/internal/supply_power_management"
	"sentadel-backend/internal/tax_and_fee"

	authImpl "sentadel-backend/internal/auth/impl"
	cryptoImpl "sentadel-backend/internal/base/crypto/impl"
	databaseImpl "sentadel-backend/internal/base/database/impl"
	uploaderImpl "sentadel-backend/internal/base/uploader/impl"
	uniqueCodeImpl "sentadel-backend/internal/unique_code_generator/impl"
	userImpl "sentadel-backend/internal/user/impl"
)

func main() {
	ctx := context.Background()
	parser := cli.NewParser()

	loggerSingleton := logger.NewMainLoggerSingleton()

	loggerSingleton.Info("Starting")

	conf, err := parser.ParseConfig()
	if err != nil {
		log.Fatal(err)
	}

	cache, err := cache.NewLocalCache()
	if err != nil {
		log.Fatal(err)
	}

	dbClient := databaseImpl.NewClient(ctx, conf.Database())

	err = dbClient.Connect()
	if err != nil {
		log.Fatal(err)
	}

	defer dbClient.Close()
	loggerSingleton.Info("Database OK")

	crypto := cryptoImpl.NewCrypto()
	dbService := databaseImpl.NewService(dbClient)

	uploaderCfg := conf.S3()
	sess, err := uploaderCfg.ConnectUploader()
	if err != nil {
		log.Fatal(err)
	}

	loggerSingleton.Info("Uploader S3 OK")

	uploaderS3 := uploaderImpl.NewUploader(conf, sess)

	userRepositoryOpts := userImpl.UserRepositoryOpts{
		ConnManager: dbService,
	}

	roleRepository := roles.NewRoleRepository(dbService)
	roleUsecases := roles.NewRoleUsecases(dbService, roleRepository, cache)
	userRepository := userImpl.NewUserRepository(userRepositoryOpts)

	clientRepository := clients.NewRoleRepository(dbService)
	clientUsecases := clients.NewClientUsecases(dbService, clientRepository)

	commonsRepositoryOpts := commons.CommonsRepositoryOpts{
		ConnManager: dbService,
	}
	commonsRepository := commons.NewCommonsRepository(commonsRepositoryOpts)

	gradeDictionaryRepository := grade_management.NewGradeDictionaryRepository(dbService)
	gradeDictionaryUsecases := grade_management.NewGradeDictionaryUsecases(dbService, gradeDictionaryRepository)

	CoordinatorRepository := coordinator.NewRepository(dbService)
	CoordinatorUsecases := coordinator.NewUsecase(dbService, crypto, uploaderS3, CoordinatorRepository, userRepository)

	queueRequestRepository := queuerequest.NewRepository(dbService)
	queueRequestUsecase := queuerequest.NewUsecase(dbService, queueRequestRepository, userRepository,
		commonsRepository, CoordinatorUsecases)

	authServiceOpts := authImpl.AuthServiceOpts{
		Crypto:         crypto,
		Config:         conf.Auth(),
		UserRepository: userRepository,
	}
	authService := authImpl.NewAuthService(authServiceOpts)

	userUsecasesOpts := userImpl.UserUsecasesOpts{
		TxManager:      dbService,
		UserRepository: userRepository,
		Crypto:         crypto,
		Uploader:       uploaderS3,
	}
	userUsecases := userImpl.NewUserUsecases(userUsecasesOpts, roleRepository)

	uniqueCodeRepoOpts := uniqueCodeImpl.UniqueCodeRepositoryOpts{
		ConnManager: dbService,
	}
	uniqueCodeRepository := uniqueCodeImpl.NewUniqueCodeRepository(uniqueCodeRepoOpts)

	invoiceRepository := invoice.NewInvoiceRepository(dbService)
	invoiceUsecase := invoice.NewInvoiceUsecase(dbService, invoiceRepository)

	//groupingRepository := grouping.NewBarcodeSystemRepository(dbService, commonsRepository)
	//groupingUsecase := grouping.NewUsecase(dbService, groupingRepository, userRepository, uniqueCodeRepository, commonsRepository, invoiceRepository)

	shippingRepository := shipping.NewRepository(dbService)
	shippingUsecase := shipping.NewUsecase(dbService, shippingRepository, userRepository, uniqueCodeRepository)

	uniqueCodeUseCasesOpts := uniqueCodeImpl.UniqueCodeUsecasesOpts{
		TxManager:            dbService,
		UniqueCodeRepository: uniqueCodeRepository,
	}
	uniqueCodeUseCases := uniqueCodeImpl.NewUniqueCodeUsecases(uniqueCodeUseCasesOpts)

	serverOpts := http.ServerOpts{
		UserUsecases: userUsecases,
		AuthService:  authService,
		Crypto:       crypto,
		Config:       conf.HTTP(),
	}

	powerSupplyManagementRepository := supply_power_management.NewPowerSupplyManagementRepository(
		supply_power_management.PowerSupplyManagementRepositoryOpts{
			ConnManager: dbService,
		})

	powerSupplyManagementUsecase := supply_power_management.NewPowerSupplyManagementUsecases(
		supply_power_management.PowerSupplyManagementUsecasesOpts{
			TxManager:                       dbService,
			PowerSupplyManagementRepository: powerSupplyManagementRepository,
		})

	taxAndFeeRepository := tax_and_fee.NewTaxAndFeeRepository(
		tax_and_fee.TaxAndFeeRepositoryOpts{
			ConnManager: dbService,
		},
	)

	taxAndFeeUsecase := tax_and_fee.NewTaxAndFeeUsecase(
		tax_and_fee.TaxAndFeeUsecasesOpts{
			TxManager:           dbService,
			TaxAndFeeRepository: taxAndFeeRepository,
		},
	)

	barcodeSystemRepository := barcode_system.NewBarcodeSystemRepository(dbService)

	barcodeSystemUseCase := barcode_system.NewBarcodeSystemUseCase(dbService, *barcodeSystemRepository)

	operationalRepository := operational.NewOperationalRepository(dbService)

	operationalUseCase := operational.NewOperationalUsecase(dbService, operationalRepository)

	partnershipRepository := partnership.NewPartnershipRepository(dbService)

	partnershipUseCase := partnership.NewPartnershipUsecase(dbService, partnershipRepository, CoordinatorRepository)

	loanManagementRepository := loan_management.NewLoanManagementRepository(dbService)

	loanManagementUseCase := loan_management.NewLoanManagementUsecase(dbService, loanManagementRepository, CoordinatorRepository, partnershipRepository)

	purchaseRepository := purchase.NewPurchaseRepository(dbService)

	purchaseUseCase := purchase.NewPurchaseUsecase(dbService, purchaseRepository)

	stockRepository := stock.NewStockRepository(dbService)

	stockUseCase := stock.NewStockUsecase(dbService, stockRepository)

	salesRepository := sales.NewSalesRepository(dbService)

	salesUseCase := sales.NewSalesUsecase(dbService, salesRepository, operationalRepository)

	server := http.NewServer(authService,
		serverOpts.Config,
		conf.FEHost,
		http.NewUserRoutes(serverOpts.Config, userUsecases, roleUsecases),
		http.NewClientRoutes(serverOpts.Config, clientUsecases),
		http.NewAuthRoutes(serverOpts.Config, authService, userUsecases, roleUsecases),
		http.NewGradeManagementRoutes(serverOpts.Config, gradeDictionaryUsecases),
		http.NewCoordinatorRoutes(serverOpts.Config, CoordinatorUsecases, userUsecases),
		http.NewUniqueCodeRoutes(serverOpts.Config, uniqueCodeUseCases),
		http.NewQueueRequestRoutes(serverOpts.Config, queueRequestUsecase),
		http.NewSalesRoutes(serverOpts.Config, salesUseCase, clientUsecases),
		http.NewInvoiceRoutes(serverOpts.Config, invoiceUsecase),
		http.NewSupplyPowerManagementRoutes(serverOpts.Config, powerSupplyManagementUsecase),
		http.NewShippingRoutes(serverOpts.Config, shippingUsecase),
		http.NewDataLakesRoutes(serverOpts.Config),
		http.NewTaxAndFeeRoutes(serverOpts.Config, taxAndFeeUsecase),
		http.NewBarcodeSystemRoutes(serverOpts.Config, barcodeSystemUseCase, userUsecases),
		http.NewOperationalRoutes(serverOpts.Config, operationalUseCase, salesUseCase),
		http.NewPartnershipRoutes(serverOpts.Config, partnershipUseCase),
		http.NewLoanManagementRoutes(serverOpts.Config, loanManagementUseCase),
		http.NewPurchaseRoutes(serverOpts.Config, purchaseUseCase),
		http.NewStockRoutes(serverOpts.Config, stockUseCase, operationalUseCase),
	)

	log.Fatal(server.Listen(serverOpts.Config.Address()))
}
