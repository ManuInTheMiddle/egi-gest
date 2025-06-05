import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface OrdemProducaoSCADA {
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

export const useFetchOrdemProdSCADA = (id: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["ordemProducaoSCADA", id], // Include id in query key for better caching
    queryFn: async (): Promise<OrdemProducaoSCADA[]> => {
      if (!id) {
        throw new Error("ID is required");
      }

      try {
        const { data } = await axios.get(
          `http://DESKTOP-74D6VT2:8080/api/ordemProducao/numOP/${id}`,
          {
            timeout: 10000, // 10 second timeout
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
        return data as OrdemProducaoSCADA[];
      } catch (error) {
        console.error('Error fetching SCADA production order:', error);
        throw error;
      }
    },
    enabled: enabled && !!id, // Only enable if both enabled is true AND id exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (replaces cacheTime)
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};