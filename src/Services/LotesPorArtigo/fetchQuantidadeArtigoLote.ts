import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export interface SAPQueryResultBatchNumberForItems {
  "odata.metadata": string;
  SqlText: string;
  value: ItemDetails[];
}

interface ItemDetails {
  BatchNum: string;
  IsBatchManaged: string;
  ItemCode: string;
  ItemName: string;
  Quantity: number;
  WhsCode: string;
}

export const useFetchQuantidadeArtigoLote = (artigo: string) => {
  return useQuery({
    queryKey: ["quantidadeArtigoLote", artigo],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/SQLQueries('BatchNumberForItems')/List?ItemCode='${artigo}'`,
        { withCredentials: true }
      );
      return data as SAPQueryResultBatchNumberForItems;
    },
    enabled: false,
  });
};
