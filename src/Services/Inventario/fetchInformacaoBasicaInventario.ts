import axios from "axios";
import { useQuery } from "@tanstack/react-query";
interface ItemCycleCount {
  // Define properties if needed - currently empty array
}

// More specific type for SAP Boolean values
type SAPBoolean = "tYES" | "tNO";

// Enhanced interface with proper typing for SAP booleans
interface SAPItemResponseTyped {
  "odata.metadata": string;
  "odata.etag": string;
  ItemCode: string;
  ItemName: string;
  TreeType: string;
  QuantityOnStock: number;
  ManageBatchNumbers: SAPBoolean;
  MaterialType: string;
  ItemWarehouseInfoCollection: ItemWarehouseInfoTyped[];
}

export interface ItemWarehouseInfoTyped {
  MinimalStock: number;
  MaximalStock: number;
  MinimalOrder: number;
  StandardAveragePrice: number;
  Locked: SAPBoolean;
  WarehouseCode: string;
  InStock: number;
  Committed: number;
  Ordered: number;
  CountedQuantity: number;
  WasCounted: SAPBoolean;
  UserSignature: number;
  Counted: number;
  ItemCode: string;
  IndEscala: SAPBoolean;
  DefaultBinEnforced: SAPBoolean;
  CNJPMan: string | null;
  ItemCycleCounts: ItemCycleCount[];
  InventoryAccount: string | null;
  CostAccount: string | null;
  TransferAccount: string | null;
  RevenuesAccount: string | null;
  VarienceAccount: string | null;
  DecreasingAccount: string | null;
  IncreasingAccount: string | null;
  ReturningAccount: string | null;
  ExpensesAccount: string | null;
  EURevenuesAccount: string | null;
  EUExpensesAccount: string | null;
  ForeignRevenueAcc: string | null;
  ForeignExpensAcc: string | null;
  ExemptIncomeAcc: string | null;
  PriceDifferenceAcc: string | null;
  ExpenseClearingAct: string | null;
  PurchaseCreditAcc: string | null;
  EUPurchaseCreditAcc: string | null;
  ForeignPurchaseCreditAcc: string | null;
  SalesCreditAcc: string | null;
  SalesCreditEUAcc: string | null;
  ExemptedCredits: string | null;
  SalesCreditForeignAcc: string | null;
  ExpenseOffsettingAccount: string | null;
  WipAccount: string | null;
  ExchangeRateDifferencesAcct: string | null;
  GoodsClearingAcct: string | null;
  NegativeInventoryAdjustmentAccount: string | null;
  CostInflationOffsetAccount: string | null;
  GLDecreaseAcct: string | null;
  GLIncreaseAcct: string | null;
  PAReturnAcct: string | null;
  PurchaseAcct: string | null;
  PurchaseOffsetAcct: string | null;
  ShippedGoodsAccount: string | null;
  StockInflationOffsetAccount: string | null;
  StockInflationAdjustAccount: string | null;
  VATInRevenueAccount: string | null;
  WipVarianceAccount: string | null;
  CostInflationAccount: string | null;
  WHIncomingCenvatAccount: string | null;
  WHOutgoingCenvatAccount: string | null;
  StockInTransitAccount: string | null;
  WipOffsetProfitAndLossAccount: string | null;
  InventoryOffsetProfitAndLossAccount: string | null;
  DefaultBin: string | null;
  PurchaseBalanceAccount: string | null;
}

export const useInformacaoBasicaInventario = (itemCode: string) => {
  return useQuery({
    queryKey: ["inventoryBasicInformation", itemCode],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/Items('${itemCode}')?$select=ItemCode,ItemName,TreeType,QuantityOnStock,ManageBatchNumbers,MaterialType,ItemWarehouseInfoCollection`,
        { withCredentials: true }
      );
      return data as SAPItemResponseTyped;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
    enabled: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false; // Order not found
      return failureCount < 3;
    },
  });
};
