import { all } from "redux-saga/effects";

import bankAccountSaga from "../reducers/bankAccount/sagas";
import authSaga from "../reducers/auth/sagas";
import clientManagementSaga from "../reducers/clientManagement/sagas";
import userManagementSaga from "../reducers/userManagement/sagas";
import gradeDictionarySaga from "../reducers/gradeDictionary/sagas";
// import profitTakingDictionarySaga from "../reducers/profitTakingDictionary/sagas";
import coordinatorManagementSaga from "../reducers/coordinatorManagement/sagas";
// import coordinatorGroupSaga from "../reducers/coordinatorGroup/sagas";
import userRolesSaga from "../reducers/userRoles/sagas";
import uniqueCodeGeneratorSaga from "../reducers/uniqueCodeGenerator/sagas";
import goodsInformationEntrySagas from "../reducers/goodsInformation/sagas";
import ascqueqeurequestSagas from "../reducers/ascqueqeurequest/sagas";
import queueRequestSaga from "../reducers/queueRequest/sagas";
import weightInformationEntry from "../reducers/WeightInformation/sagas";
import groupingRevisionSagas from "../reducers/GroupingRevision/sagas";
import goodsInformationSagas from "../reducers/purchasingInformation/sagas";
import listInvoiceSagas from "../reducers/invoiceList/sagas";
import barcodeSystemSagas from "../reducers/barcodeSystem/sagas";
import shippingSagas from "../reducers/shipping/sagas";
import dataLakeSagas from "../reducers/dataLake/sagas";
import goodsHistorySaga from "../reducers/goodsHistory/sagas";
import barcodeScannerSaga from "../reducers/barcodeScanner/sagas";
import taxAndFeeSagas from "../reducers/taxAndFee/sagas";

export default function* rootSaga() {
  yield all([
    bankAccountSaga(),
    authSaga(),
    clientManagementSaga(),
    userManagementSaga(),
    gradeDictionarySaga(),
    // profitTakingDictionarySaga(),
    // coordinatorGroupSaga(),
    coordinatorManagementSaga(),
    goodsInformationEntrySagas(),
    userRolesSaga(),
    uniqueCodeGeneratorSaga(),
    ascqueqeurequestSagas(),
    queueRequestSaga(),
    weightInformationEntry(),
    groupingRevisionSagas(),
    goodsInformationSagas(),
    listInvoiceSagas(),
    barcodeSystemSagas(),
    shippingSagas(),
    dataLakeSagas(),
    goodsHistorySaga(),
    barcodeScannerSaga(),
    taxAndFeeSagas(),
  ]);
}
