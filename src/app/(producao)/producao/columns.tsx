"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CircleEllipsis,
  PlayCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@radix-ui/react-dialog";
import FormularioInformacao from "./formularioInformacao";
import { OrdemProducao } from "@/types";

const ColumnsComponent: ColumnDef<OrdemProducao>[] = [
  {
    accessorKey: "produtos.artigo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Referência
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  { accessorKey: "lote_fabrico", header: "Lote Fabrico" },
  { accessorKey: "produtos.descricao", header: "Descrição" },
  { accessorKey: "quantidade", header: "Quantidade" },
  {
    accessorKey: "status_ordens_producao.name",
    header: "Status",
    id: "status",
  },
  {
    id: "statusIcon",
    cell: ({ row }) => {
      const ordemProd = row.original;
      if (ordemProd.status_ordens_producao.name === "Planeada") {
        return <PlayCircle color="grey" strokeWidth={1.5} />;
      }
      if (ordemProd.status_ordens_producao.name === "A Decorrer") {
        return <CircleEllipsis color="orange" strokeWidth={1.5} />;
      }
      if (ordemProd.status_ordens_producao.name === "Finalizada") {
        return <CheckCircle2 color="green" strokeWidth={1.5} />;
      }
      if (ordemProd.status_ordens_producao.name === "Cancelada") {
        return <XCircle color="red" strokeWidth={1.5} />;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ordemProd = row.original;
      return (
        <Dialog>
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
                  navigator.clipboard.writeText(ordemProd.lote_fabrico)
                }
              >
                Copiar Lote Fabrico
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DialogTrigger>
                <DropdownMenuItem>Detalhes da Ordem</DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogPortal>
            <DialogOverlay className="DialogOverlay" />
            <DialogContent className="DialogContent">
              <DialogHeader>
                <DialogTitle>Detalhes do Lote de Fabrico</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <FormularioInformacao {...ordemProd} />
              </DialogDescription>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      );
    },
  },
];

export default ColumnsComponent;
