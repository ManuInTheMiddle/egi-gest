"use client";
import React, { useState } from "react";
import DataTable from "../historico/componentes/data-table";
import ColumnsComponent from "../historico/componentes/columns";
import axios from "axios";
import { useEffect } from "react";

const RenderizarTable = () => {
  const [data, setData] = useState([]);

  const getHistoricoOrdens = async () => {
    const resposta = await axios.get(
      "http://localhost:3000/api/ordensProducao/historico"
    );
    const dados = await resposta.data.historicoOrdens;
    setData(dados);
    //console.log(dados);
    return dados;
  };

  useEffect(() => {
    getHistoricoOrdens();
  }, []);
  return (
    <>
      <DataTable columns={ColumnsComponent} data={data} />
    </>
  );
};

export default RenderizarTable;
