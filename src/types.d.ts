export type StatusOrdensProducao = {
  name: string;
};

export type Produto = {
  id_produto: number;
  artigo: string;
  descricao: string;
  densidade: string;
};

export type OrdemProducao = {
  id_ordem_producao: number;
  status_ordens_producao: StatusOrdensProducao;
  lote_fabrico: string;
  quantidade: number;
  data_criacao: string;
  produtos: Produto;
};

export type MateriasPrimas = {
  id_materia_prima: number;
  artigo: string;
  descricao: string;
  codigo_qr?: string;
};

export type ListaBom = {
  materias_primas: MateriasPrimas;
  lote?: string;
  produtos: Produto;
  id_bom: number;
  percentagem: string;
};
