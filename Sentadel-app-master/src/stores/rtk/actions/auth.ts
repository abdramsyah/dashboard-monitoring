import { createAction } from '@reduxjs/toolkit';
import { ACTION_ENUM } from '../actionEnum';

export const setIsAuth = createAction<boolean>(ACTION_ENUM.SET_IS_AUTH);
export const setIsStartUp = createAction<boolean>(ACTION_ENUM.SET_IS_START_UP);
