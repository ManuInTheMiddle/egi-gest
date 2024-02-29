"use client";
import { ordemProducao } from "../../../../public/assets/mockData/ordensFabrico";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ColumnsComponent: ColumnDef<ordemProducao>[] = [
  { accessorKey: "referencia", header: "Referência" },
  { accessorKey: "loteFabrico", header: "Lote Fabrico" },
  { accessorKey: "descricao", header: "Descrição" },
  { accessorKey: "quantidade", header: "Quantidade" },
  { accessorKey: "status", header: "Status" },
  {
    id: "actions",
    cell: ({ row }) => {
      const ordemProd = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir Menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Opções</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(ordemProd.loteFabrico)
              }
            >
              Copiar Lote Fabrico
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Detalhes da Ordem</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default ColumnsComponent;
