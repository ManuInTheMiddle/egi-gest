import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const criarRececao = async (body: any) => {
  return await axios.post(
    `http://egiquim-sap:50001/b1s/v1/PurchaseDeliveryNotes`,
    body,
    {
      withCredentials: true,
    }
  );
};

export const useLancarRececaoSAP = () => {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: criarRececao,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rececoesMercadoriaSAP", "ordemCompraSAP"],
      });
      console.log("Rececao de mercadoria realizada com sucesso!")
    },
    onError: (error) => {
      console.error("Erro na criacao da rececao:", error);
    },
  });
  return mutate;
};
