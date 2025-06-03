import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface FetchNumeroOrdensConcluidasSAPI {
  periodoData: string;
}

const dataTeste = "2024-02-14";

export const useFetchNumeroOrdensConcluidasSAPData = (
  periodoData: FetchNumeroOrdensConcluidasSAPI["periodoData"] = dataTeste
) => {
  return useQuery({
    queryKey: ["numeroOrdensConcluidasSAPdata"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/ProductionOrders/$count?$filter=CreationDate ge '${periodoData}' and ProductionOrderStatus eq 'boposClosed' and U_Tipo eq 'R' `,
        { withCredentials: true }
      );
      return data as number;
    },
  });
};
