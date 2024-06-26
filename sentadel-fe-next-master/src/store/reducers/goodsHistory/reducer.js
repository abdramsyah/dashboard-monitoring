import actions from "@/store/reducers/goodsHistory/actions";

const initialState = {
  loading: false,
  error: null,
  goodsHistoryData: null,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
