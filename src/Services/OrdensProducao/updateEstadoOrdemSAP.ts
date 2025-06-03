import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface possiveisEstados {
  estado: "boposPlanned" | "boposReleased" | "boposClosed" | "boposCancelled";
}
interface corpoUpdate {
  numeroOP: number;
  estado: possiveisEstados["estado"];
}

const atualizarEstadoOrdem = async (body: corpoUpdate) => {
  return await axios.patch(
    `http://egiquim-sap:50001/b1s/v1/ProductionOrders(${body.numeroOP})`,
    { ProductionOrderStatus: body.estado },
    {
      withCredentials: true,
    }
  );
};

export const useAtualizarEstadoOrdemSAP = () => {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: atualizarEstadoOrdem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordensProducaoSAP"] });
      console.log("Estado ordem SAP atualizada com sucesso!")
    },
    onError:(error)=>{
      console.log("Erro ao atualizar estado ordem SAP:",error)
    }
  });
  return mutate;
};
