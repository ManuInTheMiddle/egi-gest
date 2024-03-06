"use client";
import { ordemProducao } from "../../../../public/assets/mockData/ordensFabrico";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
                  navigator.clipboard.writeText(ordemProd.loteFabrico)
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
                <FormularioInformacao />
              </DialogDescription>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      );
    },
  },
];

export default ColumnsComponent;
