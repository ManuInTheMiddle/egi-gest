import { ColumnDef } from "@tanstack/react-table";

import { Reator } from "@/Services/OrdensProducao/fetchReatores";

const ColumnsComponent: ColumnDef<Reator>[] = [
  { accessorKey: "produtos.artigo", header: "Referência" },
  { accessorKey: "lote_fabrico", header: "Lote Fabrico" },
  { accessorKey: "produtos.descricao", header: "Descrição" },
  { accessorKey: "quantidade", header: "Quantidade" },
  { accessorKey: "reatores.descricao", header: "Reator" },
  {
    accessorKey: "status_ordens_producao.name",
    header: "Status",
    id: "status",
  },
];

export default ColumnsComponent;

/*

*/
