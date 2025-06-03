import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface ApagarReceitasSCADAI {
  id: string;
}

const apagarReceitaSCADA = async(id: ApagarReceitasSCADAI["id"]) => {
  return await axios
    .delete(`http://DESKTOP-74D6VT2:8080/api/receita/id/${id}`)
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
