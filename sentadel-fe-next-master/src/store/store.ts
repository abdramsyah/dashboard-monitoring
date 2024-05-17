"use client";
import { createStore, applyMiddleware, PreloadedState } from "redux";
import { composeWithDevTools } from "@redux-devtools/extension";

import middlewares, { sagas, sagaMiddleware } from "@/store/middlewares";
import reducers from "@/store/reducers";

export const configureStore = (initialState?: PreloadedState<any>) => {
  const store = createStore(
    reducers(),
    initialState,
    composeWithDevTools(applyMiddleware(...middlewares))
  );
  sagaMiddleware.run(sagas);
  return store;
};

export const store = configureStore();
