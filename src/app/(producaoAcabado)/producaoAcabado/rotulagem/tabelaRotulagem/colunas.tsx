"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CircleEllipsis,
  PlayCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensSAP";

const ColunasComponente: ColumnDef<ProductionOrder>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value:any) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "AbsoluteEntry",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Número Ordem
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const data: number = row.getValue(columnId);
      //console.log(data.toString());
      //console.log(filterValue);
      return data.toString().includes(filterValue);
    },
    id: "numeroOP",
  },
  { accessorKey: "ItemNo", header: "Receita" },
  { accessorKey: "ProductDescription", header: "Descrição" },
  { accessorKey: "PlannedQuantity", header: "Quantidade" },
  {
    accessorKey: "ProductionOrderStatus",
    header: "Estado",
    id: "status",
    cell: ({ row }) => {
      const ordemProducao = row.original;
      if (ordemProducao.ProductionOrderStatus === "boposPlanned") {
        return (
          <div className="flex flex-row justify-between">
            <p>Planeada</p>
            <PlayCircle color="grey" strokeWidth={1.5} />
          </div>
        );
      }
      if (ordemProducao.ProductionOrderStatus === "boposReleased") {
        return (
          <div className="flex flex-row justify-between">
            <p>Autorizada a sair</p>
            <CircleEllipsis color="orange" strokeWidth={1.5} />
          </div>
        );
      }
      if (ordemProducao.ProductionOrderStatus === "boposClosed") {
        return (
          <div className="flex flex-row justify-between">
            <p>Fechada</p>
            <CheckCircle2 color="green" strokeWidth={1.5} />
          </div>
        );
      }
      if (ordemProducao.ProductionOrderStatus === "boposCancelled") {
        return (
          <div className="flex flex-row justify-between">
            <p>Cancelada</p>
            <XCircle color="red" strokeWidth={1.5} />
          </div>
        );
      }
    },
  },
];

export default ColunasComponente;