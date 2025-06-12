"use client";
import React from "react";
import QrcodeComponent from "@/components/ui/qrcodeComponent";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface SalesOrderCardProps {
  ordemVenda: any; // Use your existing type
  index: number;
}

const SalesOrderCard: React.FC<SalesOrderCardProps> = ({
  ordemVenda,
  index,
}) => {
  return (
    <li
      key={`${ordemVenda.DocEntry}-${index}`}
      className="col-span-1 flex flex-col divide-y max-w-[350px] divide-gray-200 rounded-lg bg-white text-center shadow-2xl"
    >
      <div className="flex flex-1 flex-col p-8 mx-auto">
        <div className="mx-auto h-32 w-32 flex-shrink-0 rounded-full">
          <QrcodeComponent
            information={`F:ordemvenda&C1:docentry&C2:${ordemVenda.DocEntry}&C3:&C4:&C5:&C6:&`}
          />
        </div>
        <h3 className="mt-6 text-sm font-medium text-gray-500">
          #{ordemVenda.DocEntry}
        </h3>
        <dl className="mt-1 flex flex-grow flex-col justify-between">
          <dt className="sr-only">Cliente</dt>
          <dd className="text-base font-semibold text-black">
            {ordemVenda.CardName}
          </dd>
          <dt className="sr-only">Data</dt>
          <dd className="text-sm text-gray-500 mt-2">
            {format(ordemVenda.CreationDate, "PP", { locale: pt })}
          </dd>
          <dt className="sr-only">Estado</dt>
          <dd className="mt-3">
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              {ordemVenda.DocumentStatus === "bost_Open" ? (
                <span className="text-green-300">Aberta</span>
              ) : (
                <span className="text-red-300">Fechada</span>
              )}
            </span>
          </dd>
        </dl>
      </div>
      <div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="flex w-0 flex-1">
            <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
              Atualizado a:{" "}
              {format(ordemVenda.UpdateDate, "PP", { locale: pt })}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default SalesOrderCard;
