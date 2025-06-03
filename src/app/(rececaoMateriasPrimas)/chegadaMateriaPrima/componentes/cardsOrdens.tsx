import React, { useEffect } from "react";
import { useState } from "react";
import { useFetchNumeroOrdensCompraSAPData } from "@/Services/OrdensCompra/fetchNumeroOrdensCompra";
import { useFetchNumeroOrdensCompraConcluidasSAPData } from "@/Services/OrdensCompra/fetchNumeroOrdensCompraConcluidas";
import { useFetchNumeroOrdensCompraPorConcluirSAPData } from "@/Services/OrdensCompra/fetchNumeroOrdensCompraPorConcluir";
import { format, startOfMonth } from "date-fns";
import { pt } from "date-fns/locale";

const CardsOrdens = () => {
  const instanciaData = new Date();

  const fetchNumeroOrdensPorConcluirSAP =
    useFetchNumeroOrdensCompraPorConcluirSAPData();
  const fetchNumeroOrdensSAP = useFetchNumeroOrdensCompraSAPData(
    `${format(startOfMonth(instanciaData), "yyyy-MM-dd")}`
  );

  const fetchNumeroOrdensConcluidasSAP =
    useFetchNumeroOrdensCompraConcluidasSAPData(
      `${format(startOfMonth(instanciaData), "yyyy-MM-dd")}`
    );

  const [numeroOrdensCompra, setNumeroOrdensCompra] = useState(0);
  const [numeroOrdensCompraConcluidas, setNumeroOrdensCompraConcluidas] =
    useState(0);
  const [numeroOrdensCompraPorConcluir, setNumeroOrdensCompraPorConcluir] =
    useState(0);

  useEffect(() => {
    if (fetchNumeroOrdensSAP.isSuccess) {
      setNumeroOrdensCompra(fetchNumeroOrdensSAP.data);
    }

    console.log(fetchNumeroOrdensConcluidasSAP.data);

    if (fetchNumeroOrdensConcluidasSAP.isSuccess) {
      setNumeroOrdensCompraConcluidas(fetchNumeroOrdensConcluidasSAP.data);
    }

    if (fetchNumeroOrdensPorConcluirSAP.isSuccess) {
      setNumeroOrdensCompraPorConcluir(fetchNumeroOrdensPorConcluirSAP.data);
    }
  }, [
    fetchNumeroOrdensSAP.data,
    fetchNumeroOrdensSAP.isSuccess,
    fetchNumeroOrdensConcluidasSAP.data,
    fetchNumeroOrdensConcluidasSAP.isSuccess,
    fetchNumeroOrdensPorConcluirSAP.data,
    fetchNumeroOrdensPorConcluirSAP.isSuccess,
  ]);

  return (
    <div className="flex w-full flex-row justify-around my-10">
      {/*      <div className="flex flex-col rounded-md shadow-2xl max-w-max min-w-[303px] py-10 px-12 border-2 justify-center items-center">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Nº Total Ordens
        </h5>
        <p className="font-thin text-6xl text-gray-700 dark:text-gray-400">
          {numeroOrdensCompra}
        </p>
        <p>Mês de {mes[instanciaData.getMonth()]}</p>
      </div>
      <div className="flex flex-col rounded-md shadow-2xl max-w-max min-w-[303px] py-10 px-12 border-2 justify-center items-center">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Ordens Recebidas
        </h5>
        <p className="font-thin text-6xl text-gray-700 dark:text-gray-400">
          {numeroOrdensCompraConcluidas}
        </p>
        <p>Mês de {mes[instanciaData.getMonth()]}</p>
        <Progress
          className="mt-2"
          max={100}
          value={(numeroOrdensCompra * 100) / numeroOrdensCompraConcluidas}
        />
      </div>*/}

      <dl className="mt-5 w-full flex flex-row gap-10 justify-center">
        <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Ordens Totais
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {numeroOrdensCompraPorConcluir}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Ordens Mês de {`${mes[instanciaData.getMonth()]}`}
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {numeroOrdensCompra}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Ordens Recebidas {`${mes[instanciaData.getMonth()]}`}
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {numeroOrdensCompraConcluidas}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Data</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {format(instanciaData, "dd/MM/yyyy")}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Dia da Semana
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {format(instanciaData, "eeee", { locale: pt })}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default CardsOrdens;

const mes = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
