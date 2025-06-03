"use client";
import React from "react";
import { produce } from "immer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { DataTable } from "../tabelaRotulagem/data-table";
import ColunasComponente from "../tabelaRotulagem/colunas";
import { useFetchOrdensEnchimentoSAPData } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";

const ListaOrdensRotulagem = () => {
  const OrdensEnchimentoSAPData = useFetchOrdensEnchimentoSAPData("boposReleased");

  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////
  const [numeroPagina, setNumeroPagina] = useState(0);
  const handlePaginaSeguinte = () => {
    const atualizarPagina = produce(numeroPagina, (draft) => {
      draft = draft + 20;
      return draft;
    });

    setNumeroPagina(atualizarPagina);
  };
  const handlePaginaAnterior = () => {
    const atualizarPagina = produce(numeroPagina, (draft) => {
      if (draft > 0) {
        return (draft = draft - 20);
      }
    });
    setNumeroPagina(atualizarPagina);
  };
  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////
  return (
    <div>
      {
        OrdensEnchimentoSAPData.data &&
        <div>
        <DataTable columns={ColunasComponente} data={OrdensEnchimentoSAPData.data.value} />
      </div>
      }
      <div
        className="mt-6 flex items-center justify-center sm:mt-8"
        aria-label="Page navigation"
      >
        <div className="mt-2 gap-x-2 flex flex-col">
          <div className="flex flex-row items-center mt-2 gap-x-2">
            <Button
              variant="ghost"
              size={"icon"}
              className="h-8 w-8 p-0"
              disabled={numeroPagina <=0}
              onClick={() => {
                handlePaginaAnterior();
              }}
            >
              <span className="sr-only">Página Anterior</span>
              <ArrowLeftCircle color="#84CC27" size={30} strokeWidth={1.5} />
            </Button>
            <h2>Página</h2>
            <Label className="text-lg">{numeroPagina}</Label>
            <Button
              variant="ghost"
              size={"icon"}
              className="h-8 w-8 p-0"
              disabled={OrdensEnchimentoSAPData.data?.value === undefined || OrdensEnchimentoSAPData.data?.value.length === 0}
              onClick={() => {
                handlePaginaSeguinte();
              }}
            >
              <span className="sr-only">Próxima Página</span>
              <ArrowRightCircle color="#84CC27" size={30} strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaOrdensRotulagem;
