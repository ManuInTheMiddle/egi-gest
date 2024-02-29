import DataTable from "./data-table";
import { ordensProducao } from "../../../../public/assets/mockData/ordensFabrico";
import ColumnsComponent from "./columns";

/*
const getData = async () => {
  //fetch das ordens de fabrico provindas do SAP
  return ordensProducao;
};
*/

const page = () => {
  const dados = ordensProducao;
  const semDados = [];
  return (
    <div className="m-4 mt-10">
      <section className="border-2 border-slate-600 rounded-md p-7 shadow-2xl">
        <h1 className="text-lg mb-3">Produção</h1>
        <DataTable columns={ColumnsComponent} data={dados} />
      </section>
    </div>
  );
};

export default page;
