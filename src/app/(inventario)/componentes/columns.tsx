"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Printer, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the interface for individual item details
interface ItemDetails {
  BatchNum: string;
  IsBatchManaged: string;
  ItemCode: string;
  ItemName: string;
  Quantity: number;
  WhsCode: string;
}

// Make columns a function that accepts action handlers
export const createColumns = (
  onOpenPrintModal?: (item: ItemDetails) => void,
  onOpenTransferModal?: (item: ItemDetails) => void
): ColumnDef<ItemDetails>[] => [
  {
    accessorKey: "ItemCode",
    header: "Código",
  },
  {
    accessorKey: "ItemName",
    header: "Nome",
  },
  {
    accessorKey: "IsBatchManaged",
    header: "Contém Lote",
    cell: ({ row }) => {
      // Convert the batch managed flag to a more readable format
      const isBatchManaged = row.getValue("IsBatchManaged") as string;
      return isBatchManaged === "Y" ? "Sim" : "Não";
    },
  },
  {
    accessorKey: "WhsCode",
    header: "Armazém",
  },
  {
    accessorKey: "BatchNum",
    header: "Lote",
  },
  {
    accessorKey: "Quantity",
    header: "Quantidade",
    cell: ({ row }) => {
      // Format the quantity with proper number formatting
      const quantity = parseFloat(row.getValue("Quantity"));
      return new Intl.NumberFormat("pt-PT", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(quantity);
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex space-x-2">
          {onOpenPrintModal && (
            <Button
              onClick={() => onOpenPrintModal(item)}
              variant="outline"
              size="sm"
            >
              <Printer className="mr-1 h-4 w-4" />
              Imprimir
            </Button>
          )}
          {onOpenTransferModal && (
            <Button
              onClick={() => onOpenTransferModal(item)}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <ArrowRightLeft className="mr-1 h-4 w-4" />
              Transferir
            </Button>
          )}
        </div>
      );
    },
  },
];

// Export the type for use in other components
export type { ItemDetails };
