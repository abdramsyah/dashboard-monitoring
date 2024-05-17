import actions from "@/store/reducers/clientManagement/actions";

const initialState = {
  loading: false,
  error: null,
  clientData: null,
  supplyPowerManagementData: null,
  recap: null,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
