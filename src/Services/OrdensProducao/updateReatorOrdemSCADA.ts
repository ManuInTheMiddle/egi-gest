import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface possiveisReatores {
  reator: number;
}
interface corpoUpdate {
  numeroOP: number;
  Reator: possiveisReatores["reator"];
}

const atualizarReatorOrdemSCADA = async (body: corpoUpdate) => {
  return await axios.patch(
    `http://DESKTOP-74D6VT2:8080/api/ordemProducao/numOP/${body.numeroOP}`,
    { Reator: body.Reator },
    {
      withCredentials: false,
    }
  );
};

export const useAtualizarReatorOrdemSCADA = () => {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: atualizarReatorOrdemSCADA,
    onSuccess: () => {
      console.log("Ordem SCADA atualizada com sucesso");
    },
    onError:(error)=>{
      console.log("Erro ao atualizar ordem SCADA")
    }
  });
  return mutate;
};
