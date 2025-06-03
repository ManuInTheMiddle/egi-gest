"use client";
import React, { useEffect, useState } from "react";
import { produce } from "immer";
import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ColumnFiltersState,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { ScrollText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAtualizarEstadoOrdemSAP } from "@/Services/OrdensProducao/updateEstadoOrdemSAP";
import { useCriarOrdemProducaoSCADA } from "@/Services/OrdensProducao/criarOrdemProducaoSCADA";
import { useFetchOrdemProdSCADA } from "@/Services/OrdensProducao/fetchOrdemProducaoSCADA";
import { useAtualizarReatorOrdemSCADA } from "@/Services/OrdensProducao/updateReatorOrdemSCADA";
import { useFetchConsumosSCADA } from "@/Services/Consumos/fetchConsumosSCADA";
import { useConsumoSAP } from "@/Services/Consumos/criarConsumo";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";

interface estadoOrdensSapI{
  estado:"boposReleased" | "boposClosed" | "boposCancelled" | "boposPlanned"
}

interface reatorOrdemProducao {
  //idReatorAntes: number;
  idReatorAtual: number;
  numeroOrdemProducao: number;
}

interface estadoOrdemProducao {
  //estadoSAPAntes: string;
  estadoSAPAtual: string;
  numeroOrdemProducao: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function DataTable<TData  extends ProductionOrder, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableMultiRowSelection: false,
    initialState: { pagination: { pageSize: 20 } },
    state: {
      columnFilters,
      sorting,
      rowSelection,
    },
  });

  const horario = new Date();
  ///////////////////////////////////////////////////////////////////////////////////
  const [numOP, setNumOP] = useState("");
  const criarOrdemProducaoSCADAMutation = useCriarOrdemProducaoSCADA();
  const enviarConsumoSAPMutation = useConsumoSAP();
  const atualizarReatorOrdemSCADAMutation = useAtualizarReatorOrdemSCADA();
  const fetchOrdemProdSCADA = useFetchOrdemProdSCADA(numOP);
  const fetchConsumosSCADA = useFetchConsumosSCADA(numOP);
  const [criouOrdemSCADA, setCriouOrdemSCADA] = useState<number[]>([]);
  const [reatorOP, setReator] = useState<reatorOrdemProducao>({
    idReatorAtual: 0,
    numeroOrdemProducao: 0,
  });

  const [mudancaReator, setMudancaReator] = useState(false);
  ///////////////////////////////////////////////////////////////////////////////////
  const atualizarEstadoOrdemMutation = useAtualizarEstadoOrdemSAP();
  const [estadoOP, setEstadoOP] = useState<estadoOrdemProducao>({
    estadoSAPAtual: "",
    numeroOrdemProducao: 0,
  });
  const [mudancaEstado, setMudancaEstado] = useState(false);
  const [enviarMudancaSAP, setEnviarMudancaSAP] = useState(false);
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const imprimirEtiqueta = async (informacaoEtiqueta: any) => {
    const browserPrint = new ZebraBrowserPrintWrapper();
    //const defaultPrinter = await browserPrint.getDefaultPrinter();
    //browserPrint.setPrinter(defaultPrinter);
    const foundPrinter = await browserPrint.getAvailablePrinters();
    console.log(foundPrinter[0]);
    browserPrint.setPrinter(foundPrinter[0]);

    const printerStatus = await browserPrint.checkPrinterStatus();
    console.log(browserPrint.getPrinter());
    console.log(printerStatus);
    const zpl = `${informacaoEtiqueta}`;
    if (printerStatus.isReadyToPrint) {
      browserPrint.print(zpl);
    }
    if (printerStatus.errors) {
      console.log(printerStatus.errors);
    }
  };
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const transformarParaEstruturaSAP = (ordemProducao:any, ConsumosSCADA:any) => {
    // Create an object to hold grouped DocumentLines by materiaPrima
    const documentLinesByMateriaPrima = ConsumosSCADA.reduce((acc:any, consumo:any) => {
      const { materiaPrima, lote, quantidade } = consumo;
  
      // Find the corresponding line in the production order
      const baseLine = ordemProducao.ProductionOrderLines.find(
        (line:any) => line.ItemNo === materiaPrima
      )?.LineNumber;
  
      // If this materiaPrima already exists, add to its BatchNumbers and update Quantity
      if (acc[materiaPrima]) {
        acc[materiaPrima].BatchNumbers.push({
          BatchNumber: lote,
          Quantity: quantidade,
          ItemCode: materiaPrima,
        });
  
        // Add the current quantity to the overall DocumentLine quantity
        acc[materiaPrima].Quantity += quantidade;
      } else {
        // Otherwise, create a new DocumentLine for this materiaPrima
        acc[materiaPrima] = {
          BaseEntry: ordemProducao.AbsoluteEntry,
          BaseLine: baseLine,
          BaseType: 202,
          Quantity: quantidade, // Initialize with the current batch's quantity
          BatchNumbers: [
            {
              BatchNumber: lote,
              Quantity: quantidade,
              ItemCode: materiaPrima,
            },
          ],
        };
      }
  
      return acc;
    }, {});
  
    // Convert the result back to an array of DocumentLines
    const documentLines = Object.values(documentLinesByMateriaPrima);
  
    // Create the final SAP payload
    const sapPayload = {
      DocDate: format(horario,"yyyyMMdd",{locale:pt}), // Date from ordemProducao
      DocumentLines: documentLines,
    };
  
    return sapPayload;
  };
  

  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    setMudancaEstado(false);
    setMudancaReator(false);
    const resetEstadoOP = produce(estadoOP, (draft) => {
      draft.estadoSAPAtual = "";
      draft.numeroOrdemProducao = 0;
    });
    console.log(estadoOP);
    setEstadoOP(resetEstadoOP);
    console.log("Mudança de est");
  }, [rowSelection]);

  return (
    <div>
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center py-4 gap-x-2">
          <Input
            type="number"
            placeholder="Filtrar Ordem ... "
            value={
              (table.getColumn("numeroOP")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn("numeroOP")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="flex mr-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="producao/historico">
                  <Button>
                    <ScrollText />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Verificar Historico de Producao</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="rounded-md border-2 border-lime-500 max-h-[400px] overflow-y-scroll">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => {
              return (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Não Existem Ordens
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center px-2 py-3">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} ordem(s) selecionada.
        </div>
      </div>
      {table.getFilteredSelectedRowModel().rows?.map((row) => {
        const ordemProducao = row.original;
        console.log(ordemProducao.AbsoluteEntry);
        if (numOP !== ordemProducao.AbsoluteEntry.toString()) {
          setNumOP(ordemProducao.AbsoluteEntry.toString());
        }
        //console.log("mudancaEstado");
        //console.log(mudancaEstado);
        //console.log("mudancaReator");
        //console.log(mudancaReator);

        return (
          <>
            <div className="flex flex-row mt-10 justify-between">
              <div className="flex flex-col">
                <div className="grid grid-cols-3 gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <Label htmlFor="numeroOP" className="text-right">
                      Número OP
                    </Label>
                    <Input
                      id="numeroOP"
                      value={ordemProducao.AbsoluteEntry}
                      disabled
                      className="text-center"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <Label htmlFor="receita" className="text-right">
                      Receita
                    </Label>
                    <Input
                      disabled
                      id="receita"
                      value={ordemProducao.ItemNo}
                      className="text-center"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <Label htmlFor="descricao" className="text-right">
                      Descrição
                    </Label>
                    <Input
                      disabled
                      id="descricao"
                      value={ordemProducao.ProductDescription}
                      className="text-center"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <Label htmlFor="quantidade" className="text-right">
                      Quantidade
                    </Label>
                    <Input
                      id="quantidade"
                      value={ordemProducao.PlannedQuantity}
                      disabled
                      className="text-center"
                    />
                  </div>
                  {
                    ////se houver mudanca do numero de ordem de ordem
                    <div className="flex flex-col items-center gap-4">
                      <Label htmlFor="username" className="text-right">
                        Estado
                      </Label>
                      <Select
                        disabled={
                          ordemProducao.ProductionOrderStatus ===
                            "boposClosed" ||
                          ordemProducao.ProductionOrderStatus ===
                            "boposCancelled"
                        }
                        defaultValue={
                          estadosOrdemProducao.find(
                            (estado) =>
                              estado.statusSAP ===
                              ordemProducao.ProductionOrderStatus
                          )?.estado
                        }
                        onValueChange={(e:any) => {
                          const atualizarEstadoOP = produce(
                            estadoOP,
                            (draft) => {
                              const estadoSap = estadosOrdemProducao.find(
                                (estado) => estado.estado === e
                              )?.statusSAP;

                              draft.estadoSAPAtual = estadoSap!;

                              draft.numeroOrdemProducao =
                                ordemProducao.AbsoluteEntry;
                            }
                          );
                          setEstadoOP(atualizarEstadoOP);
                          console.log(atualizarEstadoOP);
                          console.log(ordemProducao.ProductionOrderStatus);
                          if (
                            atualizarEstadoOP.estadoSAPAtual !==
                            ordemProducao.ProductionOrderStatus
                          ) {
                            setMudancaEstado(true);
                            setEnviarMudancaSAP(true);
                          }
                          if (
                            atualizarEstadoOP.estadoSAPAtual ===
                            ordemProducao.ProductionOrderStatus
                          ) {
                            setMudancaEstado(false);
                            setEnviarMudancaSAP(false);
                          }
                          console.log(mudancaEstado);
                          //console.log(atualizarEstadoDepoisOP)
                          //console.log(atualizarEstadoOP);
                          //console.log(e);
                          //console.log(atualizarEstadoDepoisOP);
                        }}
                      >
                        <SelectTrigger className="text-center w-[120px]">
                          <SelectValue placeholder={"Escolher"} />
                        </SelectTrigger>
                        <SelectContent className="text-center">
                          <SelectGroup>
                            {estadosOrdemProducao.map((estado) => (
                              <SelectItem
                                key={estado.id}
                                id={estado.id.toString()}
                                value={estado.estado}
                              >
                                {estado.estado}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  }
                  <div className="flex flex-col items-center gap-4">
                    <Label htmlFor="estadoReator" className="text-right">
                      Estado Reator
                    </Label>
                    <Input
                      id="estadoReator"
                      value={ordemProducao.U_Reator ?? ""}
                      disabled
                      className="text-center"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <Label htmlFor="tipoOrdem" className="text-right">
                      Tipo de Ordem
                    </Label>
                    <Input
                      id="tipoOrdem"
                      value={ordemProducao.U_Tipo === "R" ? "Reator" : "---"}
                      disabled
                      className="text-center"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <Label htmlFor="reator" className="text-right">
                      Reator
                    </Label>
                    <Select
                      disabled={
                        ordemProducao.ProductionOrderStatus !==
                          "boposPlanned" &&
                        ordemProducao.ProductionOrderStatus !== "boposReleased"
                      }
                      onValueChange={(e:any) => {
                        const atualizarReator = produce(reatorOP, (draft) => {
                          const idReatorSelecionado = nrReatores.find(
                            (reator) => reator.nome === e
                          )?.id;
                          draft.idReatorAtual = idReatorSelecionado!;
                          draft.numeroOrdemProducao =
                            ordemProducao.AbsoluteEntry;
                        });
                        setReator(atualizarReator);
                        setMudancaReator(true);
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Reator..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {nrReatores.map((reator) => (
                            <SelectItem
                              key={reator.id}
                              id={reator.id.toString()}
                              value={reator.nome}
                            >
                              {reator.nome}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <Label htmlFor="dataCriacao" className="text-right">
                      Data de Criação
                    </Label>
                    <Input
                      id="dataCriacao"
                      value={ordemProducao.CreationDate}
                      disabled
                      className="text-center"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-items-center gap-4 mx-auto h-[410px] w-[700px] ">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Matéria Prima</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Percentagem</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordemProducao.ProductionOrderLines.map((mp: any) => {
                      return (
                        <TableRow key={mp.LineNumber}>
                          <TableCell className="font-medium">
                            {mp.ItemNo}
                          </TableCell>
                          <TableCell>{mp.ItemName}</TableCell>
                          <TableCell className="text-center">
                            {(
                              (mp.PlannedQuantity * 100) /
                              ordemProducao.PlannedQuantity
                            ).toFixed(3)}
                          </TableCell>
                          <TableCell className="text-right">
                            {mp.PlannedQuantity}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex flex-row items-center gap-4 mb-5">
              <div className="flex flex-col items-start space-y-3">
                <div className="">
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        disabled={
                          ordemProducao.ProductionOrderStatus === "boposClosed"
                        }
                        onClick={() => {
                          fetchOrdemProdSCADA.refetch();
                          //console.log(fetchOrdemProdSCADA.data);
                        }}
                      >
                        Validar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[1000px]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Detalhes presentes na ordem de produção
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <div className="flex flex-col justify-center">
                            <div>
                              <p>
                                {mudancaEstado
                                  ? `Estado => ${
                                      estadosOrdemProducao.find(
                                        (estados) =>
                                          estados.statusSAP ===
                                          estadoOP.estadoSAPAtual
                                      )?.estado
                                    }`
                                  : ""}
                              </p>
                            </div>
                            <div>
                              <p>
                                {mudancaReator
                                  ? `Reator => ${reatorOP.idReatorAtual}`
                                  : ""}
                              </p>
                            </div>
                            <div>
                              Planeada para Reator:
                              {fetchOrdemProdSCADA.data !== undefined &&
                                fetchOrdemProdSCADA.data !== null &&
                                fetchOrdemProdSCADA.data[0].reator}
                              {fetchOrdemProdSCADA.data !== undefined &&
                                fetchOrdemProdSCADA.data === null &&
                                " REATOR NÃO ESCOLHIDO"}
                            </div>
                            <div></div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            if (enviarMudancaSAP) {
                              atualizarEstadoOrdemMutation.mutate({
                                estado: estadoOP.estadoSAPAtual as estadoOrdensSapI["estado"],
                                numeroOP: ordemProducao.AbsoluteEntry,
                              });
                            }
                            if (
                              criouOrdemSCADA.findIndex(
                                (ordem) => ordem === ordemProducao.AbsoluteEntry
                              ) === -1
                            ) {
                              const TPI = TPIs.find(
                                (listaTPIs) =>
                                  listaTPIs.Receita === ordemProducao.ItemNo
                              )?.TPI;
                              console.log(TPI);
                              criarOrdemProducaoSCADAMutation.mutate([
                                {
                                  numeroOrdemProducao:
                                    ordemProducao.AbsoluteEntry,
                                  receita: ordemProducao.ItemNo,
                                  quantidade: ordemProducao.PlannedQuantity,
                                  reator: reatorOP.idReatorAtual,
                                  estado: estadosOrdemProducao.find(
                                    (estadoOrdemProd) =>
                                      estadoOrdemProd.statusSAP ===
                                      ordemProducao.ProductionOrderStatus
                                  )?.id,
                                  dataCriacao: ordemProducao.CreationDate,
                                  estadoReator: 1,
                                  tpa: TPI !== undefined ? TPI : 0,
                                },
                              ]);
                              const atualizarListaOrdensProducaoSCADA = produce(
                                criouOrdemSCADA,
                                (draft) => {
                                  draft.push(ordemProducao.AbsoluteEntry);
                                  return draft;
                                }
                              );
                              setCriouOrdemSCADA(
                                atualizarListaOrdensProducaoSCADA
                              );
                            }

                            if (
                              criouOrdemSCADA.findIndex(
                                (ordem) => ordem === ordemProducao.AbsoluteEntry
                              ) !== -1
                            ) {
                              console.log("ja existe");
                              atualizarReatorOrdemSCADAMutation.mutate({
                                numeroOP: ordemProducao.AbsoluteEntry,
                                Reator: reatorOP.idReatorAtual,
                              });
                            }

                            table.resetRowSelection();
                          }}
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button
                      disabled={
                        ordemProducao.ProductionOrderStatus !== "boposReleased"
                      }
                      onClick={() => {
                        console.log("chamar funcao para verificar consumos");
                        fetchConsumosSCADA.refetch();
                      }}
                    >
                      Consumos
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[1000px] max-h-[600px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Consumos de MP {` #${ordemProducao.AbsoluteEntry}`}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {fetchConsumosSCADA.isFetching ||
                        fetchConsumosSCADA.isRefetching ||
                        !fetchConsumosSCADA.data ? (
                          <div>A carregar ou sem dados ...</div>
                        ) : (
                          <ul
                            role="list"
                            className="mx-auto max-h-[400px] divide-y overflow-y-scroll divide-gray-100"
                          >
                            {fetchConsumosSCADA.data.map(
                              (consumo, indexConsumo) => (
                                <li
                                  key={indexConsumo}
                                  className="flex justify-between gap-x-6 py-5 w-[780px] mx-auto"
                                >
                                  <div className="flex min-w-0 gap-x-4">
                                    <img
                                      alt={consumo.materiaPrima}
                                      src={"assets/icons/ConsumoMP.svg"}
                                      className="h-12 w-12 flex-none rounded-full bg-gray-50"
                                    />
                                    <div className="min-w-0 flex-auto">
                                      <p className="text-sm font-semibold leading-6 text-gray-900">
                                        {consumo.materiaPrima}
                                      </p>
                                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                        Lote: {consumo.lote}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                                    <p className="text-sm leading-6 text-gray-900">
                                      Qtd: {consumo.quantidade} kg
                                    </p>
                                    <div className="mt-1 flex items-center gap-x-1.5">
                                      <p className="text-xs leading-5 text-gray-500">
                                        {consumo.date}
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          console.log(
                            JSON.stringify(
                              transformarParaEstruturaSAP(
                                ordemProducao,
                                fetchConsumosSCADA.data
                              )
                            )
                          );
                          setTimeout(()=>{enviarConsumoSAPMutation.mutate(
                            JSON.stringify(
                              transformarParaEstruturaSAP(
                                ordemProducao,
                                fetchConsumosSCADA.data
                              )
                            )
                          );},2000)
                          /*
                          enviarConsumoSAPMutation.mutate(
                            JSON.stringify(
                              transformarParaEstruturaSAP(
                                ordemProducao,
                                fetchConsumosSCADA.data
                              )
                            )
                          );
                          */
                        }}
                      >
                        Continuar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  disabled={
                    ordemProducao.ProductionOrderStatus !== "boposClosed"
                    //false
                  }
                  onClick={() =>
                    imprimirEtiqueta(
                      `^XA${logotipoEgiquimicaZPL}^FS^CF0,60^FO220,50^FDEgiquimica^FS^CF0,30^FO220,115^FDParque Industrial Guarda,Lt.10/15^FS^FO220,155^FDGuarda^FS^FO220,195^FDPortugal(PT)^FS^FO50,245^GB700,3,3^FS^CFD,50^FO50,265^FDOrdem Produc:^FS^CFA,45^FO50,315^FD${
                        ordemProducao.AbsoluteEntry
                      }^FS^CFD,50^FO50,400^FDLote:^FS^CFA,45^FO50,450^FD${
                        ordemProducao.ItemNo
                      }^FS^CFD,50^FO50,550^FDDescricao:^FS^CFA,45^FO50,600^FD${
                        ordemProducao.ProductDescription
                      }^FS^CFA,50^FO50,700^FD${horario.toISOString()}^FS^FO515,255^BQ,,6^FD123F:PI&C1:${
                        ordemProducao.ItemNo
                      }&C2:${ordemProducao.ProductDescription}&C3:${
                        ordemProducao.U_LoteFabrico
                      }&C4:${horario.toISOString()}&C5:${
                        ordemProducao.AbsoluteEntry
                      }&C6:&^FS^FO50,775^GB700,100,3^FS^FO50,875^GB700,300,3^FS^CF0,250^FO60,920^FD${
                        ordemProducao.ItemNo
                      }^FS^CF0,50^FO250,800^FDPrd Intermedio^FS^XZ`
                    )
                  }
                >
                  Imprimir Etiqueta
                </Button>
              </div>
              {/*<div className="">
                <QrcodeComponent
                  information={`F:PI&C1:${ordemProducao.ItemNo}&C2:${ordemProducao.ProductDescription}&C3:${ordemProducao.U_LoteFabrico}&C4:${ordemProducao.CreationDate}&C5:${ordemProducao.AbsoluteEntry}&C6:& `}
                />
              </div>*/}
            </div>
          </>
        );
      })}
    </div>
  );
}
const nrReatores = [
  {
    id: 1,
    nome: "Reator 1",
  },
  {
    id: 2,
    nome: "Reator 2",
  },
  {
    id: 3,
    nome: "Reator 3",
  },
  {
    id: 4,
    nome: "Reator 4",
  },
  {
    id: 5,
    nome: "Reator 5",
  },
  {
    id: 6,
    nome: "Reator 6",
  },
  {
    id: 7,
    nome: "Reator 7",
  },
  {
    id: 8,
    nome: "Reator 8",
  },
];
const estadosOrdemProducao = [
  { id: 1, statusSAP: "boposPlanned", estado: "Planeada" },
  { id: 2, statusSAP: "boposReleased", estado: "Autorizada a Sair" },
  { id: 3, statusSAP: "boposClosed", estado: "Fechada" },
  { id: 4, statusSAP: "boposCancelled", estado: "Cancelada" },
];

const TPIs = [
  { Receita: "231", TPI: 1 },
  { Receita: "219F", TPI: 2 },
  { Receita: "215E", TPI: 3 },
  { Receita: "215", TPI: 4 },
  { Receita: "214D", TPI: 5 },
  { Receita: "214", TPI: 6 },
  { Receita: "213", TPI: 7 },
  { Receita: "216", TPI: 8 },
  { Receita: "609", TPI: 9 },
  { Receita: "604", TPI: 10 },
  { Receita: "232", TPI: 11 },
  { Receita: "219", TPI: 12 },
  { Receita: "210", TPI: 13 },
  { Receita: "200R", TPI: 14 },
  { Receita: "205", TPI: 15 },
  { Receita: "214M", TPI: 16 },
  { Receita: "209T", TPI: 17 },
  { Receita: "209", TPI: 18 },
  { Receita: "607D", TPI: 19 },
  { Receita: "216D", TPI: 20 },
  { Receita: "745", TPI: 21 },
  { Receita: "609D", TPI: 22 },
  { Receita: "601", TPI: 23 },
  { Receita: "605D", TPI: 24 },
  { Receita: "602", TPI: 25 },
  { Receita: "604D", TPI: 26 },
  { Receita: "605", TPI: 27 },
  { Receita: "608", TPI: 28 },
  { Receita: "607", TPI: 29 },
  { Receita: "603", TPI: 30 },
  { Receita: "229", TPI: 31 },
];

const logotipoEgiquimicaZPL =
  "^FO50,60^GFA,2016,2016,16,,:T07IF8,S0LFC,R0NFC,Q07OFC,P03QF,P0RFC,O03SF,O0TFC,N03UF,N0VFC,M01LFCI0LFE,M07KF8K07KF8,M0KFCM0KFC,L01JFEN01JFE,L03JFP03JF,L07IFCQ0JF8,K01JFR03IFE,K03IFER01JF,K07IF8S07IF8,K07IFT03IFC,K0IFCU0IFE,J01IF8U07FFE,J03IFJ0E38O03IF,J07FFE0079F7EO01IF8,J0IFC00JFEP0IFC,I01IF800JFEP07FFE,I01IFI0IF7EP03FFE,I03FFEI0F9E3CP01IF,I07FFCI03U0IF,I07FF8I078E3C7P07FF8,I0IFJ0FDF7EF8O03FFC,I0IFJ0LFCO03FFC,001FFEJ0LFCO01FFE,001FFCJ0FDF7EF8P0FFE,003FFCJ078E3C7Q0IF,003FF8L0E1830CO07FF,007FF8J079F7CF9FO03FF8,007FFK0NFO03FF8,00FFEK0NFO01FFC,00FFEK0JFEIFO01FFC,00FFCK0FDF3CF9FP0FFC,01FFCK078418S0FFE,01FFCK078E3CS0FFE,01FF8K0FDF7ES07FE,03FF8K0JFES07FF,:03FFL0FDF7ES03FF,03FFL078E18S03FF,07FFL038E1C30EP03FF807FEL07DFBEFDFP01FF807FEL0NF8O01FF8:07FEL0FDLF8O01FF807FEL07CF3E79FP01FFC0FFEL03060C306Q0FFC0FFCL07CF3E79F3CO0FFC0FFCL0FDFBEFDFFEO0FFC0FFCL0OFEO0FFC:P07DFBEFDF3E,P03861C30E1C,P038F1C78E1C7,P07DFBEFDF3EF8,0FFCL0QFCM0FFC:0FFCL0FDFBEFDFFEFCM0FFC0FFCL07CF3E79F3C78M0FFC0FFCL01X0FFC0FFEL03071ET0FFC07FEL07CFBFS01FFC07FEL0FDIFS01FF8:07FEL0FDFBFS01FF807FEL07CF1ES01FF807FFL03W03FF803FFL078F1E78E3CF8L03FF,03FFL0FDFBEFDF7EF8L03FF,03FF8K0QFCL07FF,:01FF8K07DFBEFDFFEF8L07FE,01FFCK038F1C78F3C7M0FFE,01FFCK03861C38E1C71EK0FFE,00FFCK07DFBE7DF3EFBFK0FFC,00FFEK0SFJ01FFC,:007FFK0FDJFDFFEFBFJ03FF8,007FFK07CF3E79F3E79EJ03FF8,003FF8J01060C3061870C1I07FF,003FFCJ038F3E78F3CF9F7C00IF,001FFCJ07DFBFFDLF7E00FFE,001FFEJ0TFE01FFE,I0IFJ0SF7E03FFC,I0IFJ07DFBEFDF3EF9F7C03FFC,I07FF8I07CF1C78E1C70C1807FF8,I03FFCY0IF8,I03FFEX01IF,I01IFX03FFE,J0IF8W07FFE,J0IFCW0IFC,J07FFEV01IF8,J03IFV03IF,J01IF8U07FFE,J01IFCU0IFC,K0JFT03IFC,K07IF8S07IF8,K03IFER01JF,K01JFR03IFE,L0JFCQ0JF8,L03JFP03JF,L01JFEN01JFE,M0KF8M07JFC,M07KF8K07KF8,M01LFE001LFE,N0VFC,N03UF,O0TFC,O03SF,P0RFE,P03QF,Q07OF8,Q01NFC,R01LFE,T07IF8,,^FS";
const fonteDescricaoZPL = "^CFC,30^FO50,270^FDNumero OP^FS";
