import {
  BaseSearchParams,
  SearchFilterSortParams,
  SuccessResponseType,
} from "@/types/global";
import { httpClient } from "../httpClient";
import { ENDPOINT } from "./endpoint";
import { CoordinatorManagementModel } from "@/types/coordinators";
import {
  GroupedPartnerModel,
  PartnerModel,
  PartnershipFormProps,
} from "@/types/partnership";
import {
  AddNewRepaymentPayload,
  LoanManagementFormProps,
  LoanModel,
} from "@/types/loan-management";
import { QueueRequestManagementPayload } from "@/types/queue";
import { GetGoodsModel, GoodsInformationFilterSortParams } from "@/types/goods";
import {
  BucketData,
  DeliveryDetail,
  DeliveryWithStatusAccumModel,
  ValidateGoodsPayload,
} from "@/types/purchase";
import { InvoiceDetail, ManageInvoiceStatusPayload } from "@/types/invoice";
import {
  GetStockDetailModel,
  GetStockListNewParams,
  GetStockListParams,
  GetStockSummaryModel,
} from "@/types/stock";
import { GradeModel } from "@/types/grades";
import { ClientBarcodeGroupModel } from "@/types/barcodeSystem";
import { GradingQueueData, GradingQueueResModel } from "@/types/grading";
import { AddressModel, ClientModel } from "@/types/clients";
import {
  GroupingDetailModel,
  GroupingDetailPayload,
  GroupingModel,
  UpdateGroupingParamsDto,
} from "@/types/grouping";

export const addNewPartner = (
  payload: PartnershipFormProps
): Promise<SuccessResponseType<unknown, PartnershipFormProps>> =>
  httpClient.post(ENDPOINT.PARTNERSHIP, payload);

export const updatePartner = (
  payload: PartnershipFormProps
): Promise<SuccessResponseType<unknown, PartnershipFormProps>> =>
  httpClient.put(ENDPOINT.PARTNERSHIP, payload);

export const getGroupedPartners = (
  params: SearchFilterSortParams
): Promise<
  SuccessResponseType<GroupedPartnerModel[], SearchFilterSortParams>
> => httpClient.get(ENDPOINT.GET_GROUPED_PARTNER, { params });

export const getPartners = (
  params?: SearchFilterSortParams
): Promise<SuccessResponseType<PartnerModel[], SearchFilterSortParams>> =>
  httpClient.get(ENDPOINT.PARTNERSHIP, { params });

export const addNewLoan = (
  payload: LoanManagementFormProps
): Promise<SuccessResponseType<unknown, LoanManagementFormProps>> =>
  httpClient.post(ENDPOINT.LOAN_MANAGEMENT, payload);

export const updateLoan = (
  payload: LoanManagementFormProps
): Promise<SuccessResponseType<unknown, LoanManagementFormProps>> =>
  httpClient.put(ENDPOINT.LOAN_MANAGEMENT, payload);

export const getLoanList = (
  params: SearchFilterSortParams
): Promise<SuccessResponseType<LoanModel[], SearchFilterSortParams>> =>
  httpClient.get(ENDPOINT.LOAN_MANAGEMENT, { params });

export const getCoodinatorList = (
  params?: BaseSearchParams
): Promise<
  SuccessResponseType<CoordinatorManagementModel[], BaseSearchParams>
> => httpClient.get(ENDPOINT.COORDINATOR, { params });

export const createQueueRequest = (
  payload: QueueRequestManagementPayload
): Promise<SuccessResponseType<unknown, QueueRequestManagementPayload>> =>
  httpClient.post(ENDPOINT.CREATE_QUEUE, payload);

export const getGoodsInformation = (
  payload: GoodsInformationFilterSortParams
): Promise<
  SuccessResponseType<GetGoodsModel[], GoodsInformationFilterSortParams>
> => httpClient.get(ENDPOINT.GET_GOODS_INFO, { params: payload });

export const getDeliveryWithStatusAccum = (
  payload: SearchFilterSortParams
): Promise<
  SuccessResponseType<DeliveryWithStatusAccumModel[], SearchFilterSortParams>
> => httpClient.get(ENDPOINT.PAYMENT_MANAGEMENT, { params: payload });

export const getPurchaseDeliveryDetail = (
  payload: string
): Promise<SuccessResponseType<DeliveryDetail, string>> =>
  httpClient.get(`${ENDPOINT.PAYMENT_MANAGEMENT}/${payload}`);

export const validateGoodsData = (
  payload: ValidateGoodsPayload
): Promise<SuccessResponseType<unknown, ValidateGoodsPayload>> =>
  httpClient.post(ENDPOINT.PAYMENT_MANAGEMENT, payload);

export const getPurchaseInvoiceDetail = (
  payload: number
): Promise<SuccessResponseType<InvoiceDetail, string>> =>
  httpClient.get(`${ENDPOINT.INVOICE_MANAGEMENT}/invoice-id/${payload}`);

export const postRepayment = (
  payload: AddNewRepaymentPayload
): Promise<SuccessResponseType<unknown, AddNewRepaymentPayload>> =>
  httpClient.post(ENDPOINT.REPAYMENT, payload);

export const getInvoiceList = (
  payload: SearchFilterSortParams
): Promise<SuccessResponseType<InvoiceDetail[], SearchFilterSortParams>> =>
  httpClient.get(ENDPOINT.INVOICE_MANAGEMENT, { params: payload });

export const manageInvoiceStatus = (
  payload: ManageInvoiceStatusPayload
): Promise<SuccessResponseType<InvoiceDetail[], ManageInvoiceStatusPayload>> =>
  httpClient.post(ENDPOINT.INVOICE_MANAGEMENT, payload);

export const getPendingValidation = (
  payload: SearchFilterSortParams
): Promise<SuccessResponseType<GetGoodsModel[], SearchFilterSortParams>> =>
  httpClient.get(ENDPOINT.PENDING_VALIDATION, { params: payload });

export const getStockList = (
  payload: GetStockListParams
): Promise<SuccessResponseType<BucketData[], GetStockListParams>> =>
  httpClient.get(ENDPOINT.STOCK_LIST, { params: payload });

export const getStockDetail = (
  serialNumber: string
): Promise<SuccessResponseType<GetStockDetailModel, string>> =>
  httpClient.get(`${ENDPOINT.STOCK_LIST}/${serialNumber}`);

export const updateStockGradeInformation = (
  payload: GradingQueueData[]
): Promise<SuccessResponseType<GradingQueueResModel[], GradingQueueData[]>> =>
  httpClient.put(ENDPOINT.STOCK_UPDATE_GRADE, { data: payload });

export const getAllGrade = (payload?: {
  client_id?: number;
}): Promise<SuccessResponseType<GradeModel[], { client_id?: number }>> =>
  httpClient.get(ENDPOINT.GET_ALL_GRADE, { params: payload });
export const getSalesBarcode = (): Promise<
  SuccessResponseType<ClientBarcodeGroupModel[]>
> => httpClient.get(ENDPOINT.GET_SALES_BARCODE);

export const getStockSummary = (
  payload: Omit<GetStockListNewParams, "sort_by">
): Promise<
  SuccessResponseType<
    GetStockSummaryModel,
    Omit<GetStockListNewParams, "sort_by">
  >
> => httpClient.get(ENDPOINT.STOCK_SUMMARY, { params: payload });

export const getClientList = (
  payload: SearchFilterSortParams
): Promise<SuccessResponseType<ClientModel[], SearchFilterSortParams>> =>
  httpClient.get(ENDPOINT.CLIENT_MANAGEMENT, { params: payload });

export const getGroupingList = (
  payload: SearchFilterSortParams
): Promise<SuccessResponseType<GroupingModel[], SearchFilterSortParams>> =>
  httpClient.get(ENDPOINT.GROUPING, { params: payload });

export const getGroupingDetail = (
  keyParam: string | number,
  payload: SearchFilterSortParams
): Promise<SuccessResponseType<GroupingDetailModel, GroupingDetailPayload>> =>
  httpClient.get(`${ENDPOINT.GROUPING}/${keyParam}`, { params: payload });

export const updateGroupingList = (
  payload: UpdateGroupingParamsDto
): Promise<SuccessResponseType<unknown, UpdateGroupingParamsDto>> =>
  httpClient.put(ENDPOINT.GROUPING, payload);

export const manageAddress = (
  payload: AddressModel
): Promise<SuccessResponseType<unknown, AddressModel>> =>
  httpClient.post(ENDPOINT.ADDRESS, payload);
