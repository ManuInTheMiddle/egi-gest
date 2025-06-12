import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const BASE_API_URL = process.env.NEXT_PUBLIC_SCADA_BASE_URL;

interface ApagarReceitasSCADAI {
  id: string;
}

const apagarReceitaSCADA = async(id: ApagarReceitasSCADAI["id"]) => {
  return await axios
    .delete(`${BASE_API_URL}/api/receita/id/${id}`)
    .then((response) => {
      console.log(response.data);
      console.log(response.data.SessionId);
    });
};

export const useApagarReceitaSCADA = () => {
  const mutate = useMutation({
    mutationKey:["apagarReceitaScada"],
    mutationFn: apagarReceitaSCADA,
    onSuccess: () => {
      console.log("Receita SCADA apagada com sucesso!")
    },
    onError: (error) => {
      console.error("Erro ao apagar receita SCADA:", error);
    },
  });
  return mutate;
};
