import Retorceder from "../componentes/retorceder";
import TableRendering from "./tableRendering";

const page = async () => {
  return (
    <div className="flex flex-col">
      <section className="border-2 border-slate-600 rounded-md p-5 shadow-2xl items-center min-h-full justify-start h-screen m-1">
        <Retorceder />
        <TableRendering />
      </section>
    </div>
  );
};

export default page;
