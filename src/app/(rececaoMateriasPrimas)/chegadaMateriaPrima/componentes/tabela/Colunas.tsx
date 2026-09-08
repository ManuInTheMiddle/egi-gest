"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PurchaseOrder } from "@/Services/OrdensCompra/fetchOrdensCompraSAP";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

const ActionCell = ({ row }: { row: any }) => {
  const router = useRouter();
  const ordemCompraSAP = row.original;

  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      onClick={() => {
        router.push(
          `/chegadaMateriaPrima/detalhesOrdem/${ordemCompraSAP.DocEntry}`
        );
      }}
    >
      <QrCode className="h-4 w-4" />
    </Button>
  );
};

export const Colunas: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: "DocEntry",
    header: "Número Ordem",
  },
  {
    accessorKey: "CardName",
    header: "Fornecedor",
  },
  {
    header: "Estado",
    cell: ({ row }) => {
      const ordemCompraSAP = row.original;
      //estados possiveis da rececao de um objeto
      const primeiroIndexMercadoriaPorReceber =
        ordemCompraSAP.DocumentLines.findIndex(
          (itemCompradoNaOrdem) =>
            itemCompradoNaOrdem.LineStatus === "bost_Open"
        );

      return primeiroIndexMercadoriaPorReceber !== -1 ? (
        <span className="bg-red-100 drop-shadow-[0_35px_35px_rgba(252,165,165,0.60)] text-red-800 text-s font-medium me-2 mt-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
          A Decorrer
        </span>
      ) : (
        <span className="bg-green-100 drop-shadow-[0_35px_35px_rgba(134,239,172,0.60)] text-green-800 text-s font-medium me-2 mt-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
          Concluída
        </span>
      );
    },
  },
  {
    accessorKey: "UpdateDate",
    header: "Data Atualização",
    cell: ({ row }) => {
      return format(row.original.UpdateDate, "yyyy-MM-dd-HH:mm");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
