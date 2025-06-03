"use client";
import { useState } from "react";
import { useFetchNumeroOrdensSAPData } from "@/Services/OrdensProducao/fetchNumeroOrdensSAP";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProgressBar from "react-customizable-progressbar";
import * as React from "react";
import { format, subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Search,
  ArrowRightCircle,
  ArrowLeftCircle,
  LogOut,
  XCircle,
  CheckCircle2,
  PlayCircle,
  CircleEllipsis,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Rings, ThreeCircles, ThreeDots } from "react-loader-spinner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DataTable from "./data-table";
import ColumnsComponent from "./columns";
import { useFetchOrdensSAPData } from "@/Services/OrdensProducao/fetchOrdensSAP";
import { pt } from "date-fns/locale";
import { useFetchNumeroOrdensConcluidasSAPData } from "@/Services/OrdensProducao/fetchNumeroOrdensConcluidasSAP";
import { useFetchNumeroOrdensCanceladasSAPData } from "@/Services/OrdensProducao/fetchNumeroOrdensCanceladasSAP";
import { produce } from "immer";

const TableRendering = ({
  className,
}: React.HTMLAttributes<HTMLDivElement>) => {
  const hoje = new Date();
  const [date, setDate] = useState<Date>(subDays(hoje, 5));
  const [estado, setEstado] = useState("");
  const [numeroPagina, setNumeroPagina] = useState(0);
  const proximaPagina = () => {
    const atualizarPagina = produce(numeroPagina, (draft) => {
      draft += 10;
    });
    setNumeroPagina(atualizarPagina);
  };
  const paginaAnterior = () => {
    const atualizarPagina = produce(numeroPagina, (draft) => {
      if (draft > 0) {
        draft -= 10;
      }
      draft = draft;
    });
    setNumeroPagina(atualizarPagina);
  };
  const ordensProducaoReatorSAP = useFetchOrdensSAPData(
    estado,
    format(date, "yyyy-MM-dd"),
    numeroPagina
  );
  ////////////////////////////////////////////////////////////////////////////////
  //numero de ordens//////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  const numeroOrdensSAP = useFetchNumeroOrdensSAPData(format(date, "yyyy-MM-dd"));
  const numeroOrdensConcluidasSAP = useFetchNumeroOrdensConcluidasSAPData(
    format(date, "yyyy-MM-dd")
  );
  const numeroOrdensCanceladasSAP = useFetchNumeroOrdensCanceladasSAPData(
    format(date, "yyyy-MM-dd")
  );
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  if (ordensProducaoReatorSAP.isError) {
    return <div>Error:{ordensProducaoReatorSAP.error.message}</div>;
  }

  return (
    <>
      <div className="flex flex-row justify-evenly mb-14">
        <div className="flex flex-row justify-center items-center ">
          <img
            src="/assets/icons/order.svg"
            style={{ width: 100, height: 100 }}
            className="mr-2"
          />
          <div className="flex flex-col justify-center items-center">
            {numeroOrdensSAP.isPending || numeroOrdensSAP.isRefetching ? (
              <ThreeDots
                visible={true}
                height="80"
                width="80"
                color="#4fa94d"
                radius="9"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : (
              <p className="font-thin text-6xl text-gray-700 dark:text-gray-400">
                {numeroOrdensSAP.data}
              </p>
            )}
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Ordens de Produção
            </h5>
          </div>
        </div>
        {numeroOrdensConcluidasSAP.isPending ||
        numeroOrdensConcluidasSAP.isRefetching ||
        numeroOrdensSAP.isFetching ||
        numeroOrdensSAP.isRefetching ? (
          <div className="flex flex-row justify-center items-center ">
            <ThreeCircles
              visible={true}
              height="100"
              width="100"
              color="#A0D468"
              ariaLabel="three-circles-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
            <div className="flex flex-col justify-center items-center">
              <p className="font-thin text-6xl text-gray-700 dark:text-gray-400">
                --- %
              </p>
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ordens Concluidas
              </h5>
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-center items-center ">
            <ProgressBar
              radius={100}
              progress={
                numeroOrdensConcluidasSAP?.data && numeroOrdensSAP?.data
                  ? (numeroOrdensConcluidasSAP.data * 100) /
                    numeroOrdensSAP.data
                  : 0 // Default to 0 if the data is not available
              }
              strokeWidth={18}
              strokeColor="#a0d468"
              strokeLinecap="round"
              trackStrokeWidth={18}
              counterClockwise
            />

            <div className="flex flex-col justify-center items-center">
              <p className="font-thin text-6xl text-gray-700 dark:text-gray-400">
                {numeroOrdensSAP.data &&
                numeroOrdensConcluidasSAP.data &&
                numeroOrdensSAP.data !== 0
                  ? (
                      (numeroOrdensConcluidasSAP.data * 100) /
                      numeroOrdensSAP.data
                    ).toPrecision(2)
                  : 0}
                %
              </p>
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ordens Concluidas
              </h5>
            </div>
          </div>
        )}
        {numeroOrdensSAP.isPending ||
        numeroOrdensSAP.isRefetching ||
        numeroOrdensCanceladasSAP.isPending ||
        numeroOrdensCanceladasSAP.isRefetching ? (
          <div className="flex flex-row justify-center items-center ">
            <ThreeCircles
              visible={true}
              height="100"
              width="100"
              color="#D95151"
              ariaLabel="three-circles-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
            <div className="flex flex-col justify-center items-center">
              <p className="font-thin text-6xl text-gray-700 dark:text-gray-400">
                --- %
              </p>
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ordens Canceladas
              </h5>
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-center items-center ">
            <ProgressBar
              radius={100}
              progress={
                numeroOrdensCanceladasSAP?.data && numeroOrdensSAP?.data
                  ? (numeroOrdensCanceladasSAP.data * 100) /
                    numeroOrdensSAP.data
                  : 0 // Default to 0 if the data is not available
              }
              strokeWidth={18}
              strokeColor="#D95151"
              strokeLinecap="round"
              trackStrokeWidth={18}
              counterClockwise
            />

            <div className="flex flex-col justify-center items-center">
              <p className="font-thin text-6xl text-gray-700 dark:text-gray-400">
                {numeroOrdensCanceladasSAP.data &&
                numeroOrdensSAP.data &&
                numeroOrdensSAP.data !== 0
                  ? (
                      (numeroOrdensCanceladasSAP.data * 100) /
                      numeroOrdensSAP.data
                    ).toPrecision(2)
                  : 0}
                %
              </p>
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ordens Canceladas
              </h5>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-row items-center">
        <div id="calendario" className={cn("grid gap-2", className)}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[245px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "PPP", { locale: pt })
                ) : (
                  <span>OPs a partir de:</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                locale={pt}
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button
          size={"icon"}
          className="ml-3"
          onClick={() => {
            ordensProducaoReatorSAP.refetch();
            numeroOrdensSAP.refetch();
          }}
        >
          {ordensProducaoReatorSAP.isRefetching ? (
            <Rings
              visible={true}
              height="40"
              width="40"
              color="#FFFFFF"
              ariaLabel="rings-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          ) : (
            <Search />
          )}
        </Button>
        <div className="ml-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Filtrar Estado</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Estados</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setEstado("boposPlanned")}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  <span>Planeada</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEstado("boposReleased")}>
                  <CircleEllipsis className="mr-2 h-4 w-4" />
                  <span>Autorizada a sair</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEstado("boposClosed")}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span>Fechado</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEstado("boposCancelled")}>
                  <XCircle className="mr-2 h-4 w-4" />
                  <span>Cancelada</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setEstado("")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Reset Filtros</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="ml-3">
          {estado === "boposPlanned" ? (
            <PlayCircle
              style={{ width: 24, height: 24 }}
              color="grey"
              strokeWidth={1.5}
            />
          ) : estado === "boposReleased" ? (
            <CircleEllipsis size={24} color="orange" strokeWidth={1.5} />
          ) : estado === "boposClosed" ? (
            <CheckCircle2 size={24} color="green" strokeWidth={1.5} />
          ) : estado === "boposCancelled" ? (
            <XCircle size={24} color="red" strokeWidth={1.5} />
          ) : (
            <></>
          )}
        </div>
      </div>
      {ordensProducaoReatorSAP.isPending ? (
        <div className="space-y-2 mt-10 px-5">
          <Skeleton className="h-[60px] mx-auto w-full mb-3" />
          <Skeleton className="h-[48px] mx-auto w-full" />
          <Skeleton className="h-[48px] mx-auto w-full " />
          <Skeleton className="h-[48px] mx-auto w-full" />
          <Skeleton className="h-[48px] mx-auto w-full" />
        </div>
      ) : (
        <>
          <DataTable
            columns={ColumnsComponent}
            data={ordensProducaoReatorSAP.data.value}
          />
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex flex-row items-center">
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Pagina
              </div>
              <div>{numeroPagina}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size={"icon"}
                className="h-8 w-8 p-0"
                onClick={() => {
                  paginaAnterior();
                  ordensProducaoReatorSAP.refetch();
                }}
                disabled={
                  ordensProducaoReatorSAP.data.value.length === 0 ||
                  numeroPagina === 0
                }
              >
                <span className="sr-only">Página Anterior</span>
                <ArrowLeftCircle color="#84CC27" size={30} strokeWidth={1.5} />
              </Button>
              <Button
                variant="ghost"
                size={"icon"}
                className="h-8 w-8 p-0"
                onClick={() => {
                  proximaPagina();
                  ordensProducaoReatorSAP.refetch();
                }}
                disabled={
                  ordensProducaoReatorSAP.data["odata.nextLink"]?.length ===
                    0 || ordensProducaoReatorSAP.data.value.length === 0
                }
              >
                <span className="sr-only">Próxima Página</span>
                <ArrowRightCircle color="#84CC27" size={30} strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TableRendering;
