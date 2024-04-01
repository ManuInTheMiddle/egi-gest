//endpoint para receber ordens
//http://egiquim-sap:50001/b1s/v1/ProductionOrders?$filter=ProductionOrderStatus eq 'boposPlanned' and CreationDate ge '2024-02-14'
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface ProductionOrderLine {
  DocumentAbsoluteEntry: number;
  LineNumber: number;
  ItemNo: string;
  BaseQuantity: number;
  PlannedQuantity: number;
  IssuedQuantity: number;
  ProductionOrderIssueType: string;
  Warehouse: string;
  VisualOrder: number;
  DistributionRule: string | null;
  LocationCode: string | null;
  Project: string | null;
  DistributionRule2: string | null;
  DistributionRule3: string | null;
  DistributionRule4: string | null;
  DistributionRule5: string | null;
  UoMEntry: number;
  UoMCode: number;
  WipAccount: string | null;
  ItemType: string;
  LineText: string | null;
  AdditionalQuantity: number;
  ResourceAllocation: string | null;
  StartDate: string;
  EndDate: string;
  StageID: number | null;
  RequiredDays: number;
  ItemName: string;
  SerialNumbers: any[];
  BatchNumbers: any[];
}

export interface ProductionOrder {
  AbsoluteEntry: number;
  DocumentNumber: number;
  Series: number;
  ItemNo: string;
  ProductionOrderStatus: string;
  ProductionOrderType: string;
  PlannedQuantity: number;
  CompletedQuantity: number;
  RejectedQuantity: number;
  PostingDate: string;
  DueDate: string;
  ProductionOrderOriginEntry: number | null;
  ProductionOrderOriginNumber: number | null;
  ProductionOrderOrigin: string;
  UserSignature: number;
  Remarks: string | null;
  ClosingDate: string | null;
  ReleaseDate: string;
  CustomerCode: string | null;
  Warehouse: string;
  InventoryUOM: string | null;
  JournalRemarks: string;
  TransactionNumber: string | null;
  CreationDate: string;
  Printed: string;
  DistributionRule: string;
  Project: string;
  DistributionRule2: string | null;
  DistributionRule3: string | null;
  DistributionRule4: string | null;
  DistributionRule5: string | null;
  UoMEntry: number;
  StartDate: string;
  ProductDescription: string;
  Priority: number;
  RoutingDateCalculation: string;
  UpdateAllocation: string;
  SAPPassport: any;
  AttachmentEntry: any;
  U_Prd_TmpMinMist: any;
  U_Prd_DensEsp: any;
  U_Prd_ViscEsp: any;
  U_Prd_ExtSecoEsp: any;
  U_Prd_phEsp: any;
  U_LoteFabrico: any;
  ProductionOrderLines: ProductionOrderLine[];
  ProductionOrdersSalesOrderLines: any[];
  ProductionOrdersStages: any[];
  ProductionOrdersDocumentReferences: any[];
}

interface ApiResponse {
  "odata.metadata": string;
  value: ProductionOrder[];
}

interface FetchOrdensSAPplaneadasDataI {
  estado: string;
  periodoData: string;
}

const dataTeste = "2024-02-14";
const estadoTeste = "boposReleased";
export const FetchOrdensSAPplaneadasData = (
  estado: FetchOrdensSAPplaneadasDataI["estado"] = estadoTeste,
  periodoData: FetchOrdensSAPplaneadasDataI["periodoData"] = dataTeste
) => {
  return useQuery({
    queryKey: ["ordemPlaneadaSAPdata"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/ProductionOrders?$filter=ProductionOrderStatus eq '${estado}' and CreationDate ge '${periodoData}'`
      );
      return data as ApiResponse;
    },
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
  });
};
