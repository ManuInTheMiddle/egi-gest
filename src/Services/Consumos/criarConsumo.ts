import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const criarConsumoSAP = async (body: any) => {
  return await axios.post(
    `http://egiquim-sap:50001/b1s/v1/InventoryGenExits`,
    body,
    {
      withCredentials: true,
    }
  );
};

export const useConsumoSAP = () => {
  //const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: criarConsumoSAP,
    onSuccess: () => {
      console.log("Consumo realizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro no consumo de materia prima:", error);
    },
  });
  return mutate;
};
