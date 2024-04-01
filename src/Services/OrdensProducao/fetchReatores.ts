import axios from "axios";
import { useQuery } from "@tanstack/react-query";
interface ApiResponse {
  message: string;
  reator: Reator[];
}

export interface Reator {
  id_ordem_producao: number;
  reatores: {
    id_reator: number | null;
    codigo_qr: string | null;
    descricao: string | null;
  } | null;
  lote_fabrico: string;
  quantidade: number;
  status_ordens_producao: {
    id_status_ordem_producao: number;
    name: string;
  };
  produtos: {
    id_produto: number;
    artigo: string;
    descricao: string;
    densidade: string;
  };
}

export const FetchReator = (orderId: number) => {
  return useQuery({
    queryKey: ["reatorOrdemProd"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://localhost:3000/api/ordensProducao/reator?order-id=${orderId}`
      );
      const reator = await data;
      return reator as ApiResponse;
    },
  });
};

export const FetchReatores = () => {
  return useQuery({
    queryKey: ["reatoresOrdemProd"],
    queryFn: async () => {
      const { data } = await axios.get(
        "http://localhost:3000/api/ordensProducao/reator"
      );
      const reatores = await data;
      return reatores as ApiResponse;
    },
  });
};
