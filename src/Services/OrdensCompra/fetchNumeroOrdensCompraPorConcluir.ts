import axios from "axios";
import { useQuery } from "@tanstack/react-query";


//const dataTeste = "2024-02-14";
export const useFetchNumeroOrdensCompraPorConcluirSAPData = () => {
  return useQuery({
    queryKey: ["numeroOrdensCompraPorConcluirSAPdata"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/PurchaseOrders/$count?$filter=DocumentStatus eq 'bost_Open'`,
        { withCredentials: true }
      );
      return data as number;
    },
    staleTime: 1000 * 60 * 10,
  });
};
