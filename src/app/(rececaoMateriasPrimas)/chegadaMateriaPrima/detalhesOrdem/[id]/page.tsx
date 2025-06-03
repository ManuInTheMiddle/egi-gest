"use client";
import Retorceder from "./componentes/retorceder";
import { useParams } from "next/navigation";
import Pickagem from "./componentes/pickagem";

const Page = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col">
      <section className="border-2 border-slate-600 rounded-md p-5 shadow-2xl items-center h-full min-h-screen justify-start m-1 max-w-full">
        <Retorceder numeroOrdem={id} />
        <div className="flex flex-row gap-x-1">
          <Pickagem />
        </div>
      </section>
    </div>
  );
};

export default Page;
