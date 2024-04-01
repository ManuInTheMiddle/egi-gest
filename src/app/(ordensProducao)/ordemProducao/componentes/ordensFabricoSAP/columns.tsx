import { ColumnDef } from "@tanstack/react-table";

import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensSAP";

const ColumnsComponentSap: ColumnDef<ProductionOrder>[] = [
  {
    accessorKey: "AbsoluteEntry",
    header: "Nº",
    id: "nrOrdem",
    filterFn: (row, columnId, filterValue) => {
      const data: number = row.getValue(columnId);
      //console.log(data.toString());
      //console.log(filterValue);
      return data.toString().includes(filterValue);
    },
  },
  { accessorKey: "ItemNo", header: "Referência", id: "referenciaOrdem" },
  { accessorKey: "PlannedQuantity", header: "Quantidade Planeada" },
  { accessorKey: "ProductDescription", header: "Descrição" },
  { accessorKey: "CreationDate", header: "Data Criação" },
];

export default ColumnsComponentSap;

/*

*/
