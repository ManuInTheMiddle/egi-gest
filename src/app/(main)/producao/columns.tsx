import { ordemProducao } from "../../../../public/assets/mockData/ordensFabrico";
import { ColumnDef } from "@tanstack/react-table";

const ColumnsComponent: ColumnDef<ordemProducao>[] = [
  { accessorKey: "referencia", header: "Referência" },
  { accessorKey: "loteFabrico", header: "Lote Fabrico" },
  { accessorKey: "descricao", header: "Descrição" },
  { accessorKey: "quantidade", header: "Quantidade" },
  { accessorKey: "status", header: "Status" },
];

export default ColumnsComponent;
