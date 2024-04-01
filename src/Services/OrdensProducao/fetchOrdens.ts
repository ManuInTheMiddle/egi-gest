import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface OrderStatus {
  id_status_ordem_producao: number;
  name: string;
}

interface Product {
  id_produto: number;
  artigo: string;
  descricao: string;
  densidade: string;
}

export interface Order {
  id_ordem_producao: number;
  status_ordens_producao: OrderStatus;
  lote_fabrico: string;
  quantidade: number;
  data_criacao: string;
  produtos: Product;
  detalhes_ordens_producao: any[]; // Assuming this can be any data structure, you can replace it with a specific interface if needed
}

export interface GetResponse {
  message: string;
  ordensProducao: Order[];
}

export const FetchOrdens = () => {
  return useQuery({
    queryKey: ["ordensProducao"],
    queryFn: async () => {
      const { data } = await axios.get(
        "http://localhost:3000/api/ordensProducao"
      );
      return data as GetResponse;
    },
    refetchInterval: 1000,
  });
};
