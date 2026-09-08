import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const BASE_API_URL = process.env.NEXT_PUBLIC_SCADA_BASE_URL;

interface UpdateLoteData {
  idConsumos: number;
  novoLote: string;
}

interface UpdateLoteResponse {
  message: string;
  idConsumo: number;
  novoLote: string;
  timestamp: string;
}

interface BulkUpdateLoteData {
  updates: Array<{
    idConsumo: number;
    novoLote: string;
  }>;
}

interface BulkUpdateLoteResponse {
  message: string;
  total: number;
  resultados: Array<{
    idConsumo: number;
    status: "sucesso" | "erro";
    novoLote?: string;
    message?: string;
  }>;
}

// Create axios instance with same configuration as your SCADA service
const scadaApi = axios.create({
  baseURL: `${BASE_API_URL}/api`,
  timeout: 45000, // 45 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error handling (same as your pattern)
scadaApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Check if it's a timeout error
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout: Sistema SCADA não está respondendo. Verifique se o servidor está ativo.');
    }
    
    // Check for connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Erro de conexão: Não foi possível conectar ao sistema SCADA. Verifique a rede.');
    }
    
    // Check if response exists before accessing its properties
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Consumo não encontrado para atualização.');
      }
      
      if (error.response.status === 400) {
        throw new Error('Dados inválidos para atualização do lote.');
      }
      
      if (error.response.status >= 500) {
        throw new Error('Erro interno do servidor SCADA. Tente novamente em alguns minutos.');
      }
    }
    
    // If we can't identify the error, throw the original
    throw error;
  }
);

const atualizarLoteConsumo = async (data: UpdateLoteData): Promise<UpdateLoteResponse> => {
  console.log(`Updating lote for consumption: ${data.idConsumos} -> ${data.novoLote}`); // Debug log
  
  try {
    const { data: responseData } = await scadaApi.patch(
      `/consumos/${data.idConsumos}/lote`,
      { novoLote: data.novoLote }
    );
    
    console.log(`Successfully updated lote for consumption ${data.idConsumos}`);
    return responseData;
    
  } catch (error) {
    console.error(`Error updating lote for consumption ${data.idConsumos}:`, error);
    throw error;
  }
};

const atualizarLotesConsumoEmLote = async (data: BulkUpdateLoteData): Promise<BulkUpdateLoteResponse> => {
  console.log(`Bulk updating ${data.updates.length} lotes`); // Debug log
  
  try {
    const { data: responseData } = await scadaApi.patch('/consumos/lotes', data);
    
    const successCount = responseData.resultados.filter(r => r.status === "sucesso").length;
    console.log(`Bulk lote update completed: ${successCount}/${data.updates.length} successful`);
    return responseData;
    
  } catch (error) {
    console.error(`Error in bulk lote update:`, error);
    throw error;
  }
};

export const useAtualizarLoteConsumo = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: atualizarLoteConsumo,
    onSuccess: (response, variables) => {
      // Invalidate queries to refresh consumption data (matching your query keys)
      queryClient.invalidateQueries({ queryKey: ["consumosSCADA"] });
      queryClient.invalidateQueries({ 
        queryKey: ["consumosSCADA", variables.idConsumos.toString()] 
      });
      
      console.log(
        `Lote atualizado com sucesso para consumo ${variables.idConsumos}: ${variables.novoLote}`
      );
    },
    onError: (error: Error, variables) => {
      console.error(
        `Erro ao atualizar lote para consumo ${variables.idConsumos}:`,
        error.message
      );
    },
    retry: (failureCount, error: Error) => {
      // Don't retry on 404 or validation errors
      if (error.message.includes('não encontrado') || 
          error.message.includes('inválidos')) {
        return false;
      }
      // Retry up to 2 times for connection/timeout issues
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => {
      // Progressive delay: 1s, 2s
      return Math.min(1000 * 2 ** attemptIndex, 2000);
    },
  });
  
  return mutation;
};

export const useAtualizarLotesConsumoEmLote = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: atualizarLotesConsumoEmLote,
    onSuccess: (response, variables) => {
      // Invalidate queries to refresh consumption data
      queryClient.invalidateQueries({ queryKey: ["consumosSCADA"] });
      
      const successCount = response.resultados.filter(r => r.status === "sucesso").length;
      const errorCount = response.resultados.filter(r => r.status === "erro").length;
      
      console.log(
        `Atualização em lote concluída: ${successCount} sucessos, ${errorCount} erros de ${variables.updates.length} total`
      );
    },
    onError: (error: Error, variables) => {
      console.error(
        `Erro na atualização em lote de ${variables.updates.length} lotes:`,
        error.message
      );
    },
    retry: (failureCount, error: Error) => {
      // Don't retry on validation errors
      if (error.message.includes('inválidos')) {
        return false;
      }
      // Retry up to 2 times for connection/timeout issues
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => {
      // Progressive delay: 1s, 2s
      return Math.min(1000 * 2 ** attemptIndex, 2000);
    },
  });
  
  return mutation;
};