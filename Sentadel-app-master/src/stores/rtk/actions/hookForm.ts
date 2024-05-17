import { createAction } from '@reduxjs/toolkit';
import { ACTION_ENUM } from '../actionEnum';

export const setHookIsAppended = createAction<boolean>(
  ACTION_ENUM.SET_HOOK_IS_APPENDED
);
export const setHookIsRemoved = createAction<{
  isRemoved: boolean;
  key?: string;
}>(ACTION_ENUM.SET_HOOK_IS_REMOVED);
