"use client";
import { useState, useCallback, useMemo } from "react";
import { useFetchNumeroOrdensSAPProduction } from "@/Services/OrdensProducao/fetchNumeroOrdensSAP";
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
import { useFetchNumeroOrdensConcluidasSAPProduction } from "@/Services/OrdensProducao/fetchNumeroOrdensConcluidasSAP";
import { useFetchNumeroOrdensCanceladasSAPProduction } from "@/Services/OrdensProducao/fetchNumeroOrdensCanceladasSAP";

const TableRendering = ({
  className,
}: React.HTMLAttributes<HTMLDivElement>) => {
  const hoje = new Date();
  const [date, setDate] = useState<Date>(subDays(hoje, 5));
  const [estado, setEstado] = useState("");
  const [numeroPagina, setNumeroPagina] = useState(0);

  // ✅ FIXED: Proper pagination handlers for primitive values
  const proximaPagina = useCallback(() => {
    setNumeroPagina((prev) => prev + 20);
  }, []);

  const paginaAnterior = useCallback(() => {
    setNumeroPagina((prev) => (prev > 0 ? prev - 20 : 0));
  }, []);

  // ✅ FIXED: Memoize the formatted date to prevent unnecessary re-renders
  const formattedDate = useMemo(() => format(date, "yyyy-MM-dd"), [date]);

  // ✅ All hooks called consistently
  const ordensProducaoReatorSAP = useFetchOrdensSAPData(
    estado,
    formattedDate,
    numeroPagina
  );

  const numeroOrdensSAP = useFetchNumeroOrdensSAPProduction(formattedDate);
  const numeroOrdensConcluidasSAP =
    useFetchNumeroOrdensConcluidasSAPProduction(formattedDate);
  const numeroOrdensCanceladasSAP =
    useFetchNumeroOrdensCanceladasSAPProduction(formattedDate);

  // ✅ FIXED: Memoize computed values
  const completionPercentage = useMemo(() => {
    if (
      numeroOrdensConcluidasSAP.data &&
      numeroOrdensSAP.data &&
      numeroOrdensSAP.data !== 0
    ) {
      return (numeroOrdensConcluidasSAP.data * 100) / numeroOrdensSAP.data;
    }
    return 0;
  }, [numeroOrdensConcluidasSAP.data, numeroOrdensSAP.data]);

  const cancellationPercentage = useMemo(() => {
    if (
      numeroOrdensCanceladasSAP.data &&
      numeroOrdensSAP.data &&
      numeroOrdensSAP.data !== 0
    ) {
      return (numeroOrdensCanceladasSAP.data * 100) / numeroOrdensSAP.data;
    }
    return 0;
  }, [numeroOrdensCanceladasSAP.data, numeroOrdensSAP.data]);

  // ✅ FIXED: Memoize loading states
  const isLoadingStats = useMemo(() => {
    return (
      numeroOrdensSAP.isPending ||
      numeroOrdensSAP.isRefetching ||
      numeroOrdensConcluidasSAP.isPending ||
      numeroOrdensConcluidasSAP.isRefetching
    );
  }, [
    numeroOrdensSAP.isPending,
    numeroOrdensSAP.isRefetching,
    numeroOrdensConcluidasSAP.isPending,
    numeroOrdensConcluidasSAP.isRefetching,
  ]);

  const isLoadingCancelled = useMemo(() => {
    return (
      numeroOrdensSAP.isPending ||
      numeroOrdensSAP.isRefetching ||
      numeroOrdensCanceladasSAP.isPending ||
      numeroOrdensCanceladasSAP.isRefetching
    );
  }, [
    numeroOrdensSAP.isPending,
    numeroOrdensSAP.isRefetching,
    numeroOrdensCanceladasSAP.isPending,
    numeroOrdensCanceladasSAP.isRefetching,
  ]);

  // ✅ FIXED: Memoize event handlers
  const handleRefetch = useCallback(() => {
    ordensProducaoReatorSAP.refetch();
    numeroOrdensSAP.refetch();
  }, [ordensProducaoReatorSAP, numeroOrdensSAP]);

  const handleDateSelect = useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  const handlePreviousPage = useCallback(() => {
    paginaAnterior();
    ordensProducaoReatorSAP.refetch();
  }, [paginaAnterior, ordensProducaoReatorSAP]);

  const handleNextPage = useCallback(() => {
    proximaPagina();
    ordensProducaoReatorSAP.refetch();
  }, [proximaPagina, ordensProducaoReatorSAP]);

  // ✅ FIXED: Memoize filter handlers
  const handleEstadoChange = useCallback((newEstado: string) => {
    setEstado(newEstado);
  }, []);

  // Early return for error state
  if (ordensProducaoReatorSAP.isError) {
    return <div>Error: {ordensProducaoReatorSAP.error.message}</div>;
  }

  return (
    <>
      <div className="flex flex-row justify-evenly mb-14">
        {/* Total Orders Card */}
        <div className="flex flex-row justify-center items-center">
          <img
            src="/assets/icons/order.svg"
            style={{ width: 100, height: 100 }}
            className="mr-2"
            alt="Orders icon"
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

        {/* Completed Orders Card */}
        {isLoadingStats ? (
          <div className="flex flex-row justify-center items-center">
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
          <div className="flex flex-row justify-center items-center">
            <ProgressBar
              radius={100}
              progress={completionPercentage}
              strokeWidth={18}
              strokeColor="#a0d468"
              strokeLinecap="round"
              trackStrokeWidth={18}
              counterClockwise
            />
            <div className="flex flex-col justify-center items-center">
              <p className="font-thin text-6xl text-gray-700 dark:text-gray-400">
                {completionPercentage.toPrecision(2)}%
              </p>
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ordens Concluidas
              </h5>
            </div>
          </div>
        )}

        {/* Cancelled Orders Card */}
        {isLoadingCancelled ? (
          <div className="flex flex-row justify-center items-center">
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
          <div className="flex flex-row justify-center items-center">
            <ProgressBar
              radius={100}
              progress={cancellationPercentage}
              strokeWidth={18}
              strokeColor="#D95151"
              strokeLinecap="round"
              trackStrokeWidth={18}
              counterClockwise
            />
            <div className="flex flex-col justify-center items-center">
              <p className="font-thin text-6xl text-gray-700 dark:text-gray-400">
                {cancellationPercentage.toPrecision(2)}%
              </p>
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ordens Canceladas
              </h5>
            </div>
          </div>
        )}
      </div>

      {/* Controls Section */}
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
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button size={"icon"} className="ml-3" onClick={handleRefetch}>
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
                <DropdownMenuItem
                  onClick={() => handleEstadoChange("boposPlanned")}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  <span>Planeada</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEstadoChange("boposReleased")}
                >
                  <CircleEllipsis className="mr-2 h-4 w-4" />
                  <span>Autorizada a sair</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEstadoChange("boposClosed")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span>Fechado</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEstadoChange("boposCancelled")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  <span>Cancelada</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleEstadoChange("")}>
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
          ) : null}
        </div>
      </div>

      {/* Table Section */}
      {ordensProducaoReatorSAP.isPending ? (
        <div className="space-y-2 mt-10 px-5">
          <Skeleton className="h-[60px] mx-auto w-full mb-3" />
          <Skeleton className="h-[48px] mx-auto w-full" />
          <Skeleton className="h-[48px] mx-auto w-full" />
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
              <div>{Math.floor(numeroPagina / 20) + 1}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size={"icon"}
                className="h-8 w-8 p-0"
                onClick={handlePreviousPage}
                disabled={numeroPagina === 0}
              >
                <span className="sr-only">Página Anterior</span>
                <ArrowLeftCircle color="#84CC27" size={30} strokeWidth={1.5} />
              </Button>
              <Button
                variant="ghost"
                size={"icon"}
                className="h-8 w-8 p-0"
                onClick={handleNextPage}
                disabled={
                  ordensProducaoReatorSAP.data["odata.nextLink"]?.length ===
                    0 ||
                  ordensProducaoReatorSAP.data.value.length === 0 ||
                  ordensProducaoReatorSAP.data.value.length < 20
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
