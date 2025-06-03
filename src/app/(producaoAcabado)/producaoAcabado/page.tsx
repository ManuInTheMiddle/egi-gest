import Retorceder from "./componentes/retorceder";
import ListaOrdensProducao from "./componentes/listaOrdensProducao";
import TabsProdutoAcabado from "./componentes/tabsProdutoAcabado";

const page = async () => {
  return (
    <div className="flex flex-col">
      <section className="border-2 border-slate-600 rounded-md p-5 shadow-2xl items-center min-h-screen justify-start h-full m-1">
        <Retorceder TextoExtra="-> Transferência Armazem" />
        <TabsProdutoAcabado/>
        <ListaOrdensProducao />
      </section>
    </div>
  );
};

export default page;
