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
  Father: string,
  StageID: number,
  SequenceNumber: number,
  StageEntry: number,
  Name: string,
  WaitingDays: number
}
interface ApiResponse {
  "odata.metadata": string,
  TreeCode: string,
  TreeType: string,
  Quantity: number,
  DistributionRule: null,
  Project: null,
  DistributionRule2: null,
  DistributionRule3: null,
  DistributionRule4: null,
  DistributionRule5: null,
  PriceList: number,
  Warehouse: string,
  PlanAvgProdSize: number,
  HideBOMComponentsInPrintout: string,
  ProductDescription: string,
  ProductTreeLines: ProductTreeLine[],
  ProductTreeStages: ProductTreeStage[]
}

const receitaDefault = "214"
export const useFetchRecipeMateriaPrimaData = (receita: string = receitaDefault
) => {
  return useQuery({
    queryKey: ["informacaoMateriasPrimasReceita"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/ProductTrees('${receita}')`,
        { withCredentials: true }
      );
      return data as ApiResponse;
    },
    enabled: false
  });
};