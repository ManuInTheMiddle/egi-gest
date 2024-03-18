import { configureStore } from "@reduxjs/toolkit";
import ordemProducaoSlice from "./ordemProducao/ordemProducaoSlice";

export const store = () => {
  return configureStore({
    reducer: {
      ordemProducao: ordemProducaoSlice,
    },
  });
};
export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
