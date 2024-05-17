import actions from "@/store/reducers/uniqueCodeGenerator/actions";

const initialState = {
  loading: false,
  error: null,
  uniqueCode: null,
  validated: null,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    case actions.POST_DATA:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
