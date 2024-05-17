import { RoleEnum } from "@/types/auth";
import actions from "@/store/reducers/userRoles/actions";

type initialType = {
  loading: false;
  error: any | null;
  rolesData: RoleEnum[] | null;
  selectedRole: RoleEnum | null;
};

const initialState: initialType = {
  loading: false,
  error: null,
  rolesData: null,
  selectedRole: null,
};

export default function assessmentReducer(state = initialState, action: any) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
