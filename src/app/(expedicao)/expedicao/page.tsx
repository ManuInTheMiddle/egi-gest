import Retorceder from "./componentes/retorceder";
import ListaOrdensVenda from "./componentes/listaOrdensVenda";
const page = async () => {
  return (
    <div className="flex flex-col">
      <section className="border-2 border-slate-600 rounded-md p-5 shadow-2xl items-center min-h-screen justify-start h-full m-1">
        <Retorceder />
        <ListaOrdensVenda />
      </section>
    </div>
  );
};

export default page;
