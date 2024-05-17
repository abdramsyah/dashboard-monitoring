import actions from "@/store/reducers/purchasingInformation/actions";

const initialState = {
  loading: false,
  error: null,
  goodInformationList: null,
  goodInformationData: null,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    case actions.GET_PURCHASING_INFORMATION_LIST:
      return { ...state, ...action.payload };
    case actions.GET_PURCHASING_INFORMATION_DATA:
      return { ...state, ...action.payload };
    case actions.MARK_GOODS_AS_APPROVED:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
