import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface AddProductionLineData {
  numeroOP: number; // AbsoluteEntry of the production order
  itemNo: string;
  baseQuantity?: number;
  issueType?: "im_Backflush" | "im_Manual";
}

interface AddProductionLineBody {
  ProductionOrderLines: Array<{
    DocumentAbsoluteEntry: number;
    LineNumber: number;
    ItemNo: string;
    BaseQuantity: number;
    ProductionOrderIssueType: "im_Backflush" | "im_Manual";
  }>;
}

const adicionarLinhaOrdemProducao = async (data: AddProductionLineData) => {
  // First, get the current production order to calculate the next LineNumber
  const currentOrderResponse = await axios.get(
    `http://egiquim-sap:50001/b1s/v1/ProductionOrders(${data.numeroOP})`,
    { withCredentials: true }
  );

  const currentOrder = currentOrderResponse.data;
  const currentLines = currentOrder.ProductionOrderLines || [];

  // Calculate next LineNumber (increment from the highest existing LineNumber)
  const nextLineNumber =
    currentLines.length > 0
      ? Math.max(...currentLines.map((line: any) => line.LineNumber || 0)) + 1
      : 0;

  const body: AddProductionLineBody = {
    ProductionOrderLines: [
      {
        DocumentAbsoluteEntry: data.numeroOP,
        LineNumber: nextLineNumber,
        ItemNo: data.itemNo,
        BaseQuantity: data.baseQuantity || 1.0,
        ProductionOrderIssueType: data.issueType || "im_Manual",
      },
    ],
  };

  return await axios.patch(
    `http://egiquim-sap:50001/b1s/v1/ProductionOrders(${data.numeroOP})`,
    body,
    { withCredentials: true }
  );
};

export const useAdicionarLinhaOrdemProducao = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: adicionarLinhaOrdemProducao,
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh the production order data
      queryClient.invalidateQueries({ queryKey: ["ordensProducaoSAP"] });
      queryClient.invalidateQueries({
        queryKey: ["ordemProducao", variables.numeroOP],
      });
      console.log(
        `Linha adicionada com sucesso para item ${variables.itemNo}!`
      );
    },
    onError: (error, variables) => {
      console.error(
        `Erro ao adicionar linha para item ${variables.itemNo}:`,
        error
      );
    },
  });

  return mutation;
};
