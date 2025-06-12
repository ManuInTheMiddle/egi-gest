import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const BASE_API_URL = process.env.NEXT_PUBLIC_SCADA_BASE_URL;

const criarOrdemProducaoSCADA = async (body: any) => {
  return await axios
    .post(`${BASE_API_URL}/api/ordemProducao`, body)
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

