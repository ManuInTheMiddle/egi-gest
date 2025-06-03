import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface FetchNumeroOrdensSAPI {
  estado: string;
  periodoData: string;
}

const dataTeste = "2024-02-14";
export const useFetchNumeroOrdensSAPData = (
  periodoData: FetchNumeroOrdensSAPI["periodoData"] = dataTeste
) => {
  return useQuery({
    queryKey: ["numeroOrdensSAPdata"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/ProductionOrders/$count?$filter=CreationDate ge '${periodoData}' and U_Tipo eq 'R'`,
        { withCredentials: true }
      );
      return data as number;
    },
  });
};
