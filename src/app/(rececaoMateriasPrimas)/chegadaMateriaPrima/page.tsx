"use client";
import { useState } from "react";
import CardsOrdens from "./componentes/cardsOrdens";
import Retorceder from "./componentes/retorceder";
import { DataTable } from "./componentes/tabela/DataTable";
import { Colunas } from "./componentes/tabela/Colunas";
import { Button } from "@/components/ui/button";
import { Rings } from "react-loader-spinner";
import {
  Search,
  Calendar as CalendarIcon,
  ArrowLeftCircle,
  ArrowRightCircle,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useFetchOrdensCompraSAPData } from "@/Services/OrdensCompra/fetchOrdensCompraSAP";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const hoje = new Date();
  const [date, setDate] = useState<Date>(new Date(hoje.getFullYear(), 0, 1));
  const [estado, setEstado] = useState("");
  const [numeroPagina, setNumeroPagina] = useState(0);

  const handleDateChange = (value: any) => {
    if (value) {
      setDate(value);
      setNumeroPagina(0);
    }
  };

  //Logica de paginacao
  /////////////////////////////////////////////////////////////

  const itensPorPagina = 20;

  const paginaAtual = Math.floor(numeroPagina / itensPorPagina) + 1;

  const handlePaginaSeguinte = () => {
    setNumeroPagina((prev) => prev + itensPorPagina);
  };

  const handlePaginaAnterior = () => {
    setNumeroPagina((prev) =>
      prev >= itensPorPagina ? prev - itensPorPagina : 0,
    );
  };
  const handlePrimeiraPagina = () => {
    setNumeroPagina(0);
  };
  /////////////////////////////////////////////////////////////

  const ordensCompraSAP = useFetchOrdensCompraSAPData(
    format(date, "yyyy-MM-dd"),
    numeroPagina,
  );
  /////////////////////////////////////////////////////////////

  return (
    <div className="flex flex-col">
      <section className="border-2 border-slate-600 rounded-md p-5 shadow-2xl items-center h-full min-h-screen justify-start m-1 w-full max-w-full">
        <Retorceder />
        <CardsOrdens />
        <div className="flex flex-col gap-x-1 max-h-screen w-full">
          <div className="flex flex-row items-center m-2 justify-between">
            <div className="flex flex-row gap-x-2">
              <div id="calendario" className={"grid gap-2"}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[245px] justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        format(date, "PPP", { locale: pt })
                      ) : (
                        <span>OCs a partir de:</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      locale={pt}
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div id="botaoProcura" className="gap-x-2 flex flex-col">
                <div>
                  <Button
                    size={"icon"}
                    variant={"default"}
                    onClick={() => ordensCompraSAP.refetch()}
                  >
                    {ordensCompraSAP.isRefetching ? (
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
                </div>
              </div>
            </div>
            <div id="paginas" className="flex flex-row items-center gap-x-2">
              <Button
                variant="ghost"
                size={"icon"}
                className="h-8 w-8 p-0"
                disabled={numeroPagina <= 0}
                onClick={() => {
                  handlePaginaAnterior();
                }}
              >
                <span className="sr-only">Página Anterior</span>
                <ArrowLeftCircle color="#84CC27" size={30} strokeWidth={1.5} />
              </Button>
              <h2>Página</h2>
              <Label className="text-lg">{paginaAtual}</Label>
              <Button
                variant="ghost"
                size={"icon"}
                className="h-8 w-8 p-0"
                disabled={
                  ordensCompraSAP.data === undefined ||
                  ordensCompraSAP.data.value.length === 0
                }
                onClick={() => {
                  handlePaginaSeguinte();
                }}
              >
                <span className="sr-only">Próxima Página</span>
                <ArrowRightCircle color="#84CC27" size={30} strokeWidth={1.5} />
              </Button>
            </div>
          </div>
          {ordensCompraSAP.isError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Erro ao carregar dados
              </h3>
              <p className="text-gray-600 mb-4">
                Não foi possível carregar as ordens de compra.
              </p>
              <Button
                onClick={() => ordensCompraSAP.refetch()}
                variant="outline"
              >
                Tentar novamente
              </Button>
            </div>
          ) : ordensCompraSAP.data?.value ? (
            <DataTable columns={Colunas} data={ordensCompraSAP.data.value} />
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Page;
