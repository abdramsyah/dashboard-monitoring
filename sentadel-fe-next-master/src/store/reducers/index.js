import { combineReducers } from "redux";

import bankAccount from "@/store/reducers/bankAccount/reducer";
import auth from "@/store/reducers/auth/reducer";
import clientManagement from "@/store/reducers/clientManagement/reducer";
import userManagement from "@/store/reducers/userManagement/reducer";
import gradeDictionary from "@/store/reducers/gradeDictionary/reducer";
import coordinatorManagement from "@/store/reducers/coordinatorManagement/reducer";
import userRoles from "@/store/reducers/userRoles/reducer";
import uniqueCodeGenerator from "@/store/reducers/uniqueCodeGenerator/reducer";
import goodsInformation from "@/store/reducers/goodsInformation/reducer";
import ascQuequeRequest from "@/store/reducers/ascqueqeurequest/reducer";
import queueRequest from "@/store/reducers/queueRequest/reducer";
import WeightInformation from "@/store/reducers/WeightInformation/reducer";
import GroupingRevision from "@/store/reducers/GroupingRevision/reducer";
import purchasingInformation from "@/store/reducers/purchasingInformation/reducer";
import invoiceList from "@/store/reducers/invoiceList/reducer";
import barcodeSystem from "@/store/reducers/barcodeSystem/reducer";
import shipping from "@/store/reducers/shipping/reducer";
import dataLake from "@/store/reducers/dataLake/reducer";
import goodsHistory from "@/store/reducers/goodsHistory/reducer";
import barcodeScanner from "@/store/reducers/barcodeScanner/reducer";
import taxAndFee from "@/store/reducers/taxAndFee/reducer";

const createRootReducer = () =>
  combineReducers({
    bankAccount,
    auth,
    clientManagement,
    userManagement,
    gradeDictionary,
    // profitTakingDictionary,
    coordinatorManagement,
    // coordinatorGroup,
    userRoles,
    uniqueCodeGenerator,
    goodsInformation,
    ascQuequeRequest,
    queueRequest,
    WeightInformation,
    GroupingRevision,
    purchasingInformation,
    invoiceList,
    barcodeSystem,
    shipping,
    dataLake,
    goodsHistory,
    barcodeScanner,
    taxAndFee,
  });

export default createRootReducer;
