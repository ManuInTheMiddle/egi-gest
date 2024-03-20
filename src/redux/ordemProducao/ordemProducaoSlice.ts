import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
  orders: [],
};

export const ordemProducaoSlice = createSlice({
  name: "ordemProducao",
  initialState,
  reducers: {
    getOrders: (state, action) => {
      state.orders = action.payload;
    },
    changeState: (state, action) => {
      const ordemAMudar = state.orders.find(
        (ordem: any) => ordem.id_ordem_producao === action.payload.idOrdem
      );

      if (ordemAMudar) {
        ordemAMudar.status_ordens_producao.id_status_ordem_producao =
          action.payload.estado;
      }
    },
  },
});

export default ordemProducaoSlice.reducer;
export const { getOrders, changeState } = ordemProducaoSlice.actions;
