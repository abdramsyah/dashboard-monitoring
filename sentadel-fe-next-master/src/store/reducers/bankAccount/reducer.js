import actions from "@/store/reducers/bankAccount/actions";

const initialState = {
  loading: false,
  error: null,
  dataBankAccount: null,
};

export default function assessmentReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
