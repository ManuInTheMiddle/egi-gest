export type Order = {
  ordens_producao: {
    status: number;
    lote_fabrico: string;
    id_ordem_producao: number;
    produto: number;
    quantidade: number;
    data_criacao: string;
  };
  status_ordens_producao_transaction_ordens_producao_status_anteriorTostatus_ordens_producao: {
    id_status_ordem_producao: number;
    name: string;
  };
  status_ordens_producao_transaction_ordens_producao_status_novoTostatus_ordens_producao: {
    id_status_ordem_producao: number;
    name: string;
  };
  timestamp: string;
};

export type ApiResponse = {
  message: string;
  historicoOrdens: Order[];
};
