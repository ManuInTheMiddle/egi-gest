import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface FetchNumeroOrdensSAPI {
  estado: string;
  periodoData: string;
}

const dataTeste = "2024-02-14";
export const useFetchNumeroOrdensSAPProduction = (
  periodoData: string = dataTeste
) => {
  return useQuery<number, Error>({
    queryKey: ["numeroOrdensSAP", periodoData],
    
    queryFn: async () => {
      const { data } = await axios.get<number>(
        `http://egiquim-sap:50001/b1s/v1/ProductionOrders/$count`,
        {
          params: {
            $filter: `CreationDate ge '${periodoData}' and U_Tipo eq 'R'`
          },
          withCredentials: true,
          timeout: 10000,
        }
      );
      
      if (typeof data !== 'number') {
        throw new Error('Invalid response: expected a number');
      }
      
      return data;
    },
    
    enabled: !!periodoData,
    staleTime: 30000,
    gcTime: 300000,
    retry: 3,
  });
};