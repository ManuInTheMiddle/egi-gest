import React from "react";
import Retorceder from "./componentes/retorceder";
import RenderizarTable from "./RenderizarTable";

const Historico = () => {
  return (
    <div className="flex flex-col">
      <section className="border-2 border-slate-600 rounded-md p-5 shadow-2xl items-center min-h-full justify-start h- m-1">
        <Retorceder />
        <RenderizarTable />
      </section>
    </div>
  );
};

export default Historico;
