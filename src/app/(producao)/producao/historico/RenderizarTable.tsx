"use client";
import React, { useRef, useState } from "react";
import DataTable from "../historico/componentes/data-table";
import ColumnsComponent from "../historico/componentes/columns";
import { ArrowRightCircle, ArrowLeftCircle } from "lucide-react";
import axios from "axios";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";

const BASE_URL = process.env.NEXT_PUBLIC_HOST;

const RenderizarTable = () => {
  const [data, setData] = useState([]);
  const primeiraRenderizacao = useRef(true);
  const [desativar, setdesativar] = useState(true);
  const [desativarSeguinte, setDesativarSeguinte] = useState(false);
  const pagNum = useRef(1);

  const handlePaginaSeguinte = async () => {
    pagNum.current = pagNum.current + 1;
    pagNum.current === 1 ? setdesativar(true) : setdesativar(false);
    //console.log(pagNum);
    try {
      const resposta = await axios.get(
        `http://DESKTOP-74D6VT2:8080/api/historicoOrdensProducao/pag/${pagNum.current}`
      );
      const dados = await resposta.data;
      setData(dados);
      console.log(dados);
      if (!Array.isArray(dados)) {
        setData([]);
        setDesativarSeguinte(true);
      }
      //console.log(dados);
    } catch (error) {
      console.error(error);
    }
  };
  const handlePaginaAnterior = async () => {
    pagNum.current = pagNum.current - 1;
    pagNum.current === 1 ? setdesativar(true) : setdesativar(false);
    //console.log(pagNum);
    try {
      const resposta = await axios.get(
        `http://DESKTOP-74D6VT2:8080/api/historicoOrdensProducao/pag/${pagNum.current}`
      );
      const dados = await resposta.data;
      setData(dados);
      if (dados.length) {
        setDesativarSeguinte(false);
      }
      //console.log(dados);
    } catch (error) {
      console.error(error);
    }
  };

  const getHistoricoOrdens = async () => {
    const resposta = await axios.get(
      `http://DESKTOP-74D6VT2:8080/api/historicoOrdensProducao/pag/${pagNum.current}`
    );
    const dados = await resposta.data;
    setData(dados);
    console.log(dados);
    primeiraRenderizacao.current = false;
    return dados;
  };

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      getHistoricoOrdens();
    }
  }, [data]);
  return (
    <>
      <DataTable columns={ColumnsComponent} data={data} />
      <div className="flex flex-row mt-5 items-center justify-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => handlePaginaAnterior()}
                disabled={desativar}
              >
                <ArrowLeftCircle color="#84CC27" size={30} strokeWidth={1.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pagina Anterior</p>
            </TooltipContent>
          </Tooltip>
          <div>{pagNum.current}</div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => handlePaginaSeguinte()}
                disabled={desativarSeguinte}
              >
                <ArrowRightCircle color="#84CC27" size={30} strokeWidth={1.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pagina Seguinte</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default RenderizarTable;
