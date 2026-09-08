// Endpoint para receber dados da view SBSS_ProdOrderB1SLQuery
// http://egiquim-sap:50001/b1s/v1/view.svc/SBSS_ProdOrderB1SLQuery?$filter=DocEntry eq 185431
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export interface ProdOrderB1SLQueryItem {
  DocEntry: number;
  DocNum: number;
  ItemCodePai: string;
  PlannedQtyPai: number;
  CmpltQtyPai: number;
  WarehousePai: string;
  StartDate: string;
  U_Reator: string | null;
  U_Tipo: string;
  CreateDate: string;
  LineNum: number;
  ItemCodeComp: string;
  BaseQty: number;
  PlannedQty: number;
  IssuedQty: number;
  IssueType: string;
  wareHouse: string;
  ItemName: string;
  ItmsGrpCod: number;
  id__: number;
}

interface ApiResponse {
  "odata.metadata": string;
  value: ProdOrderB1SLQueryItem[];
  "odata.nextLink"?: string;
}

interface FetchProdOrderB1SLQueryParams {
  docEntry?: number;
  tipo?: string;
  startDate?: string;
  endDate?: string;
  itemCodePai?: string;
  pagina?: number;
}

const defaultStartDate = "2024-02-14";

export const useFetchProdOrderB1SLQuery = (
  params: FetchProdOrderB1SLQueryParams = {}
) => {
  const {
    docEntry,
    tipo,
    startDate = defaultStartDate,
    endDate,
    itemCodePai,
    pagina = 0,
  } = params;

  // Construir filtros dinamicamente
  const buildFilter = () => {
    const filters: string[] = [];

    if (docEntry) {
      filters.push(`DocEntry eq ${docEntry}`);
    }

    if (tipo) {
      filters.push(`U_Tipo eq '${tipo}'`);
    }

    if (startDate) {
      filters.push(`StartDate ge '${startDate}'`);
    }

    if (endDate) {
      filters.push(`StartDate le '${endDate}'`);
    }

    if (itemCodePai) {
      filters.push(`ItemCodePai eq '${itemCodePai}'`);
    }

    return filters.length > 0 ? filters.join(" and ") : "";
  };

  const filter = buildFilter();
  const skip = pagina > 0 ? `&$skip=${pagina}` : "";
  const filterParam = filter ? `?$filter=${encodeURIComponent(filter)}` : "";

  const url = `http://egiquim-sap:50001/b1s/v1/view.svc/SBSS_ProdOrderB1SLQuery${filterParam}${skip}`;

  return useQuery({
    queryKey: [
      "prodOrderB1SLQuery",
      docEntry,
      tipo,
      startDate,
      endDate,
      itemCodePai,
      pagina,
    ],
    queryFn: async () => {
      const { data } = await axios.get(url, {
        withCredentials: true,
      });
      return data as ApiResponse;
    },
    refetchInterval: 1000 * 60 * 5, // 5 minutos
    refetchIntervalInBackground: true,
    enabled: true, // Pode ajustar conforme necessário
  });
};

// Hook específico para buscar por DocEntry (caso mais comum)
export const useFetchProdOrderByDocEntry = (docEntry: number) => {
  return useFetchProdOrderB1SLQuery({ docEntry });
};

// Hook específico para buscar por tipo de produção
export const useFetchProdOrderByTipo = (
  tipo: string,
  startDate?: string,
  endDate?: string
) => {
  return useFetchProdOrderB1SLQuery({ tipo, startDate, endDate });
};

// Hook específico para buscar por item pai
export const useFetchProdOrderByItemPai = (
  itemCodePai: string,
  startDate?: string
) => {
  return useFetchProdOrderB1SLQuery({ itemCodePai, startDate });
};
