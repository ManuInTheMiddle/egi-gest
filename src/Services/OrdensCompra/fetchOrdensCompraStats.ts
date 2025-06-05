import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { purchaseOrderKeys } from "./purchaseOrderKeys";

// ✅ NEW: Optimized count query - gets only the count, not full data
export const useFetchNumeroOrdensCompraSAPData = (periodoData: string) => {
  return useQuery({
    queryKey: purchaseOrderKeys.totalCount(periodoData),
    queryFn: async () => {
      // ✅ OPTIMIZED: Using $count endpoint for better performance
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/PurchaseOrders/$count?$filter=DocDate ge '${periodoData}'`,
        { withCredentials: true }
      );
      return { count: parseInt(data) };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (counts change less frequently)
    gcTime: 1000 * 60 * 15,
    enabled: !!periodoData,
    retry: 2,
  });
};

// ✅ NEW: Count of completed orders
export const useFetchNumeroOrdensCompraConcluidasSAPData = (periodoData: string) => {
  return useQuery({
    queryKey: purchaseOrderKeys.concluidasCount(periodoData),
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/PurchaseOrders/$count?$filter=DocDate ge '${periodoData}' and DocumentStatus eq 'bost_Close'`,
        { withCredentials: true }
      );
      return { count: parseInt(data) };
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
    enabled: !!periodoData,
    retry: 2,
  });
};

// ✅ NEW: Count of pending orders
export const useFetchNumeroOrdensCompraPorConcluirSAPData = (periodoData: string) => {
  return useQuery({
    queryKey: purchaseOrderKeys.porConcluirCount(periodoData),
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/PurchaseOrders/$count?$filter=DocDate ge '${periodoData}' and DocumentStatus eq 'bost_Open'`,
        { withCredentials: true }
      );
      return { count: parseInt(data) };
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
    enabled: !!periodoData,
    retry: 2,
  });
};

// ✅ NEW: Combined stats hook - replaces multiple separate hooks
export const usePurchaseOrderStats = (periodoData: string) => {
  const totalQuery = useFetchNumeroOrdensCompraSAPData(periodoData);
  const concluidasQuery = useFetchNumeroOrdensCompraConcluidasSAPData(periodoData);
  const porConcluirQuery = useFetchNumeroOrdensCompraPorConcluirSAPData(periodoData);

  return {
    // Individual queries (in case you need them)
    total: totalQuery,
    concluidas: concluidasQuery,
    porConcluir: porConcluirQuery,
    
    // Combined states
    isLoading: totalQuery.isLoading || concluidasQuery.isLoading || porConcluirQuery.isLoading,
    isError: totalQuery.isError || concluidasQuery.isError || porConcluirQuery.isError,
    errors: [totalQuery.error, concluidasQuery.error, porConcluirQuery.error].filter(Boolean),
    
    // ✅ Clean, ready-to-use data
    data: {
      total: totalQuery.data?.count || 0,
      concluidas: concluidasQuery.data?.count || 0,
      porConcluir: porConcluirQuery.data?.count || 0,
      percentage: totalQuery.data?.count 
        ? Math.round(((concluidasQuery.data?.count || 0) / totalQuery.data.count) * 100)
        : 0
    },
    
    // Helper functions
    refetchAll: () => {
      totalQuery.refetch();
      concluidasQuery.refetch();
      porConcluirQuery.refetch();
    }
  };
};