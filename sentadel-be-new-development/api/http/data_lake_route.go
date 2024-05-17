package http

const (
	DataLakeRoute = "/data-lake"
)

type DataLakesRoutes struct {
	config Config
}

func NewDataLakesRoutes(config Config) *DataLakesRoutes {
	return &DataLakesRoutes{
		config: config,
	}
}

func (dlr *DataLakesRoutes) AddRoutes(router *Server) {
	// route := router.Engine.Group(OneGatePrefix)

	// data lake
	//route.GET(DataLakeRoute+"/get-list", dlr.getDataLake)
}

//func (dlr *DataLakesRoutes) getDataLake(ctx *gin.Context) {
//	var dto models.SearchRequest
//	reqInfo := getReqInfo(ctx)
//
//	if _, ok := reqInfo.Permissions[string(constants.DATA_LAKE)]; ok {
//		if err := ctx.BindQuery(&dto); err != nil {
//			fmt.Println(err.Error())
//			errorResponse(err, nil, dlr.config.DetailedError()).reply(ctx)
//			return
//		}
//		resData, err := dlr.coordinatorSuppliesUseCase.GetDataLake(contextWithReqInfo(ctx), dto)
//		if err != nil {
//			errorResponse(err, nil, dlr.config.DetailedError()).reply(ctx)
//			return
//		}
//
//		okResponse(resData).reply(ctx)
//		return
//	}
//
//	return
//}
