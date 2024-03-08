"use server";
interface StatusOrdensProducao {
  name: string;
}

interface Produto {
  id_produto: number;
  artigo: string;
  descricao: string;
  densidade: string;
}

interface OrdemProducao {
  id_ordem_producao: number;
  status_ordens_producao: StatusOrdensProducao;
  lote_fabrico: string;
  quantidade: number;
  data_criacao: string;
  produtos: Produto;
  detalhes_ordens_producao: any[];
}

const obterOrdensProducao = async () => {
  const ordensProducao = await fetch("http://localhost:3000/api/ordensProducao")
    .then((response) => response.json())
    .then((data: { ordensProducao: OrdemProducao[] }) => {
      console.log(data.ordensProducao);
    })
    .catch((error) => console.error("Error fetching data:", error));

  return ordensProducao;
};

export default obterOrdensProducao;
