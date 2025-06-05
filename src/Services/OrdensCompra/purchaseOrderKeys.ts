export const purchaseOrderKeys = {
  all: ['ordensCompra'] as const,
  list: (periodoData: string, pagina: number) => 
    ['ordensCompra', 'list', periodoData, pagina] as const,
  detail: (id: number) => 
    ['ordensCompra', 'detail', id] as const,
  totalCount: (periodoData: string) => 
    ['ordensCompra', 'count', 'total', periodoData] as const,
  concluidasCount: (periodoData: string) => 
    ['ordensCompra', 'count', 'concluidas', periodoData] as const,
  porConcluirCount: (periodoData: string) => 
    ['ordensCompra', 'count', 'porConcluir', periodoData] as const,
} as const;