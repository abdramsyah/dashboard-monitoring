import { createReducer } from '@reduxjs/toolkit';
import { setIsAuth, setIsStartUp } from '../actions/auth';

type initStateType = {
  isAuth: boolean;
  isStartUp: boolean;
};

const initialState: initStateType = {
  isAuth: false,
  isStartUp: true
};

export const authReducer = createReducer(initialState, builder => {
  builder.addCase(setIsAuth, (state, { payload }) => {
    return {
      ...state,
      isAuth: payload
    };
  });
  builder.addCase(setIsStartUp, (state, { payload }) => {
    return {
      ...state,
      isStartUp: payload
    };
  });
});
