import actions from "./actions";

const initialState = {
  loading: false,
  error: null,
  barcodeSystem: null,
  isScannedIn: true,
  adminEntry: null,
  barcodeSales: null,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    case actions.POST_DATA:
      return { ...state, ...action.payload };
    case actions.PUT_DATA:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
