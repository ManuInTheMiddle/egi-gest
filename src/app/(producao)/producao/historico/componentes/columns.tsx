import { ColumnDef, Row } from "@tanstack/react-table";
import { Order } from "./columnsTypes";
import { MoveRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateValues, isWithinInterval, parseISO } from "date-fns";

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
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    id: "timestamp",
    filterFn: (row, columnId, filteredValue: DateRange) => {
      const data: string = row.getValue(columnId);
      const parsedData = parseISO(data);
      /*
      console.log(`Data from:${filteredValue.from}`);
      console.log(`Data to:${filteredValue.to}`);
      console.log(`Data da row:${parsedData}`);
      */

      const DataInicio = new Date(filteredValue.from?.toLocaleString("en-US")!);
      const DataFim = new Date(filteredValue.to?.toLocaleString("en-US")!);
      const DataDaRow = new Date(parsedData.toLocaleString("en-US"));
      /*
      console.log(
        isWithinInterval(DataDaRow, { start: DataInicio, end: DataFim })
      );
      */
      return isWithinInterval(DataDaRow, { start: DataInicio, end: DataFim })
        ? true
        : false;
    },
  },
];

export default ColumnsComponent;
