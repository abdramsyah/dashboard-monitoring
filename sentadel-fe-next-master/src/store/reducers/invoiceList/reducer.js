import actions from "@/store/reducers/invoiceList/actions";

const initialState = {
  loading: false,
  error: null,
  finalGoods: null,
  invoiceList: null,
  detailInvoice: null,
  loadingInvoice: false,
  loadingDetailInvoice: false,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    case actions.POST_DATA:
      return { ...state, ...action.payload };
    case actions.PUT_DATA:
      return { ...state, ...action.payload };
    case actions.DELETE_DATA:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
