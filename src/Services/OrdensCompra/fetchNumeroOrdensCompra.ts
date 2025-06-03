import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface FetchNumeroOrdensCompraSAPI {
  periodoData: string;
}

const dataTeste = "2024-02-14";
export const useFetchNumeroOrdensCompraSAPData = (
  periodoData: FetchNumeroOrdensCompraSAPI["periodoData"] = dataTeste
) => {
  return useQuery({
    queryKey: ["numeroOrdensCompraSAPdata"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/PurchaseOrders/$count?$filter=DocDate ge '${periodoData}'`,
        { withCredentials: true }
      );
      return data as number;
    },
    staleTime: 1000 * 60 * 10,
  });
};
