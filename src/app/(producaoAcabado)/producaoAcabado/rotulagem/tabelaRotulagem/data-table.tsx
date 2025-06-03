"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useConsumoSAP } from "@/Services/Consumos/criarConsumo";
import useWebSocket from "react-use-websocket";
import { produce } from "immer";
import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function isJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export function DataTable<TData  extends ProductionOrder, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [abrirModalRotulagem, setAbrirModalRotulagem] = useState(false);
  const [pickagemBatchNumber, setPickagemBatchNumber] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const datahora = new Date();
  const enviarConsumosSAP = useConsumoSAP();

  const [sorting, setSorting] = useState<SortingState>([]);

  const [quantidadeProduzida, setQuantidadeProduzida] = useState<number>(0);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableMultiRowSelection: false,
    initialState: { pagination: { pageSize: 20 } },
    state: {
      sorting,
      rowSelection,
    },
  });

  /////////////////////////////////////////////////////////////////////////////

  const { lastMessage } = useWebSocket("ws://localhost:8080/pickagem", {
    onOpen(event) {
      console.log("websocket aberto");
    },
    onMessage(event: MessageEvent) {
      if (isJSON(event.data)) {
        console.log("mensagem recebida", event.data);

        const eventdataJSON = JSON.parse(event.data); // Parse and cast to LeitorQR


        if(eventdataJSON.type === "qr_data" && eventdataJSON.payload?.parsed){

          
          const picagemNumeroOrdemProducao = Number(eventdataJSON.value.C5); // Use eventdataJSON.C2, not event.data.value.C2
          setPickagemBatchNumber(eventdataJSON.value.C3)
          //encontrar index da tabela onde numero Orderm (absoluteEntry) é igual ao picado pela pistola
          const foundRow = table
          .getRowModel()
          .rows.find(
            (row) => row.original.AbsoluteEntry === picagemNumeroOrdemProducao
          );
          
          //caso exista a linha na tabela abrir o modal de selecao de quantidade passado 1 segundo
          if (foundRow) {
            const indexTabela = foundRow.index;
            setRowSelection({ [indexTabela]: true });
            
            setTimeout(()=>{
              setAbrirModalRotulagem(true)
            },1000)
          }
        }
      }
    },
    share: true,
  });
  /////////////////////////////////////////////////////////////////////////////

  return (
    <div>
      <div className="rounded-md border-2 border-lime-500 max-h-[400px] overflow-y-scroll">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
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
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem Resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getFilteredSelectedRowModel().rows.map((row) => {
        const ordemProducao = row.original;
        console.log(rowSelection);

        return (
          <div key={row.id} className="mt-6">
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
                  Quantidade Planeada
                </Label>
                <Input
                  id="quantidade"
                  value={ordemProducao.PlannedQuantity}
                  disabled
                  className="text-center"
                />
              </div>
              <div className="flex flex-col items-center gap-4">
                <Label htmlFor="estado" className="text-right">
                  Estado
                </Label>
                <Input
                  id="estado"
                  value={
                    (ordemProducao.ProductionOrderStatus === "boposPlanned" &&
                      "Planeada") ||
                    (ordemProducao.ProductionOrderStatus === "boposReleased" &&
                      "Autorizada a sair") ||
                    (ordemProducao.ProductionOrderStatus === "boposClosed" &&
                      "Fechada") ||
                    (ordemProducao.ProductionOrderStatus === "boposCancelled" &&
                      "Cancelada") ||
                    ""
                  }
                  disabled
                  className="text-center"
                />
              </div>
              <div className="flex flex-col items-center gap-4">
                <Label htmlFor="quantidade" className="text-right">
                  Detalhes
                </Label>
                <AlertDialog
                  open={abrirModalRotulagem}
                  onOpenChange={setAbrirModalRotulagem}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setAbrirModalRotulagem(true);
                      }}
                    >
                      Editar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[800px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle></AlertDialogTitle>
                      <AlertDialogDescription>
                        <div className="items-center flex flex-col m-2">
                          <p className="text-gray-500 text-base dark:text-gray-400 mb-6 md:mb-8">
                            Confirmar quantidade rotulada na ordem de produção
                            <a className="font-medium text-gray-900 dark:text-white">
                              {` #${ordemProducao.AbsoluteEntry} `}
                            </a>
                            para o produto
                            <a className="font-medium text-gray-900 dark:text-white">
                              {` ${ordemProducao.ProductDescription}(${ordemProducao.ItemNo})`}
                            </a>
                          </p>
                          <div className="space-y-3 max-h-[339px] overflow-y-auto sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
                            {ordemProducao?.ProductionOrderLines.map(
                              (linhaProducao: any, index: any) =>
                                linhaProducao.ProductionOrderIssueType ===
                                "im_Manual" ? (
                                  <>
                                    <dl
                                      key={index}
                                      className="w-[600px] sm:flex items-center justify-between gap-4"
                                    >
                                      <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">
                                        {`${linhaProducao.ItemName}(${linhaProducao.ItemNo})`}
                                      </dt>
                                      <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                                        <div className="flex flex-row gap-1 items-center">
                                          <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                              Quantidade Rotulada:
                                            </span>
                                            {ordemProducao.PlannedQuantity <
                                            quantidadeProduzida ? (
                                              <dt className="font-light text-xs mt-2 mb-1 sm:mb-0 text-red-500">
                                                {`(${quantidadeProduzida})/${ordemProducao.PlannedQuantity}`}
                                              </dt>
                                            ) : (
                                              <dt className="font-light text-xs mb-1 sm:mb-0 text-green-500">
                                                {`(${quantidadeProduzida})/${ordemProducao.PlannedQuantity}`}
                                              </dt>
                                            )}
                                          </div>
                                          <Input
                                            id="quantidadeProduzida"
                                            placeholder="Embalagens"
                                            onChange={(e) => {
                                              const value = parseInt(
                                                e.target.value
                                              );
                                              if (isNaN(value)) {
                                                setQuantidadeProduzida(0);
                                              } else {
                                                setQuantidadeProduzida(value);
                                              }
                                            }}
                                            value={quantidadeProduzida}
                                            className="text-center max-w-[100px] mx-2"
                                          />
                                        </div>
                                      </dd>
                                    </dl>
                                  </>
                                ) : null
                            )}
                          </div>
                          <div className="m-2">
                            {ordemProducao.PlannedQuantity <
                              quantidadeProduzida && (
                              <div className="text-red-600 font-bold">
                                !! A quantidade introduzida é superior á
                                planeada !!
                              </div>
                            )}
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <Button
                        disabled={quantidadeProduzida === 0}
                        onClick={() => {
                          console.log({
                            DocDate: format(datahora, "yyyyMMdd", {
                              locale: pt,
                            }),
                            DocumentLines: [
                              {
                                BaseType: 202,
                                BaseEntry: ordemProducao.AbsoluteEntry,
                                BaseLine:
                                  ordemProducao.ProductionOrderLines.find(
                                    (linhaProducao: any) =>
                                      linhaProducao.ProductionOrderIssueType ===
                                      "im_Manual"
                                  )?.LineNumber,
                                Quantity: quantidadeProduzida,
                                BatchNumbers: [
                                  {
                                    BatchNumber: pickagemBatchNumber,
                                    Quantity: quantidadeProduzida,
                                    ItemCode: ordemProducao.ItemNo,
                                  },
                                ],
                              },
                            ],
                          });
                          enviarConsumosSAP.mutate(
                            JSON.stringify({
                              DocDate: format(datahora, "yyyyMMdd", {
                                locale: pt,
                              }),
                              DocumentLines: [
                                {
                                  BaseType: 202,
                                  BaseEntry: ordemProducao.AbsoluteEntry,
                                  BaseLine:
                                    ordemProducao.ProductionOrderLines.find(
                                      (linhaProducao: any) =>
                                        linhaProducao.ProductionOrderIssueType ===
                                        "im_Manual"
                                    )?.LineNumber,
                                  Quantity: quantidadeProduzida,
                                  BatchNumbers: [
                                    {
                                      BatchNumber: pickagemBatchNumber,
                                      Quantity: quantidadeProduzida,
                                      ItemCode: ordemProducao.ItemNo,
                                    },
                                  ],
                                },
                              ],
                            })
                          );
                        }}
                      >
                        Validar
                      </Button>
                      <AlertDialogAction
                        disabled={
                          ordemProducao.PlannedQuantity < quantidadeProduzida
                        }
                      >
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
