import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const criarGuia = async (body: any) => {
  return await axios.post(
    `http://egiquim-sap:50001/b1s/v1/DeliveryNotes`,
    body,
    {
      withCredentials: true,
    }
  );
};

export const useCriarGuiaRemessaSAP = () => {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: criarGuia,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ordensVendaSAP"],
      });
      queryClient.refetchQueries({
        queryKey: ["ordensVendaSAP"],
      });
      console.log("Criacao guia de remessa realizada com sucesso")
    },
    onError: (error) => {
      console.error("Erro na criacao da rececao:", error);
    },
  });
  return mutate;
};
