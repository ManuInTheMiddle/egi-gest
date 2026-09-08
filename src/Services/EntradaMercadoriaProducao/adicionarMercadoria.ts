import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const criarEntradaMercadoriaProducao = async (body: any) => {
  return await axios.post(
    `http://egiquim-sap:50001/b1s/v1/InventoryGenEntries`,
    body,
    {
      withCredentials: true,
    }
  );
};

export const useEntradaMercadoriaProducao = () => {
  const mutate = useMutation({
    mutationFn: criarEntradaMercadoriaProducao,
    onSuccess: () => {
      console.log("Entrada de mercadoria realizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro na entrada de mercadoria :", error);
    },
  });
  return mutate;
};
