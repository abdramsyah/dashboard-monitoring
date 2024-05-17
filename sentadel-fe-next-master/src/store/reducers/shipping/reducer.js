import actions from "@/store/reducers/shipping/actions";

const initialState = {
  loading: false,
  error: null,
  shippingList: null,
  detailShipping: null,
  listAdress: null,
  detailGrouping: null,
  listGrouping: null,
  loadingListAdress: false,
  loadingClient: false,
  loadingGrouping: false,
  loadingDetailGrouping: false,
  loadingDetailShipping: false,
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
