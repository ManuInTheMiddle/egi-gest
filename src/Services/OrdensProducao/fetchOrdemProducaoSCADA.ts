import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface ordemProducao {
  idOrdemProducao: number;
  numeroOrdemProducao: number;
  receita: string;
  quantidade: number;
  reator: number;
  estado: number;
  dataCriacao: string;
  estadoReator: number;
  tpa: number;
}

interface FetchOrdemProdSCADAI {
  id: string;
}

export const useFetchOrdemProdSCADA = (id: FetchOrdemProdSCADAI["id"]) => {
  return useQuery({
    queryKey: ["receitasSCADA"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://DESKTOP-74D6VT2:8080/api/ordemProducao/numOP/${id}`
      );
      return data as ordemProducao[];
    },
    enabled: false,
  });
};
