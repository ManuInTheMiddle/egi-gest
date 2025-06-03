import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface FetchNumeroOrdensCanceladasSAPI {
  periodoData: string;
}

const dataTeste = "2024-02-14";

export const useFetchNumeroOrdensCanceladasSAPData = (
  periodoData: FetchNumeroOrdensCanceladasSAPI["periodoData"] = dataTeste
) => {
  return useQuery({
    queryKey: ["numeroOrdensCanceladasSAPdata"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/ProductionOrders/$count?$filter=CreationDate ge '${periodoData}' and ProductionOrderStatus eq 'boposCancelled' and U_Tipo eq 'R'`,
        { withCredentials: true }
      );
      return data as number;
    },
  });
};
