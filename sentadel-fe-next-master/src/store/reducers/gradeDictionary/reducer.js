import actions from "@/store/reducers/gradeDictionary/actions";

const initialState = {
  loading: false,
  error: null,
  gradeData: null,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
