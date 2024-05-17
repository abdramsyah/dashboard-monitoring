import actions from "@/store/reducers/coordinatorManagement/actions";

const initialState = {
  action: null,
  loading: false,
  error: null,
  coordinatorData: null,
  coordinator: null,
  isSuccessAdd: null,
  coordinatorPerformance: null,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
