import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface possiveisEstadosReator {
  estadoReator: "I" | "E" | "F";
}

interface corpoUpdate {
  numeroOP: number;
  estadoReator: possiveisEstadosReator["estadoReator"];
}

const atualizarEstadoReatorOrdem = async (body: corpoUpdate) => {
  return await axios.patch(
    `http://egiquim-sap:50001/b1s/v1/ProductionOrders(${body.numeroOP})`,
    { U_Reator: body.estadoReator },
    {
      withCredentials: true,
    }
  );
};

export const useAtualizarEstadoReatorOrdemSAP = () => {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: atualizarEstadoReatorOrdem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordensProducaoSAP"] });
      console.log("Estado ordem reator atualizada com sucesso!")
    },
    onError:(error)=>{
      console.log("Erro ao atualizar estado reator SAP:",error)
    }
  });
  return mutate;
};
