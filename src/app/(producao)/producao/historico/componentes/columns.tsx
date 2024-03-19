import { ColumnDef } from "@tanstack/react-table";
import { Order } from "./columnsTypes";
import { MoveRight } from "lucide-react";

const ColumnsComponent: ColumnDef<Order>[] = [
  {
    accessorKey: "ordens_producao.lote_fabrico",
    header: "Lote Fabrico",
    id: "loteFabrico",
  },
  {
    accessorKey:
      "status_ordens_producao_transaction_ordens_producao_status_anteriorTostatus_ordens_producao.name",
    header: "Estado Anterior",
    id: "estadoAnterior",
  },
  {
    id: "tableIcon",
    cell: () => {
      return <MoveRight size={16} />;
    },
  },
  {
    accessorKey:
      "status_ordens_producao_transaction_ordens_producao_status_novoTostatus_ordens_producao.name",
    header: "Estado Novo",
    id: "estadoNovo",
  },
  { accessorKey: "timestamp", header: "Timestamp", id: "timestamp" },
];

export default ColumnsComponent;
