import actions from "@/store/reducers/taxAndFee/actions";

const initialState = {
  taxData: null,
  feeData: null,
  loading: false,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
