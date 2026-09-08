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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useTranferenciaInvSAP } from "@/Services/Inventario/criacaoTransferenciaInv"; // Added warehouse transfer hook
import { useFetchProdOrderByDocEntry } from "@/Services/OrdensProducao/fetchOrdensProducaoItemGroupCode";
import useWebSocket from "react-use-websocket";
import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";
import { useAtualizarEstadoOrdemSAP } from "@/Services/OrdensProducao/updateEstadoOrdemSAP"; // Adjust path as needed

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

export function DataTable<TData extends ProductionOrder, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [abrirModalRotulagem, setAbrirModalRotulagem] = useState(false);
  const [recentlyUpdatedItem, setRecentlyUpdatedItem] = useState<string>("");
  const [pickagemBatchNumber, setPickagemBatchNumber] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [quantidadeProducao, setQuantidadeProducao] = useState<number>(0);
  const [selectedOrderId, setSelectedOrderId] = useState<number>(0);
  const [itemBatchNumbers, setItemBatchNumbers] = useState<{
    [key: string]: string;
  }>({});
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<{
  type: "success" | "error" | "info";
  message: string;
} | null>(null);

  const datahora = new Date();
  const enviarConsumosSAP = useConsumoSAP();
  const transferirInventario = useTranferenciaInvSAP(); // Added warehouse transfer hook

  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch item group codes for the selected production order
  const itemGroupData = useFetchProdOrderByDocEntry(selectedOrderId);
  // Use your existing status update hook
  const atualizarEstado = useAtualizarEstadoOrdemSAP();

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

  const { lastMessage } = useWebSocket("ws://localhost:8081/pickagem", {
    onOpen(event) {
      console.log("websocket aberto");
    },
    onMessage(event: MessageEvent) {
      if (isJSON(event.data)) {
        console.log("mensagem recebida", event.data);

        const eventdataJSON = JSON.parse(event.data);

        if (eventdataJSON.type === "qr_data" && eventdataJSON.payload?.parsed) {
          // Check if this is a material QR code (F:MateriaPrima)
          if (eventdataJSON.payload?.parsed.F === "MateriaPrima") {
            console.log("Material QR code detected:", eventdataJSON.value);

            // Extract item name (C2) and batch number (C4)
            const itemName = eventdataJSON.payload?.parsed.C2;
            const batchNumber = eventdataJSON.payload?.parsed.C4;

            console.log(
              "Looking for item:",
              itemName,
              "with batch:",
              batchNumber
            );

            // Only process if modal is open and we have both values
            if (abrirModalRotulagem && itemName && batchNumber) {
              // Get the currently selected production order
              const selectedRows = table.getFilteredSelectedRowModel().rows;

              if (selectedRows.length > 0) {
                const ordemProducao = selectedRows[0].original;

                // Get filtered production lines for the selected order
                const filteredLines = getFilteredProductionLines(ordemProducao);

                // Find the matching item by ItemName
                const matchingItem = filteredLines.find(
                  (linha: any) => linha.ItemName === itemName
                );

                if (matchingItem) {
                  console.log(
                    "Found matching item:",
                    matchingItem.ItemNo,
                    "setting batch:",
                    batchNumber
                  );

                  // Set the batch number for this specific item
                  setItemBatchNumbers((prev) => ({
                    ...prev,
                    [matchingItem.ItemNo]: batchNumber,
                  }));

                  setRecentlyUpdatedItem(matchingItem.ItemNo);
                  setTimeout(() => setRecentlyUpdatedItem(""), 2000); // Clear after 2 seconds

                  // Optional: Show a success message or visual feedback
                  console.log(
                    "Batch number set successfully for item:",
                    itemName
                  );
                } else {
                  console.log("No matching item found for:", itemName);
                  console.log(
                    "Available items:",
                    filteredLines.map((linha: any) => linha.ItemName)
                  );
                }
              }
            } else {
              console.log(
                "Modal not open or missing data - modal open:",
                abrirModalRotulagem,
                "itemName:",
                itemName,
                "batchNumber:",
                batchNumber
              );
            }
          }
          // Handle production order QR codes (existing logic)
          else {
            const picagemNumeroOrdemProducao = Number(eventdataJSON.value.C5);
            setPickagemBatchNumber(eventdataJSON.value.C3);
            setSelectedOrderId(picagemNumeroOrdemProducao);

            const foundRow = table
              .getRowModel()
              .rows.find(
                (row) =>
                  row.original.AbsoluteEntry === picagemNumeroOrdemProducao
              );

            if (foundRow) {
              const indexTabela = foundRow.index;
              setRowSelection({ [indexTabela]: true });

              setTimeout(() => {
                setAbrirModalRotulagem(true);
				setFeedbackMessage(null);
              }, 1000);
            }
          }
        }
      }
    },
    share: true,
  });

  /////////////////////////////////////////////////////////////////////////////

  // Function to determine if a production line should be shown
  const shouldShowLine = (linha: any) => {
    const faseConsumo = linha.U_FaseConsumo;

    // If U_FaseConsumo equals 1, never show
    if (faseConsumo === "1") {
      return false;
    }

    // If U_FaseConsumo equals 2, always show
    if (faseConsumo === "2") {
      return true;
    }

    // If U_FaseConsumo equals 0, check item group code
    if (faseConsumo === "0") {
      const itemGroupInfo = itemGroupData.data?.value.find(
        (item) => item.ItemCodeComp === linha.ItemNo
      );

      if (itemGroupInfo) {
        const itemGroupCode = itemGroupInfo.ItmsGrpCod;
        // Show only if item group code is 124
        return itemGroupCode === 124;
      }

      return false;
    }

    return false;
  };

  // Function to get filtered production lines
  const getFilteredProductionLines = (ordemProducao: ProductionOrder) => {
    if (!ordemProducao) return [];

    return ordemProducao.ProductionOrderLines.filter(
      (linhaProducao: any) =>
        linhaProducao.ProductionOrderIssueType === "im_Manual" &&
        shouldShowLine(linhaProducao)
    );
  };

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
                <Select
                  value={ordemProducao.ProductionOrderStatus}
                  onValueChange={(
                    newStatus:
                      | "boposPlanned"
                      | "boposReleased"
                      | "boposClosed"
                      | "boposCancelled"
                  ) => {
                    atualizarEstado.mutate({
                      numeroOP: ordemProducao.AbsoluteEntry,
                      estado: newStatus,
                    });
                  }}
                  disabled={atualizarEstado.isPending}
                >
                  <SelectTrigger className="w-[200px] text-center">
                    <SelectValue placeholder="Selecionar estado">
                      {ordemProducao.ProductionOrderStatus === "boposPlanned" &&
                        "Planeada"}
                      {ordemProducao.ProductionOrderStatus ===
                        "boposReleased" && "Autorizada a sair"}
                      {ordemProducao.ProductionOrderStatus === "boposClosed" &&
                        "Fechada"}
                      {ordemProducao.ProductionOrderStatus ===
                        "boposCancelled" && "Cancelada"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boposPlanned">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Planeada
                      </div>
                    </SelectItem>
                    <SelectItem value="boposReleased">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Autorizada a sair
                      </div>
                    </SelectItem>
                    <SelectItem value="boposClosed">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Fechada
                      </div>
                    </SelectItem>
                    <SelectItem value="boposCancelled">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Cancelada
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {atualizarEstado.isPending && (
                  <p className="text-xs text-gray-500">A atualizar estado...</p>
                )}
                {atualizarEstado.error && (
                  <p className="text-xs text-red-500">
                    Erro ao atualizar estado
                  </p>
                )}
                {atualizarEstado.isSuccess && (
                  <p className="text-xs text-green-600">
                    Estado atualizado com sucesso!
                  </p>
                )}
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
                        setSelectedOrderId(ordemProducao.AbsoluteEntry);
                        setAbrirModalRotulagem(true);
						setFeedbackMessage(null);
                      }}
                    >
                      Editar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
                    <AlertDialogHeader className="flex-shrink-0">
                      <AlertDialogTitle className="text-lg font-semibold">
                        Confirmação de Rotulagem
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        <div className="space-y-2">
                          <p className="text-gray-600 dark:text-gray-400">
                            Ordem de produção
                            <span className="font-medium text-gray-900 dark:text-white mx-1">
                              #{ordemProducao.AbsoluteEntry}
                            </span>
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Produto:
                            <span className="font-medium text-gray-900 dark:text-white ml-1">
                              {ordemProducao.ProductDescription} (
                              {ordemProducao.ItemNo})
                            </span>
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
					{/* Add feedback section */}
<div className="px-6">
  {feedbackMessage && (
    <div className={`p-3 rounded-lg border mb-4 ${
      feedbackMessage.type === "success" 
        ? "bg-green-50 border-green-200 text-green-800" 
        : feedbackMessage.type === "error" 
        ? "bg-red-50 border-red-200 text-red-800" 
        : "bg-blue-50 border-blue-200 text-blue-800"
    }`}>
      <p className="text-sm font-medium">{feedbackMessage.message}</p>
    </div>
  )}
  
  {isProcessing && processingStep && (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-blue-800">{processingStep}</p>
      </div>
    </div>
  )}
</div>

                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto px-6 py-2">
                      {/* Single Production Quantity Input */}
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <Label className="text-base font-semibold text-gray-900 dark:text-white mb-2 block">
                          Quantidade Rotulada
                        </Label>
                        <div className="flex flex-row gap-2 items-center">
                          <Input
                            className="w-[180px]"
                            placeholder="Quantidade"
                            type="number"
                            value={quantidadeProducao || ""}
                            onChange={(e) => {
                              setQuantidadeProducao(Number(e.target.value));
                            }}
                          />
                          <span className="text-sm text-gray-500">
                            embalagens
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                          <span className="text-gray-500">
                            Planeado: {ordemProducao.PlannedQuantity} embalagens
                          </span>
                          {quantidadeProducao >
                            ordemProducao.PlannedQuantity && (
                            <span className="text-red-500 font-medium">
                              ⚠️ Excede quantidade planeada
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Calculated Material Quantities */}
                      <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">
                          Quantidades de Matéria-Prima Calculadas:
                        </h3>
                        <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">
                            Quantidades de Matéria-Prima Calculadas:
                          </h3>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {itemGroupData.isLoading ? (
                              <div className="text-center py-4">
                                <p className="text-sm text-gray-500">
                                  A carregar dados de filtros...
                                </p>
                              </div>
                            ) : (
                              getFilteredProductionLines(ordemProducao).map(
                                (linhaProducao: any, index: any) => (
                                  <div
                                    key={index}
                                    className="bg-white dark:bg-gray-700 rounded p-3 border"
                                  >
                                    <div className="flex justify-between items-start gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                          {linhaProducao.ItemName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          ({linhaProducao.ItemNo})
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                          Fase:{" "}
                                          {linhaProducao.U_FaseConsumo === 0
                                            ? "N/A"
                                            : linhaProducao.U_FaseConsumo === 1
                                            ? "Embalamento"
                                            : "Rotulagem"}
                                        </p>

                                        {/* New Batch Number Input */}
                                        <div className="mt-2">
                                          <Label className="text-xs text-gray-600 dark:text-gray-400">
                                            Número de Lote:
                                          </Label>
                                          <Input
                                            className={`mt-1 h-8 text-xs ${
                                              recentlyUpdatedItem ===
                                              linhaProducao.ItemNo
                                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                : ""
                                            }`}
                                            placeholder={
                                              pickagemBatchNumber ||
                                              "Inserir lote"
                                            }
                                            value={
                                              itemBatchNumbers[
                                                linhaProducao.ItemNo
                                              ] || ""
                                            }
                                            onChange={(e) => {
                                              setItemBatchNumbers((prev) => ({
                                                ...prev,
                                                [linhaProducao.ItemNo]:
                                                  e.target.value,
                                              }));
                                            }}
                                          />
                                          {recentlyUpdatedItem ===
                                            linhaProducao.ItemNo && (
                                            <p className="text-xs text-green-600 font-medium mt-1">
                                              ✅ Preenchido automaticamente
                                            </p>
                                          )}
                                          {!itemBatchNumbers[
                                            linhaProducao.ItemNo
                                          ] &&
                                            pickagemBatchNumber && (
                                              <p className="text-xs text-gray-500 mt-1">
                                                Predefinido:{" "}
                                                {pickagemBatchNumber}
                                              </p>
                                            )}
                                        </div>
                                      </div>

                                      <div className="flex-shrink-0 text-right">
                                        {(() => {
                                          const quantidadeCalculada =
                                            quantidadeProducao *
                                            (linhaProducao.BaseQuantity || 1);
                                          const isOverPlanned =
                                            quantidadeCalculada >
                                            (linhaProducao.PlannedQuantity ||
                                              0);
                                          return (
                                            <div className="space-y-1">
                                              <div
                                                className={`text-sm font-bold ${
                                                  isOverPlanned
                                                    ? "text-red-500"
                                                    : "text-green-600"
                                                }`}
                                              >
                                                {quantidadeCalculada.toFixed(6)}{" "}
                                                L/Kg
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                {linhaProducao.BaseQuantity ||
                                                  1}{" "}
                                                × {quantidadeProducao}
                                              </div>
                                              <div className="text-xs text-gray-400">
                                                Planeado:{" "}
                                                {linhaProducao.PlannedQuantity ||
                                                  0}
                                              </div>
                                              {isOverPlanned && (
                                                <div className="text-xs text-red-500 font-medium">
                                                  ⚠️ Excede planeado
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <AlertDialogFooter className="flex-shrink-0 pt-4">
                      <AlertDialogCancel
						disabled={isProcessing}
                        onClick={() => {
                          setQuantidadeProducao(0);
                          setItemBatchNumbers({}); // Clear all batch numbers
						  setFeedbackMessage(null);
                        }}
                      >
                        Cancelar
                      </AlertDialogCancel>
<Button
  disabled={quantidadeProducao === 0 || isProcessing}
  onClick={async () => {
    // Clear previous feedback and start processing
    setFeedbackMessage(null);
    setIsProcessing(true);
    setProcessingStep("Preparando consumo de rotulagem...");

    try {
      // Step 1: Create consumption payload
      setProcessingStep("Processando consumo de matéria-prima...");
      
      const documentLines = getFilteredProductionLines(ordemProducao).map(
        (linhaProducao: any) => {
          const quantidadeCalculada = quantidadeProducao * (linhaProducao.BaseQuantity || 1);
          const batchNumber = itemBatchNumbers[linhaProducao.ItemNo] || pickagemBatchNumber;

          const documentLine: any = {
            BaseType: 202,
            BaseEntry: ordemProducao.AbsoluteEntry,
            BaseLine: linhaProducao.LineNumber,
          };

          if (batchNumber && batchNumber.trim() !== "") {
            const batchQuantity = Number(quantidadeCalculada.toFixed(6));
            const batchNumbers = [
              {
                BatchNumber: batchNumber,
                Quantity: batchQuantity,
                ItemCode: linhaProducao.ItemNo,
              },
            ];
            const totalBatchQuantity = batchNumbers.reduce(
              (sum, batch) => sum + batch.Quantity,
              0
            );
            documentLine.Quantity = totalBatchQuantity;
            documentLine.BatchNumbers = batchNumbers;
          } else {
            documentLine.Quantity = Number(quantidadeCalculada.toFixed(6));
          }

          return documentLine;
        }
      );

      const consumptionPayload = {
        DocDate: format(datahora, "yyyyMMdd", { locale: pt }),
        DocumentLines: documentLines,
      };

      // Execute consumption
      await enviarConsumosSAP.mutateAsync(JSON.stringify(consumptionPayload));
      
      setFeedbackMessage({
        type: "success",
        message: "✅ Consumo de rotulagem registado com sucesso"
      });

      // Step 2: Warehouse transfer (if enabled)
      setProcessingStep("Preparando transferência de armazém...");
      
      const stockTransferLines = getFilteredProductionLines(ordemProducao).map(
        (linhaProducao: any, index: number) => {
          const quantidadeCalculada = quantidadeProducao * (linhaProducao.BaseQuantity || 1);
          const batchNumber = itemBatchNumbers[linhaProducao.ItemNo] || pickagemBatchNumber;

          return {
            LineNum: index,
            ItemCode: linhaProducao.ItemNo,
            Quantity: Number(quantidadeCalculada.toFixed(6)),
            WarehouseCode: "A4",
            FromWarehouseCode: "A3",
            BatchNumbers: [
              {
                BatchNumber: batchNumber,
                Quantity: Number(quantidadeCalculada.toFixed(6)),
                ItemCode: linhaProducao.ItemNo,
              },
            ],
          };
        }
      );

      const transferPayload = {
        FromWarehouse: "A3",
        ToWarehouse: "A4",
        StockTransferLines: stockTransferLines,
      };

      // Uncomment when transfer is ready
      // await transferirInventario.mutateAsync(JSON.stringify(transferPayload));
      
      // Success - all operations completed
      setFeedbackMessage({
        type: "success",
        message: "🎉 Rotulagem validada com sucesso! Consumos registados."
      });

    } catch (error: any) {
      console.error("Error in labeling validation:", error);
      
      const errorMessage = error?.response?.data?.error?.message?.value || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Erro desconhecido durante a validação";
      
      setFeedbackMessage({
        type: "error",
        message: `❌ Erro na rotulagem: ${errorMessage}`
      });
      
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  }}
>
  {isProcessing ? (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      Processando...
    </div>
  ) : (
    "Validar"
  )}
</Button>
                      <AlertDialogAction
						  disabled={
    quantidadeProducao > ordemProducao.PlannedQuantity ||
    quantidadeProducao === 0 ||
    isProcessing // Add this
  }
                        onClick={async () => {
                          // Reset the production quantity and batch numbers
                          setQuantidadeProducao(0);
						  setFeedbackMessage(null); // Clear feedback
                          setItemBatchNumbers({}); // Clear all batch numbers
                          setAbrirModalRotulagem(false);
                        }}
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
