import { ColumnDef } from "@tanstack/react-table";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";
//import { OrderHistory } from "@/app/api/ordensProducao/historico/route";
import {
  CircleEllipsis,
  PlayCircle,
  CheckCircle2,
  XCircle,
  TrendingDown,
} from "lucide-react";
interface historicoOrdensProducaoScada {
  idHistoricoOP: number;
  numOP: number;
  evento: string;
  parametro: string;
  estadoAnterior: string;
  estadoNovo: string;
  dataHora: string;
}

const ColumnsComponent: ColumnDef<historicoOrdensProducaoScada>[] = [
  {
    accessorKey: "numOP",
    header: "Número Ordem",
    id: "numOP",
    filterFn: (row, columnId, filterValue) => {
      const data: number = row.getValue(columnId);
      //console.log(data.toString());
      //console.log(filterValue);
      return data.toString().includes(filterValue);
    },
  },
  {
    accessorKey: "evento",
    header: "Evento",
    id: "evento",
    cell: ({ row }) => {
      const evento = row.original;
      if (evento.evento == "UpdateReator") {
        return (
          <div className="flex flex-row justify-between">
            <p>Update Reator</p>
            <img
              src="/assets/icons/Reator.svg"
              alt="Update Reator"
              style={{ width: "25px", height: "25px" }}
              className="self-end"
            />
          </div>
        );
      }
      if (evento.evento == "UpdateEstadoOP") {
        return (
          <div className="flex flex-row justify-between">
            <p>Update Estado Ordem</p>
            <img
              src="/assets/icons/estadoOP.svg"
              alt="Update Estado Ordem Producao"
              style={{ width: "25px", height: "25px" }}
            />
          </div>
        );
      }
      if (evento.evento == "ConsumoMP") {
        return (
          <div className="flex flex-row justify-between">
            <p>Consumo Matéria Prima</p>
            <img
              src="/assets/icons/ConsumoMP.svg"
              alt="Consumo de materia prima"
              style={{ width: "25px", height: "25px" }}
            />
          </div>
        );
      }
      if (evento.evento == "CriacaoOP") {
        return (
          <div className="flex flex-row justify-between">
            <p>Criação Ordem Produção</p>
            <img
              src="/assets/icons/criacaoOrdemProducao.svg"
              alt="Criacao Ordem Producao"
              style={{ width: "25px", height: "25px" }}
            />
          </div>
        );
      }
    },
  },
  {
    accessorKey: "parametro",
    header: "Parametro",
    id: "parametro",
  },
  {
    accessorKey: "estadoAnterior",
    header: "Estado Anterior",
    id: "estadoAnterior",
    cell: ({ row }) => {
      const estadoAnterior = row.original;
      if (estadoAnterior.evento == "UpdateEstadoOP") {
        if (estadoAnterior.estadoAnterior == "1") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Planeada</p>
              <PlayCircle color="grey" strokeWidth={1.5} />
            </div>
          );
        }
        if (estadoAnterior.estadoAnterior == "2") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Autorizada a sair</p>
              <CircleEllipsis color="orange" strokeWidth={1.5} />
            </div>
          );
        }
        if (estadoAnterior.estadoAnterior == "3") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Fechada</p>
              <CheckCircle2 color="green" strokeWidth={1.5} />
            </div>
          );
        }
        if (estadoAnterior.estadoAnterior == "4") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Cancelada</p>
              <XCircle color="red" strokeWidth={1.5} />
            </div>
          );
        }
      }
      if (estadoAnterior.evento == "CriacaoOP") {
        return row.original.estadoAnterior;
      }

      if (estadoAnterior.evento == "UpdateReator") {
        return `Reator ${row.original.estadoAnterior}`;
      }
      if (estadoAnterior.evento == "ConsumoMP") {
        return row.original.estadoAnterior;
      }
    },
  },
  {
    accessorKey: "estadoNovo",
    header: "Estado Novo",
    id: "estadoNovo",
    cell: ({ row }) => {
      const estadoNovo = row.original;

      if (estadoNovo.evento == "UpdateEstadoOP") {
        if (estadoNovo.estadoNovo == "1") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Planeada</p>
              <PlayCircle color="grey" strokeWidth={1.5} />
            </div>
          );
        }
        if (estadoNovo.estadoNovo == "2") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Autorizada a sair</p>
              <CircleEllipsis color="orange" strokeWidth={1.5} />
            </div>
          );
        }
        if (estadoNovo.estadoNovo == "3") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Fechada</p>
              <CheckCircle2 color="green" strokeWidth={1.5} />
            </div>
          );
        }
        if (estadoNovo.estadoNovo == "4") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Cancelada</p>
              <XCircle color="red" strokeWidth={1.5} />
            </div>
          );
        }
      }
      if (
        estadoNovo.evento == "CriacaoOP" &&
        estadoNovo.parametro == "Estado Ordem"
      ) {
        if (estadoNovo.estadoNovo == "1") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Planeada</p>
              <PlayCircle color="grey" strokeWidth={1.5} />
            </div>
          );
        }
        if (estadoNovo.estadoNovo == "2") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Autorizada a sair</p>
              <CircleEllipsis color="orange" strokeWidth={1.5} />
            </div>
          );
        }
        if (estadoNovo.estadoNovo == "3") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Fechada</p>
              <CheckCircle2 color="green" strokeWidth={1.5} />
            </div>
          );
        }
        if (estadoNovo.estadoNovo == "4") {
          return (
            <div className="flex flex-row justify-between items-center">
              <p>Cancelada</p>
              <XCircle color="red" strokeWidth={1.5} />
            </div>
          );
        }
      }
      if (
        estadoNovo.evento == "CriacaoOP" &&
        estadoNovo.parametro == "Reator"
      ) {
        return `Reator ${row.original.estadoNovo}`;
      }
      if (estadoNovo.evento == "UpdateReator") {
        return `Reator ${row.original.estadoNovo}`;
      }

      if (estadoNovo.evento == "ConsumoMP") {
        return (
          <div className="flex flex-row justify-between items-center">
            <p>{row.original.estadoNovo}</p>
            <TrendingDown color="red" strokeWidth={1.5} />
          </div>
        );
      }
    },
  },
  {
    accessorKey: "dataHora",
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
