import { ColumnDef } from "@tanstack/react-table";

import { ordemProducaoPlanear } from "../../../../public/assets/mockData/ordensFabrico";

const ColumnsComponent: ColumnDef<ordemProducaoPlanear>[] = [
  { accessorKey: "referencia", header: "Referência" },
  { accessorKey: "loteFabrico", header: "Lote Fabrico" },
  { accessorKey: "descricao", header: "Descrição" },
  { accessorKey: "quantidade", header: "Quantidade" },
  { accessorKey: "reator", header: "Reator" },
  {
    accessorKey: "status",
    header: "Status",
    id: "status",
  },
];

export default ColumnsComponent;
