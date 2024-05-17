import actions from "@/store/reducers/barcodeScanner/actions";

const initialState = {
  loading: false,
  error: null,
  scanDesc: {
    title: "",
    onResult: null,
  },
  aseData: null,
};

export default function assessmentReducer(state = initialState, action: any) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
