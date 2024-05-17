import actions from "@/store/reducers/auth/actions";

const initialState = {
  loading: false,
  error: null,
  authData: null,
  menuData: null,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    case actions.LOGOUT:
      return { ...initialState };
    default:
      return state;
  }
}
