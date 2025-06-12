import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

const BASE_API_URL = process.env.NEXT_PUBLIC_SCADA_BASE_URL;

// Fixed interface name (should start with capital letter and match your Go backend)
interface ConsumosSCADA {
  IdConsumos: number;
  numOP: number;
  origemMP: number;
  materiaPrima: string;
  lote: string;
  quantidade: number;
  date: string;
}

interface FetchConsumosSCADAI {
  id: string;
}

// Create axios instance with better configuration
const scadaApi = axios.create({
  baseURL: `${BASE_API_URL}/api`,
  timeout: 45000, // 45 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error handling
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
        const urlParts = error.config?.url?.split('/');
        const orderId = urlParts ? urlParts[urlParts.length - 1] : 'desconhecida';
        throw new Error(`Consumos para a ordem ${orderId} não encontrados.`);
      }
      
      if (error.response.status >= 500) {
        throw new Error('Erro interno do servidor SCADA. Tente novamente em alguns minutos.');
      }
    }
    
    // If we can't identify the error, throw the original
    throw error;
  }
);

export const useFetchConsumosSCADA = (id: FetchConsumosSCADAI["id"]) => {
  return useQuery({
    queryKey: ["consumosSCADA", id], // Include id in query key for better caching
    queryFn: async (): Promise<ConsumosSCADA[]> => {
      if (!id) {
        throw new Error("ID da ordem é obrigatório");
      }

      console.log(`Fetching SCADA consumptions for order: ${id}`); // Debug log
      
      try {
        const { data } = await scadaApi.get(`/consumos/numOP/${id}`);
        
        // Handle empty response gracefully
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.log(`No consumptions found for order ${id}`);
          return []; // Return empty array instead of throwing error
        }
        
        console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 1} consumptions for order ${id}`);
        return Array.isArray(data) ? data : [data];
        
      } catch (error) {
        console.error(`Error fetching SCADA consumptions for order ${id}:`, error);
        throw error;
      }
    },
    enabled: !!id && id.trim() !== '', // Enable only when id exists and is not empty
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes (replaces cacheTime)
    retry: (failureCount, error: Error) => {
      // Don't retry on 404 (not found) or validation errors
      if (error.message.includes('não encontrados') || 
          error.message.includes('obrigatório')) {
        return false;
      }
      // Retry up to 3 times for timeout/connection issues
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // Progressive delay: 2s, 4s, 8s
      return Math.min(2000 * 2 ** attemptIndex, 8000);
    },
  });
};