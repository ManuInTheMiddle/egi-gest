interface IordensProducao {
  id: number;
  //numero de artigo do produto
  referencia: string;
  //qual o numero de producao do lote
  loteFabrico: string;
  //descricao do produto
  descricao: string;
  //quantidade a produzir
  quantidade: number;
  status: string;
}

export const ordensProducao: IordensProducao[] = [
  {
    id: 1,
    referencia: "200A",
    loteFabrico: "200A10",
    descricao: "Sabonete Liquido Azul",
    quantidade: 1000,
    status: "Por validar",
  },
  {
    id: 2,
    referencia: "214d",
    loteFabrico: "214d30",
    descricao: "Lava Louça Manual",
    quantidade: 5000,
    status: "Validada",
  },
  {
    id: 3,
    referencia: "215",
    loteFabrico: "21550",
    descricao: "Lava Louça Maquina",
    quantidade: 9000,
    status: "A Decorrer",
  },
  {
    id: 4,
    referencia: "400",
    loteFabrico: "40050",
    descricao: "Cera Incolor",
    quantidade: 9950,
    status: "Finalizado",
  },
  {
    id: 5,
    referencia: "813",
    loteFabrico: "81310",
    descricao: "DT HIDRO-FB",
    quantidade: 6000,
    status: "Cancelado",
  },
  {
    id: 6,
    referencia: "234E",
    loteFabrico: "234E30",
    descricao: "Desengordurante Verde",
    quantidade: 6000,
    status: "Validado",
  },
  {
    id: 7,
    referencia: "822",
    loteFabrico: "82235",
    descricao: "RIMS T (Alcalino)- Detergente de lavagem",
    quantidade: 7500,
    status: "Por Validar",
  },
];
