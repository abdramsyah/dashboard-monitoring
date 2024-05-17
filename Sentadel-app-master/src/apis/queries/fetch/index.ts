import { ENDPOINT } from '@sentadell-src/apis/endpoint';
import { httpClient } from '@sentadell-src/apis/httpClient';
import { GradingQueueData } from '@sentadell-src/stores/realm/schemas/grading';
import { GroupingQueueData } from '@sentadell-src/stores/realm/schemas/grouping';
import { UsersDataType, LoginPayloadType } from '@sentadell-src/types/auth';
import { ClientModel } from '@sentadell-src/types/clients';
import {
  SearchFilterSortParams,
  SearchFilterSortParamsOpt,
  SuccessResponseType
} from '@sentadell-src/types/global';
import {
  GoodsInformationListPayload,
  GetGoodsModel
} from '@sentadell-src/types/goods';
import { GradeModel } from '@sentadell-src/types/grades';
import {
  ClientBarcodeGroupModel,
  ClientBarcodeMode,
  GradingQueueResModel
} from '@sentadell-src/types/grading';
import {
  GoodsDataForGroupingModel,
  GoodsDataForGroupingParams,
  GroupingDetailModel,
  GroupingDetailPayload,
  GroupingModel
} from '@sentadell-src/types/grouping';
import { InvoiceDetail } from '@sentadell-src/types/invoices';
import { PartnerModel } from '@sentadell-src/types/partner';
import {
  BarcodeDetailModel,
  CreateGoodsResModel,
  PourOutPayloadType,
  QueueGroupDetailModel,
  QueueGroupDetailPayload,
  QueueGroupModel,
  QueueGroupPayload,
  QueueRequestProps
} from '@sentadell-src/types/queue';
import { SetWeightModel } from '@sentadell-src/types/weigh';

export const postLogin = (
  payload: LoginPayloadType
): Promise<SuccessResponseType<UsersDataType, LoginPayloadType>> =>
  httpClient.post(ENDPOINT.LOGIN, payload);

export const pourOut = (
  payload: PourOutPayloadType
): Promise<SuccessResponseType<CreateGoodsResModel[], PourOutPayloadType>> =>
  httpClient.post(ENDPOINT.POUR_OUT, payload);

export const getQueueGroup = (
  payload: QueueGroupPayload
): Promise<SuccessResponseType<QueueGroupModel[], QueueGroupPayload>> =>
  httpClient.get(`${ENDPOINT.QUEUE_GROUP}`, {
    params: payload
  });

export const getPartners = (
  payload?: SearchFilterSortParams
): Promise<SuccessResponseType<PartnerModel[], SearchFilterSortParams>> =>
  httpClient.get(ENDPOINT.PARTNERSHIP, { params: payload });

export const getQueueGroupDetail = (
  payload: QueueGroupDetailPayload
): Promise<
  SuccessResponseType<QueueGroupDetailModel[], QueueGroupDetailPayload>
> =>
  httpClient.get(ENDPOINT.QUEUE_GROUP_DETAIL, {
    params: payload
  });

export const createQueueRequest = (
  payload: QueueRequestProps
): Promise<SuccessResponseType<unknown, QueueRequestProps>> =>
  httpClient.post(`${ENDPOINT.CREATE_QUEUE}`, payload);

export const getBarcodeDetail = (
  barcode: string
): Promise<SuccessResponseType<BarcodeDetailModel, string>> =>
  httpClient.get(`${ENDPOINT.GET_BARCODE_DETAIL}/${barcode}`);

export const getSalesBarcode = (
  payload: ClientBarcodeMode
): Promise<SuccessResponseType<ClientBarcodeGroupModel[], ClientBarcodeMode>> =>
  httpClient.get(ENDPOINT.GET_SALES_BARCODE, { params: payload });

export const getAllGrade = (): Promise<SuccessResponseType<GradeModel[]>> =>
  httpClient.get(ENDPOINT.GET_ALL_GRADE);

export const createGradeInformation = (
  payload: GradingQueueData[]
): Promise<SuccessResponseType<GradingQueueResModel[], GradingQueueData[]>> =>
  httpClient.post(ENDPOINT.GRADING, { data: payload });

export const updateGradeInformation = (
  payload: GradingQueueData[]
): Promise<SuccessResponseType<GradingQueueResModel[], GradingQueueData[]>> =>
  httpClient.put(ENDPOINT.GRADING, { data: payload });

export const getGoodsInformation = (
  payload: GoodsInformationListPayload
): Promise<SuccessResponseType<GetGoodsModel[], GoodsInformationListPayload>> =>
  httpClient.get(ENDPOINT.GET_GOODS_INFO, { params: payload });

export const getGoodsDetail = (
  payload: string
): Promise<SuccessResponseType<GetGoodsModel, string>> =>
  httpClient.get(`${ENDPOINT.GET_GOODS_INFO}/${payload}`);

export const setWeight = (
  payload: SetWeightModel
): Promise<SuccessResponseType<unknown, SetWeightModel>> =>
  httpClient.post(ENDPOINT.SET_WEIGHT, payload);

export const getInvoiceList = (
  payload: SearchFilterSortParams
): Promise<SuccessResponseType<InvoiceDetail[], SearchFilterSortParams>> =>
  httpClient.get(ENDPOINT.INVOICE_MANAGEMENT, { params: payload });

export const getInvoiceDetail = (
  payload: string
): Promise<SuccessResponseType<InvoiceDetail, string>> =>
  httpClient.get(`${ENDPOINT.INVOICE_MANAGEMENT}/invoice-number/${payload}`);

export const getGoodsListForGrouping = (
  payload: GoodsDataForGroupingParams[]
): Promise<
  SuccessResponseType<GoodsDataForGroupingModel[], GoodsDataForGroupingParams>
> => httpClient.post(`${ENDPOINT.GROUPING}/sync`, { data: payload });

export const createGrouping = (
  payload: GoodsDataForGroupingParams[]
): Promise<
  SuccessResponseType<GroupingQueueData, GoodsDataForGroupingParams>
> => httpClient.post(ENDPOINT.GROUPING, { data: payload });

export const getGroupingList = (
  payload: SearchFilterSortParamsOpt
): Promise<SuccessResponseType<GroupingModel[], SearchFilterSortParamsOpt>> =>
  httpClient.get(ENDPOINT.GROUPING, { params: payload });

export const getGroupingDetail = (
  keyParam: string | number,
  payload: GroupingDetailPayload
): Promise<SuccessResponseType<GroupingDetailModel, GroupingDetailPayload>> =>
  httpClient.get(`${ENDPOINT.GROUPING}/${keyParam}`, { params: payload });

export const getClients = (): Promise<SuccessResponseType<ClientModel[]>> =>
  httpClient.get(ENDPOINT.GET_CLIENTS);

// export const createShipment = (
//   payload: LoginPayloadType
// ): Promise<SuccessResponseType<UsersDataType, LoginPayloadType>> =>
//   httpClient.post(ENDPOINT.LOGIN, payload);
