import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const criarOrdemProducaoSCADA = async (body: any) => {
  return await axios
    .post("http://DESKTOP-74D6VT2:8080/api/ordemProducao", body)
    .then((response) => {
      console.log(response.data);
      console.log(response.data.SessionId);
    });
};

export const useCriarOrdemProducaoSCADA = () => {
  const mutate = useMutation({
    mutationFn: criarOrdemProducaoSCADA,
    onSuccess: () => {
      console.log("Ordem produção SCADA criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro na criacao de ordem producao SCADA:", error);
    },
  });
  return mutate;
};

