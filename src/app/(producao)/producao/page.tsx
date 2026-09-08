import Retorceder from "../componentes/retorceder";
import TableRendering from "./tableRendering";
import { Toaster } from "@/components/ui/sonner";

const page = async () => {
  return (
    <div className="flex flex-col">
      <section className="border-2 border-slate-600 rounded-md p-5 shadow-2xl items-center min-h-screen justify-start h-full m-1">
        <Retorceder />
        <TableRendering />
        <Toaster closeButton />
      </section>
    </div>
  );
};

export default page;
