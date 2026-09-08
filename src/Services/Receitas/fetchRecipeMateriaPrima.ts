import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface ProductTreeLine {
  ItemCode: string;
  Quantity: number;
  Warehouse: string;
  Price: number;
  Currency: string;
  IssueMethod: string;
  InventoryUOM: any;
  Comment: any;
  ParentItem: string;
  PriceList: number;
  DistributionRule: any;
  Project: any;
  DistributionRule2: any;
  DistributionRule3: any;
  DistributionRule4: any;
  DistributionRule5: any;
  WipAccount: any;
  ItemType: string;
  LineText: any;
  AdditionalQuantity: any;
  StageID: number;
  ChildNum: number;
  VisualOrder: number;
  ItemName: string;
}

interface ProductTreeStage {
  Father: string;
  StageID: number;
  SequenceNumber: number;
  StageEntry: number;
  Name: string;
  WaitingDays: number;
}
interface ApiResponse {
  "odata.metadata": string;
  TreeCode: string;
  TreeType: string;
  Quantity: number;
  DistributionRule: null;
  Project: null;
  DistributionRule2: null;
  DistributionRule3: null;
  DistributionRule4: null;
  DistributionRule5: null;
  PriceList: number;
  Warehouse: string;
  PlanAvgProdSize: number;
  HideBOMComponentsInPrintout: string;
  ProductDescription: string;
  ProductTreeLines: ProductTreeLine[];
  ProductTreeStages: ProductTreeStage[];
}

interface ArtigoItem {
  "odata.etag": string;
  ItemCode: string;
  ItemName: string;
}

interface ApiResponseArtigos {
  "odata.metadata": string;
  value: ArtigoItem[];
  "odata.nextLink"?: string; // For pagination detection
}

interface ApiResponseArtigo {
  "odata.metadata": string;
  "odata.etag": string;
  ItemCode: string;
  ItemName: string;
}

const receitaDefault = "214";
export const useFetchRecipeMateriaPrimaData = (
  receita: string = receitaDefault
) => {
  return useQuery({
    queryKey: ["informacaoMateriasPrimasReceita", receita],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/ProductTrees('${receita}')`,
        { withCredentials: true }
      );
      return data as ApiResponse;
    },
    enabled: false,
  });
};

const itemGroupCodeDefault = 112;
export const useFetchArtigosProdutoIntermedio = ({
  skip,
  itemGroupCode = itemGroupCodeDefault,
}: {
  skip: number;
  itemGroupCode?: number;
}) => {
  return useQuery({
    queryKey: ["artigosProdutoIntermedio", skip, itemGroupCode], // Add itemGroupCode to key
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/Items?$filter=ItemsGroupCode eq ${itemGroupCode}&$select=ItemCode,ItemName&$skip=${skip}`,
        { withCredentials: true }
      );
      return data as ApiResponseArtigos;
    },
    enabled: true, // Changed from false to true
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export const useFetchArtigoProdutoIntermedioUnico = ({
  itemCode,
}: {
  itemCode: string; // Changed from number to string
}) => {
  return useQuery({
    queryKey: ["artigoProdutoIntermedioUnico", itemCode],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/Items('${itemCode}')?$select=ItemCode,ItemName`,
        { withCredentials: true }
      );
      return data as ApiResponseArtigo;
    },
    enabled: !!itemCode && itemCode.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
