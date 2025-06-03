import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const criarReceitaSCADA = async (body: any) => {
  return await axios
    .post("http://DESKTOP-74D6VT2:8080/api/receita", body)
    .then((response) => {
      console.log(response.data);
      console.log(response.data.SessionId);
    });
};

export const useCriarReceitaSCADA = () => {
  
  const mutate = useMutation({
    mutationKey:["criarReceitaScada"],
    mutationFn: criarReceitaSCADA,
    onSuccess: () => {
      console.log("Receita SCADA criada com sucesso!")
    },
    onError: (error) => {
      console.error("Erro ao criar receita SCADA:", error);
    },
  });
  return mutate;
};
