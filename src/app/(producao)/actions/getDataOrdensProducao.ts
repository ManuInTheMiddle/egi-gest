"use server";
interface StatusOrdensProducao {
  name: string;
  // You might have other fields here if the status object contains more information
}

interface Produto {
  id_produto: number;
  artigo: string;
  descricao: string;
  densidade: string;
  // You might have other fields here related to the product
}

interface OrdemProducao {
  id_ordem_producao: number;
  status_ordens_producao: StatusOrdensProducao;
  lote_fabrico: string;
  quantidade: number;
  data_criacao: string;
  produtos: Produto;
  detalhes_ordens_producao: any[]; // You can define an interface for this if needed
}

const obterOrdensProducao = async () => {
  //fetch das ordens planeadas
  const ordensProducao = await fetch("http://localhost:3000/api/ordensProducao")
    .then((response) => response.json())
    .then((data: { ordensProducao: OrdemProducao[] }) => {
      // Here, 'data' will have the structure with ordensProducao as an array of OrdemProducao objects
      console.log(data.ordensProducao);
    })
    .catch((error) => console.error("Error fetching data:", error));

  return ordensProducao;
};

export default obterOrdensProducao;
