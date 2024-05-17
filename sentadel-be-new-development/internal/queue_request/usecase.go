package queuerequest

import (
	"context"
	"fmt"
	"github.com/doug-martin/goqu/v9"
	"math"
	"sentadel-backend/internal/base/database"
	"sentadel-backend/internal/base/errors"
	"sentadel-backend/internal/commons"
	"sentadel-backend/internal/constants"
	"sentadel-backend/internal/coordinator"
	"sentadel-backend/internal/logger"
	"sentadel-backend/internal/user"
	"strconv"

	"go.uber.org/zap"
)

type QueueRequestUsecases interface {
	//UpdateQueueRequestStatus(ctx context.Context, queueId int64, status QueueRequestStatus) (response bool, err error)
	GetCoordinatorDropdownList(ctx context.Context) ([]CoordinatorDropdownResponse, error)
	CreateQueue(ctx context.Context, in []QueueRequestDto, userId int64, isNotMember bool, coordinatorID *int64, coordinatorUserData coordinator.CoordinatorUserDto) (response []QueueRequestModel, err error)
	UpdateStatusQueue(ctx context.Context, in UpdateStatusQueueDto, status constants.SupplyStatus, userID int64) (response bool, err error)
	GetQueueDeliveryData(ctx context.Context, deliveryNumber int64) (QueueDeliveryDataModel, error)
	GetQueueList(ctx context.Context, listDto QueueRequestListDto) (QueueListResponse, error)
	GetQueueGroup(ctx context.Context, listDto QueueRequestListDto, userID *int64) (QueueGroupResponse, error)
	GetBucketListByQueueIds(ctx context.Context, queueIds []int64) (BucketInformationResponse, error)
	PourOutBucket(ctx context.Context, models CreateGoodsReqModel, userID int64) (response []CreateGoodsResModel, err error)

	GetQueueGroupDetail(ctx context.Context, dto QueueGroupDetailDto) ([]QueueGroupDetailModel, error)
	GetBarcodeDetail(ctx context.Context, barcode string) (response *BucketScanModel, err error)
}

type queueRequestUsecase struct {
	database.TxManager
	QueueRequestRepository
	user.UserRepository
	commons.CommonsRepository
	coordinator.CoordinatorUsecases
}

func NewUsecase(manager database.TxManager, repository QueueRequestRepository,
	userRepository user.UserRepository, commonsRepository commons.CommonsRepository,
	coordinatorUsecase coordinator.CoordinatorUsecases) *queueRequestUsecase {
	return &queueRequestUsecase{
		manager,
		repository,
		userRepository,
		commonsRepository,
		coordinatorUsecase,
	}
}

func (c queueRequestUsecase) GetCoordinatorDropdownList(ctx context.Context) ([]CoordinatorDropdownResponse, error) {
	return c.QueueRequestRepository.GetCoordinatorDropdownList(ctx)
}

func (c queueRequestUsecase) CreateQueue(ctx context.Context, in []QueueRequestDto, userId int64, isNotMember bool,
	coordinatorID *int64, coordinatorUserData coordinator.CoordinatorUserDto) (response []QueueRequestModel, err error) {

	// Transaction demonstration
	err = c.RunTx(ctx, func(ctx context.Context) error {
		if isNotMember && coordinatorID == nil {
			createCoordinator, err := c.CoordinatorUsecases.Create(ctx, coordinatorUserData)
			if err != nil {
				logger.ContextLogger(ctx).Error("error when add coordinator to db", zap.Error(err))
				return err
			}
			coordinatorID = &createCoordinator.ID
		} else if !isNotMember && coordinatorID == nil {
			coordinatorID, err = c.QueueRequestRepository.GetCoordinatorId(ctx, userId)
			if err != nil {
				return err
			}
		}

		var validated []QueueRequestModel
		var notValid []QueueRequestModel

		for _, queue := range in {
			model, err := queue.MapToModel(*coordinatorID)
			if err != nil {
				notValid = append(notValid, model)
			}

			validated = append(validated, model)
		}

		if len(validated) == 0 {
			response = notValid

			return errors.Wrap(err, errors.RequestDataNotValid, "All/some request data not valid")
		}

		_, err := c.QueueRequestRepository.CreateQueue(ctx, validated, *coordinatorID)
		if err != nil {
			logger.ContextLogger(ctx).Error("error when add queue request to db", zap.Error(err))
			return err
		}

		response = notValid

		return nil
	})

	return response, err
}

func (c queueRequestUsecase) UpdateStatusQueue(ctx context.Context, in UpdateStatusQueueDto, status constants.SupplyStatus, userID int64) (response bool, err error) {
	fmt.Println("UpdateStatusQueue - in", in)

	model, err := in.MapToModel()
	if err != nil {
		return response, err
	}

	err = c.RunTx(ctx, func(ctx context.Context) error {
		var nonExist []int64
		var queueIds []int64

		for _, queue := range model.QueueData {
			queueIds = append(queueIds, queue.ID)
		}

		if status == constants.Approved {
			exist, err := c.CommonsRepository.CheckExistIDs(
				ctx, queueIds, "queue_delivery_list",
				"queue_supplies_id", false)

			if err != nil && err.Error() != "Data not found" {
				logger.ContextLogger(ctx).Error("Checking existing approved queue error", zap.Error(err))
				return err
			}

			for _, val := range queueIds {
				existID := "exist" + strconv.FormatInt(val, 10)

				if !exist.MapID[existID] {
					nonExist = append(nonExist, val)
				}
			}

			if len(nonExist) == 0 {
				return errors.Wrap(err, errors.InvalidDataError, "All queue already approved")
			}

			fmt.Println("UpdateStatusQueue - ScheduledArrivalDate", in.ScheduledArrivalDate)
			do := createDeliveryNumber(model.CoordinatorCode, model.ScheduledArrivalDate)

			whereArgs := []commons.WhereArgModel{
				{"delivery_number", goqu.Op{"eq": do}}}

			qdID, _ := c.CommonsRepository.CheckExistID(
				ctx, 0, "queue_delivery", "id",
				false, whereArgs...)

			fmt.Println("UpdateStatusQueue - qdID", qdID)

			if qdID == 0 {
				_, err = c.QueueRequestRepository.CreateQueueDelivery(ctx, model, userID)
				if err != nil {
					logger.ContextLogger(ctx).Error("error when approve queue", zap.Error(err))
					return err
				}
			} else {
				model.QueueDeliveryID = &qdID
				_, err = c.QueueRequestRepository.UpdateQueueDeliveryList(ctx, model, userID)
				if err != nil {
					logger.ContextLogger(ctx).Error("error when approve queue", zap.Error(err))
					return err
				}
			}
		} else {
			_, err = c.QueueRequestRepository.UpdateStatusQueue(ctx, queueIds, constants.Rejected, userID)
			if err != nil {
				logger.ContextLogger(ctx).Error("error when reject queue", zap.Error(err))
				return err
			}
		}

		response = true

		return nil
	})

	return response, err
}

func (c queueRequestUsecase) GetQueueDeliveryData(ctx context.Context, deliveryNumber int64) (QueueDeliveryDataModel, error) {
	response := QueueDeliveryDataModel{
		QueueDeliveryModel: QueueDeliveryModel{},
		List:               nil,
	}

	delivery, err := c.QueueRequestRepository.GetQueueDelivery(ctx, deliveryNumber)
	if err != nil {
		return QueueDeliveryDataModel{}, err
	}
	response.QueueDeliveryModel = *delivery

	bucketList, err := c.QueueRequestRepository.GetBucketInformationListByQueueIds(ctx, delivery.QueueIds)
	if err != nil {
		return response, err
	}
	response.List = bucketList

	return response, err
}

func (c queueRequestUsecase) GetQueueList(ctx context.Context, listDto QueueRequestListDto) (QueueListResponse, error) {
	searchResponse, err := c.QueueRequestRepository.GetQueueList(ctx, listDto)
	if err != nil {
		return QueueListResponse{}, err
	}

	response := QueueListResponse{
		List: []QueueResponse{},
		Meta: user.Meta{
			Page:  int(listDto.Page),
			Limit: int(listDto.Limit),
			Pages: 0,
		},
	}

	if len(searchResponse) < 1 || searchResponse == nil {
		return response, nil
	}

	total := float64(searchResponse[0].Total)
	limit := float64(listDto.Limit)

	response.List = searchResponse
	response.Meta.Pages = int(math.Ceil(total / limit))

	return response, err
}

func (c queueRequestUsecase) GetQueueGroup(ctx context.Context, listDto QueueRequestListDto, userID *int64) (QueueGroupResponse, error) {
	searchResponse, err := c.QueueRequestRepository.GetQueueGroup(ctx, listDto, userID)
	if err != nil {
		return QueueGroupResponse{}, err
	}

	response := QueueGroupResponse{
		List: []QueueGroupModel{},
		Meta: user.Meta{
			Page:  int(listDto.Page),
			Limit: int(listDto.Limit),
			Pages: 0,
		},
	}

	if len(searchResponse) < 1 || searchResponse == nil {
		return response, nil
	}

	total := float64(searchResponse[0].Total)
	limit := float64(listDto.Limit)

	response.List = searchResponse
	response.Meta.Pages = int(math.Ceil(total / limit))

	return response, err
}

func (c queueRequestUsecase) GetBucketListByQueueIds(ctx context.Context, queueIds []int64) (BucketInformationResponse, error) {
	searchResponse, err := c.QueueRequestRepository.GetBucketListByQueueIds(ctx, queueIds)
	if err != nil {
		return BucketInformationResponse{}, err
	}

	response := BucketInformationResponse{
		List: []BucketInformationModel{},
	}

	if len(searchResponse) < 1 || searchResponse == nil {
		return response, nil
	}

	response.List = searchResponse

	return response, err
}

func (c queueRequestUsecase) PourOutBucket(ctx context.Context, models CreateGoodsReqModel, userID int64) (response []CreateGoodsResModel, err error) {
	err = c.RunTx(ctx, func(ctx context.Context) error {
		var nonExistent []CreateGoodsResModel
		var nonExistentApproveIds []int64
		var nonExistentRejectIds []int64

		bucketInformation, err := c.QueueRequestRepository.GetBucketAndGoodsInformationBySerialNumber(ctx, models.Data)
		if err != nil {
			logger.ContextLogger(ctx).Error("Error when trying to get bucket ids", zap.Error(err))
			return err
		}

		if len(bucketInformation) > 0 {
			for _, bucket := range bucketInformation {
				if bucket.CurrentStatus == constants.ScanToApprove {
					nonExistentApproveIds = append(nonExistentApproveIds, bucket.BucketID)
				} else if bucket.CurrentStatus == constants.ScanToReject {
					nonExistentRejectIds = append(nonExistentRejectIds, bucket.BucketID)
				} else {
					response = append(response, bucket)
				}
			}
		}

		if len(nonExistentApproveIds) > 0 {
			nonExistent, err = c.QueueRequestRepository.CreateGoods(ctx, nonExistentApproveIds, userID)
			if err != nil {
				logger.ContextLogger(ctx).Error("Error when trying to create goods", zap.Error(err))
				return err
			}
			response = append(response, nonExistent...)
		}

		if len(nonExistentRejectIds) > 0 {
			nonExistent, err = c.QueueRequestRepository.RejectBucket(ctx, nonExistentRejectIds, userID)
			if err != nil {
				logger.ContextLogger(ctx).Error("Error when trying to reject bucket", zap.Error(err))
				return err
			}
			response = append(response, nonExistent...)
		}

		return nil
	})

	return response, err
}

func (c queueRequestUsecase) GetQueueGroupDetail(ctx context.Context, dto QueueGroupDetailDto) ([]QueueGroupDetailModel, error) {
	res, err := c.QueueRequestRepository.GetQueueGroupDetail(ctx, dto)
	if err != nil {
		return nil, err
	}

	return res, err
}

func (c queueRequestUsecase) GetBarcodeDetail(ctx context.Context, barcode string) (response *BucketScanModel, err error) {
	response, err = c.QueueRequestRepository.GetBarcodeDetail(ctx, barcode)
	if err != nil {
		return nil, err
	}

	return response, err
}
