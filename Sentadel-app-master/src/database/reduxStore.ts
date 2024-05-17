import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@sentadell-src/stores/rtk/reducers/auth';
import { hookFormReducer } from '@sentadell-src/stores/rtk/reducers/hookForm';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hookForm: hookFormReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
