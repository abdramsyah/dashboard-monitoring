import actions from "@/store/reducers/goodsInformation/actions";

const initialState = {
  loading: false,
  error: null,
  goodInformationEntryData: null,
  profitDropdown: null,
  gradePrice: null,
  laodingProfit: false,
  CoordinatorDropdown: null,
  bucketList: null,
  loadingCoordinator: false,
  clientDropdown: null,
  loadingClient: false,
  loadingBucket: false,
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
