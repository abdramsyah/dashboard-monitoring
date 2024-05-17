import { createReducer } from '@reduxjs/toolkit';
import { setHookIsAppended, setHookIsRemoved } from '../actions/hookForm';

type initStateType = {
  isFaAppended: boolean;
  faRemove: {
    isRemoved: boolean;
    key?: string;
  };
};

const initialState: initStateType = {
  isFaAppended: false,
  faRemove: {
    isRemoved: false
  }
};

export const hookFormReducer = createReducer(initialState, builder => {
  builder.addCase(setHookIsAppended, (state, { payload }) => {
    return {
      ...state,
      isFaAppended: payload
    };
  });
  builder.addCase(setHookIsRemoved, (state, { payload }) => {
    return {
      ...state,
      faRemove: payload
    };
  });
});
