import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface FetchNumeroOrdensConcluidasSAPI {
  periodoData: string;
}

const dataTeste = "2024-02-14";


// ✅ PRODUCTION READY: Most robust version
export const useFetchNumeroOrdensConcluidasSAPProduction = (
  periodoData?: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
  }
) => {
  const finalPeriodoData = periodoData || dataTeste;
  
  return useQuery<number, Error>({
    queryKey: ["numeroOrdensConcluidasSAP", finalPeriodoData],
    
    queryFn: async ({ signal }) => {
      const url = `http://egiquim-sap:50001/b1s/v1/ProductionOrders/$count`;
      
      const { data } = await axios.get<number>(url, {
        params: {
          $filter: `CreationDate ge '${finalPeriodoData}' and ProductionOrderStatus eq 'boposClosed' and U_Tipo eq 'R'`
        },
        withCredentials: true,
        timeout: 10000,
        signal, // ✅ Support query cancellation
      });
      
      // ✅ Validate response type
      if (typeof data !== 'number' || isNaN(data)) {
        throw new Error('Invalid response: expected a valid number');
      }
      
      return data;
    },
    
    // ✅ Merge user options with defaults
    enabled: options?.enabled !== false && !!finalPeriodoData,
    staleTime: options?.staleTime ?? 30000,
    gcTime: 300000,
    retry: (failureCount, error) => {
      // ✅ Don't retry on 4xx errors
      if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: options?.refetchInterval,
  });
};
