export type ordemProducaoPlanear = {
  id: number;
  //numero de artigo do produto
  referencia: string;
  //qual o numero de producao do lote
  loteFabrico: string;
  //descricao do produto
  descricao: string;
  //quantidade a produzir
  quantidade: number;
  status: "Planeada" | "Por Planear";
  reator?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | undefined;
};

export const ordensProdPlan: ordemProducaoPlanear[] = [
  {
    id: 1,
    referencia: "200A",
    loteFabrico: "200A10",
    descricao: "Sabonete Liquido Azul",
    quantidade: 1000,
    status: "Planeada",
    reator: undefined,
  },
  {
    id: 2,
    referencia: "214d",
    loteFabrico: "214d30",
    descricao: "Lava Louça Manual",
    quantidade: 5000,
    status: "Por Planear",
    reator: undefined,
  },
  {
    id: 3,
    referencia: "215",
    loteFabrico: "21550",
    descricao: "Lava Louça Maquina",
    quantidade: 9000,
    status: "Por Planear",
    reator: undefined,
  },
  {
    id: 4,
    referencia: "400",
    loteFabrico: "40050",
    descricao: "Cera Incolor",
    quantidade: 9950,
    status: "Por Planear",
    reator: undefined,
  },
  {
    id: 5,
    referencia: "813",
    loteFabrico: "81310",
    descricao: "DT HIDRO-FB",
    quantidade: 6000,
    status: "Por Planear",
    reator: undefined,
  },
  {
    id: 6,
    referencia: "234E",
    loteFabrico: "234E30",
    descricao: "Desengordurante Verde",
    quantidade: 6000,
    status: "Por Planear",
    reator: undefined,
  },
  {
    id: 7,
    referencia: "822",
    loteFabrico: "82235",
    descricao: "RIMS T (Alcalino)- Detergente de lavagem",
    quantidade: 7500,
    status: "Planeada",
    reator: undefined,
  },
];
