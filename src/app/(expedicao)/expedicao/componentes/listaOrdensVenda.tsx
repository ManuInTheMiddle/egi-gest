"use client";
import React from "react";
import QrcodeComponent from "@/components/ui/qrcodeComponent";
import { Skeleton } from "@/components/ui/skeleton";
import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  Printer,
  ClipboardList,
  Trash2,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { produce } from "immer";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import useWebSocket from "react-use-websocket";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useFetchOrdensVendaSAPData } from "@/Services/OrdensVenda/fetchOrdensVendaSAP";
import { useFetchQuantidadeArtigoLote } from "@/Services/LotesPorArtigo/fetchQuantidadeArtigoLote";
import { useCriarGuiaRemessaSAP } from "@/Services/GuiasRemessa/criarGuiaRemessa";
import { Document } from "@/Services/OrdensVenda/fetchOrdensVendaSAP";
import { useFetchBatchManagedSAPData } from "@/Services/Inventario/fetchVerificarBatchNumber";

interface leitorQR {
  status: string;
  value: {
    C1: string;
    C2: string;
    C3: string;
    C4: string;
    C5: string;
    C6: string;
    F: string;
  };
}

interface batchNumbersInterface {
  BatchNumber: string;
  Quantity: number;
  ItemCode: string;
}
interface documentLinesBatchN {
  BaseType: number;
  BaseEntry: number;
  BaseLine: number;
  Quantity: number;
  BatchNumbers?: batchNumbersInterface[];
}
interface documentLinesInterface {
  BaseEntry: number;
  BaseLine: number;
  BaseType: number;
  Quantity: number;
  BatchNumbers?: batchNumbersInterface[];
}

interface bodyInterface {
  CardCode: string;
  DocDate: string;
  DocumentLines: any[];
}
interface selectLotesInterface {
  BatchNum: string;
  IsBatchManaged: string;
  ItemCode: string;
  ItemName: string;
  Quantity: number;
  WhsCode: string;
}

interface geridoPorLotesSAPI {
  "odata.metadata": string;
  "odata.etag": string;
  ManageBatchNumbers: string;
}

//funcao para verificar se picagem tem extrutura JSON
function isJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

//funcao para obter propiedades da quantidade e do codigo do artigo
function extractDetails(
  documentLine: any,
  corpoDocumentoOrdemVenda: Document[],
  numeroOrdemVEnda: number
) {
  if (documentLine?.BatchNumbers && documentLine?.BatchNumbers.length > 0) {
    // Extract from BatchNumbers caso exista
    return {
      itemCode: documentLine.BatchNumbers[0].ItemCode,
      quantity: documentLine.BatchNumbers[0].Quantity,
      batchNumber: documentLine.BatchNumbers[0].BatchNumber,
    };
  } else {
    // caso nao exista extrai direto do corpo principal
    //procura na ordens de venda a que corresponde ao da picagem
    const Document = corpoDocumentoOrdemVenda.find(
      (item) => item.DocEntry === numeroOrdemVEnda
    )!;
    //Obter a linha da ordem venda correspondente a linha do document line para poder obter o item code
    const documentLineOrdemVenda = Document.DocumentLines.find(
      (item) => item.LineNum === documentLine?.BaseLine
    );

    return {
      itemCode: documentLineOrdemVenda?.ItemCode,
      quantity: documentLine?.Quantity,
      batchNumber: "---",
    };
  }
}

const ListaOrdensVenda = () => {
  const guiaRemessaSAPmutation = useCriarGuiaRemessaSAP();
  const [cardCode, setCardCode] = useState("");
  const [docDate, setDocDate] = useState("");

  ////////////////////////////////////////////////////
  const [stock, setStock] = useState(false);
  const [geridoPorLotes, setGeridoPorLotes] = useState(false);
  const [selectLotes, setSelectLotes] = useState<selectLotesInterface[]>([]);
  const [lotes, setLotes] = useState<batchNumbersInterface[]>([]);
  const [lote, setLote] = useState("");
  const [body, setBody] = useState<bodyInterface>();
  const [abrirModalLote, setAbrirModalLote] = useState(false);
  ////////////////////////////////////////////////////
  //guias de remessa//////////////////////////////////
  ///////////////////////////////////////////////////

  const [documentLines, setDocumentLines] = useState<documentLinesInterface[]>(
    []
  );
  const [documentLinesBatchN, setDocumentLinesBatchN] = useState<
    documentLinesBatchN[]
  >([]);
  ///////////////////////////////////////////////////
  const [validouSelecaoLote, setValidouSelecaoLote] = useState(false);
  const datahora = new Date();
  const [artigo, setArtigo] = useState("");
  const artigoGeridoPorLotesSAP = useFetchBatchManagedSAPData(artigo);
  const [lineNumLoteButton, setLineNum] = useState<number>();
  const [validouValores, setValidouValores] = useState(false);
  const [pickagemOrdemVenda, setPickagemOrdemProducao] = useState(0);
  const [abrirModalPickagem, setAbrirModalPickagem] = useState(false);
  const [numeroPagina, setNumeroPagina] = useState(0);
  const ordensVendaSAP = useFetchOrdensVendaSAPData(
    format(new Date(datahora.getFullYear(), 0, 1), "yyyy-MM-dd"),
    numeroPagina
  );
  const quantidadePorLote = useFetchQuantidadeArtigoLote(artigo);
  /////////////////////////////////////////////////////////////////////////////
  const handlePaginaSeguinte = () => {
    const atualizarPagina = produce(numeroPagina, (draft) => {
      draft = draft + 20;
      return draft;
    });

    setNumeroPagina(atualizarPagina);
  };
  const handlePaginaAnterior = () => {
    const atualizarPagina = produce(numeroPagina, (draft) => {
      if (draft > 0) {
        return (draft = draft - 20);
      }
    });
    setNumeroPagina(atualizarPagina);
  };
  const handlePrimeiraPagina = () => {
    const atualizarPagina = produce(numeroPagina, (draft) => {
      return (draft = 0);
    });
    setNumeroPagina(atualizarPagina);
  };
  /////////////////////////////////////////////////////////////////////////////

  const { lastMessage } = useWebSocket("ws://localhost:8080/pickagem", {
    onOpen(event) {
      console.log("websocket aberto");
    },
    onMessage(event: MessageEvent) {
      if (isJSON(event.data)) {
        console.log("mensagem recebida", event.data);

        const eventdataJSON: leitorQR = JSON.parse(event.data); // Parse and cast to LeitorQR

        const atualizarPickagemOrdemEscolhida = produce(
          pickagemOrdemVenda,
          (draft) => {
            const numeroParseado = Number(eventdataJSON.value.C2); // Use eventdataJSON.C2, not event.data.value.C2
            draft = numeroParseado; // Assuming draft has a field ordemNumero
            console.log(numeroParseado);
            return draft;
          }
        );

        console.log("atualizar", atualizarPickagemOrdemEscolhida);
        setPickagemOrdemProducao(atualizarPickagemOrdemEscolhida);
        console.log("parseado", Number(eventdataJSON.value.C2));

        console.log(
          "meh",
          ordensVendaSAP.data?.value.findIndex(
            (ordemV) => ordemV.DocEntry == Number(eventdataJSON.value.C2)
          )
        );

        if (
          ordensVendaSAP.data?.value.find(
            (ordemVenda) =>
              ordemVenda.DocEntry === Number(eventdataJSON.value.C2)
          )
        ) {
          setAbrirModalPickagem(true);

          setCardCode(
            ordensVendaSAP.data?.value.find(
              (ordemProd) =>
                ordemProd.DocEntry === Number(eventdataJSON.value.C2)
            )?.CardCode ?? "NA"
          );

          setDocDate(format(datahora.toISOString(), "yyyyMMdd"));
        }
      }
    },
    share: true,
  });
  /////////////////////////////////////////////////////////////////////////////
  const imprimirEtiqueta = async (informacaoEtiqueta: any) => {
    const browserPrint = new ZebraBrowserPrintWrapper();
    //const defaultPrinter = await browserPrint.getDefaultPrinter();
    //browserPrint.setPrinter(defaultPrinter);
    const foundPrinter = await browserPrint.getAvailablePrinters();
    console.log(foundPrinter[0]);
    await browserPrint.setPrinter(foundPrinter[0]);

    const printerStatus = await browserPrint.checkPrinterStatus();
    console.log(browserPrint.getPrinter());
    console.log(printerStatus);
    const zpl = `${informacaoEtiqueta}`;

    await browserPrint.print(zpl);
  };
  /////////////////////////////////////////////////////////////////////////////
  //limpeza das variaveis do document lines e documentLines BatchN
  const handleLimpezaVariaveis = () => {
    setDocumentLines([]);
    setDocumentLinesBatchN([]);
  };
  /////////////////////////////////////////////////////////////////////////////
  const handlerGeridoPorLotes = () => {};
  /*
  useEffect(() => {

    console.log("Initialized useEffect with data:", quantidadePorLote.data);

    if (!quantidadePorLote.data) return;

    const { value } = quantidadePorLote.data;
    const hasValue = value && value.length > 0;

    setStock(hasValue);

    if (!hasValue) {
      setStock(false);
      setTimeout(() => {
        console.log("daqui a 1 sec");
        setAbrirModalLote(true);
      }, 1500);
      return;
    }

    const firstItem = value[0];
    const isBatchManaged = (artigoGeridoPorLotesSAP.data?.ManageBatchNumbers === "tYES") 

    //const isBatchManaged = firstItem.IsBatchManaged === "Y";
    setGeridoPorLotes(isBatchManaged);

    if (isBatchManaged) {
      const atualizarSelectLotes = produce(selectLotes, (draft) => {
        draft.length = 0;
        value.forEach((qtdLote) => draft.push(qtdLote));
      });
      console.log("Updated selectLotes:", atualizarSelectLotes);
      setSelectLotes(atualizarSelectLotes);
    }

    if (quantidadePorLote.data.value) {
      setAbrirModalLote(true);
    }
  }, [
    quantidadePorLote.data,
    quantidadePorLote.status,
    setStock,
    setGeridoPorLotes,
    setSelectLotes,
  ]);
*/
  useEffect(() => {
    //console.log(artigo);
    if (guiaRemessaSAPmutation.isSuccess) {
      console.log("foi alto sucesso");
      handleLimpezaVariaveis();
      /*
      setDocumentLines([]);
      setDocumentLinesBatchN([]);
      */
    }
  }, [guiaRemessaSAPmutation.isSuccess]);

  useEffect(() => {
    if (guiaRemessaSAPmutation.isError) {
      console.log("foi alto erro");
      handleLimpezaVariaveis();
      /*
      setDocumentLines([]);
      setDocumentLinesBatchN([]);
      */
    }
  }, [guiaRemessaSAPmutation.isError, guiaRemessaSAPmutation.error]);

  if (ordensVendaSAP.isError) {
    return <div>Erro ao obter ordens venda do servidor</div>;
  }
  if (guiaRemessaSAPmutation.isPending) {
    return <div>Carregando...</div>;
  }

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {ordensVendaSAP.isRefetching || ordensVendaSAP.isFetching ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Skeleton className="h-[500px] w-[300px]" />
            <Skeleton className="h-[500px] w-[300px]" />
            <Skeleton className="h-[500px] w-[300px]" />
            <Skeleton className="h-[500px] w-[300px]" />
          </div>
        ) : (
          <div className="mx-auto max-w-8xl">
            {
              <ul
                role="list"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              >
                {ordensVendaSAP.data?.value.map((ordemVenda, index) => (
                  <li
                    key={index}
                    className="col-span-1 flex flex-col divide-y max-w-[350px] divide-gray-200 rounded-lg bg-white text-center shadow-2xl"
                  >
                    <div className="flex flex-1 flex-col p-8 mx-auto">
                      <div className="mx-auto h-32 w-32 flex-shrink-0 rounded-full">
                        <QrcodeComponent
                          information={`F:ordemvenda&C1:docentry&C2:${ordemVenda.DocEntry}&C3:&C4:&C5:&C6:&`}
                        />
                      </div>
                      <h3 className="mt-6 text-sm font-medium text-gray-500">
                        #{ordemVenda.DocEntry}
                      </h3>
                      <dl className="mt-1 flex flex-grow flex-col justify-between">
                        <dt className="sr-only">Cliente</dt>
                        <dd className="text-base font-semibold text-black">
                          {ordemVenda.CardName}
                        </dd>
                        <dt className="sr-only">Data</dt>
                        <dd className="text-sm text-gray-500 mt-2">
                          {format(ordemVenda.CreationDate, "PP", {
                            locale: pt,
                          })}
                        </dd>
                        <dt className="sr-only">Estado</dt>
                        <dd className="mt-3">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {ordemVenda.DocumentStatus === "bost_Open" ? (
                              <span className="text-green-300">Aberta</span>
                            ) : (
                              <span className="text-red-300">Fechada</span>
                            )}
                          </span>
                        </dd>
                      </dl>
                    </div>
                    <div>
                      <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                          <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                            Atualizado a:
                            {` ${format(ordemVenda.UpdateDate, "PP", {
                              locale: pt,
                            })}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            }
            <AlertDialog
              open={abrirModalPickagem}
              onOpenChange={setAbrirModalPickagem}
            >
              <AlertDialogContent className="w-4/5">
                <AlertDialogTitle></AlertDialogTitle>
                <AlertDialogHeader>
                  <AlertDialogDescription>
                    <section className="bg-white py-2 antialiased dark:bg-gray-900 md:py-12">
                      <div className="mx-auto px-4 2xl:px-0">
                        <p className="text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
                          Confirmar itens da ordem de venda
                          <a className="font-medium text-gray-900 dark:text-white">
                            {` #${pickagemOrdemVenda}`}
                          </a>{" "}
                          para o cliente
                          <a className="font-medium text-gray-900 dark:text-white">
                            {` ${
                              ordensVendaSAP.data?.value.find(
                                (ordemVendaVal) =>
                                  ordemVendaVal.DocEntry === pickagemOrdemVenda
                              )?.CardName
                            }(${
                              ordensVendaSAP.data?.value.find(
                                (ordemVendaVal) =>
                                  ordemVendaVal.DocEntry === pickagemOrdemVenda
                              )?.CardCode
                            })`}
                          </a>
                        </p>

                        <div className="space-y-3 max-h-[339px] overflow-y-scroll sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
                          {ordensVendaSAP.data?.value
                            .find(
                              (ordemVenda) =>
                                ordemVenda.DocEntry === pickagemOrdemVenda
                            )
                            ?.DocumentLines.map((linhaVenda, index) => (
                              <>
                                <dl
                                  key={index}
                                  className="sm:flex items-center justify-between gap-4"
                                >
                                  <dt className="flex flex-row font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">
                                    {`${linhaVenda.ItemDescription}(${linhaVenda.ItemCode})`}
                                  </dt>
                                  <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                                    <div className="flex flex-row gap-1 items-center">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        Lote:
                                      </span>

                                      <AlertDialog
                                        open={abrirModalLote}
                                        onOpenChange={setAbrirModalLote}
                                      >
                                        <Button
                                          key={index}
                                          size={"icon"}
                                          disabled={false}
                                          onClick={() => {
                                            console.log(
                                              "carreguei no botao lote"
                                            );
                                            setLineNum(linhaVenda.LineNum);
                                            console.log(
                                              "linha de venda botao",
                                              linhaVenda.LineNum
                                            );
                                            setArtigo(linhaVenda.ItemCode);
                                            quantidadePorLote.refetch();
                                            artigoGeridoPorLotesSAP.refetch();
                                            setAbrirModalLote(true);
                                          }}
                                        >
                                          <ClipboardList />
                                        </Button>
                                        {(quantidadePorLote.isFetching ||
                                          quantidadePorLote.isRefetching ||
                                          quantidadePorLote.isPending) && (
                                          <>A Carregar...</>
                                        )}
                                        <AlertDialogContent className="w-2/4">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              {`Seleção dos lotes (${artigo})`}
                                              {quantidadePorLote.isLoading ||
                                              quantidadePorLote.isFetching ||
                                              quantidadePorLote.isRefetching ? (
                                                <>A carregar...</>
                                              ) : (
                                                <div>
                                                  {quantidadePorLote.data?.value
                                                    .length! > 0
                                                    ? null
                                                    : "Sem stock  "}
                                                </div>
                                              )}
                                            </AlertDialogTitle>
                                            {quantidadePorLote.isLoading ||
                                            quantidadePorLote.isFetching ||
                                            quantidadePorLote.isRefetching ? (
                                              <>A carregar...</>
                                            ) : quantidadePorLote.data?.value
                                                .length! > 0 ? (
                                              <AlertDialogDescription>
                                                {quantidadePorLote.data
                                                  ?.value &&
                                                  artigoGeridoPorLotesSAP.data
                                                    ?.ManageBatchNumbers ===
                                                    "tYES" && (
                                                    <div className="flex flex-row items-center">
                                                      <Select
                                                        onValueChange={(e) => {
                                                          setLote(e);
                                                          console.log(
                                                            "select",
                                                            selectLotes
                                                          );
                                                        }}
                                                      >
                                                        <SelectTrigger className="w-[180px] mb-1">
                                                          <SelectValue placeholder="Lote" />
                                                        </SelectTrigger>
                                                        {quantidadePorLote.isFetching ||
                                                        quantidadePorLote.isRefetching ? (
                                                          <div>
                                                            A carregar...
                                                          </div>
                                                        ) : (
                                                          <SelectContent>
                                                            {quantidadePorLote.data?.value.map(
                                                              (itemLote) =>
                                                                itemLote.BatchNum !==
                                                                  null && (
                                                                  <SelectItem
                                                                  key={`${itemLote.ItemCode}-${itemLote.Quantity}`}
                                                                    value={
                                                                      itemLote.BatchNum
                                                                    }
                                                                  >
                                                                    {`${itemLote.BatchNum} Qtd:(${itemLote.Quantity})`}
                                                                  </SelectItem>
                                                                )
                                                            )}
                                                          </SelectContent>
                                                        )}
                                                      </Select>
                                                      <Button
                                                        size={"icon"}
                                                        variant={"ghost"}
                                                        onClick={() => {
                                                          const adicionarItemAListaLotes =
                                                            produce(
                                                              lotes,
                                                              (draft) => {
                                                                if (
                                                                  draft.findIndex(
                                                                    (
                                                                      draftIndex
                                                                    ) =>
                                                                      draftIndex.BatchNumber ===
                                                                      lote
                                                                  ) === -1
                                                                ) {
                                                                  draft.push({
                                                                    BatchNumber:
                                                                      lote,
                                                                    Quantity: 0,
                                                                    ItemCode:
                                                                      artigo,
                                                                  });
                                                                }
                                                              }
                                                            );
                                                          setLotes(
                                                            adicionarItemAListaLotes
                                                          );
                                                        }}
                                                      >
                                                        <PlusCircle />
                                                      </Button>
                                                      {artigoGeridoPorLotesSAP
                                                        .data
                                                        ?.ManageBatchNumbers ===
                                                      "tYES" ? (
                                                        <div>
                                                          Este item é gerido por
                                                          lotes
                                                        </div>
                                                      ) : null}
                                                    </div>
                                                  )}
                                                {
                                                  <div className="space-y-3 max-h-[339px] overflow-y-scroll sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
                                                    {lotes.map((lote) => (
                                                      <dl key={`${lote.BatchNumber}-${lote.Quantity}`} className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                                                        <div className="flex flex-row items-center">
                                                          Lote:
                                                          <dt className="font-normal mr-4 mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">
                                                            {`${lote.BatchNumber}`}
                                                          </dt>
                                                          Quantidade:
                                                          <Input
                                                            className="w-[100px] ml-2"
                                                            key={`${lote.BatchNumber}-${lote.Quantity}`}
                                                            onChange={(e) => {
                                                              const atualizarQtdUtilizarLote =
                                                                produce(
                                                                  lotes,
                                                                  (draft) => {
                                                                    const indexAtualizar =
                                                                      draft.findIndex(
                                                                        (
                                                                          draftItem
                                                                        ) =>
                                                                          draftItem.BatchNumber ===
                                                                          lote.BatchNumber
                                                                      );
                                                                    draft[
                                                                      indexAtualizar
                                                                    ].Quantity =
                                                                      Number(
                                                                        e.target
                                                                          .value
                                                                      );
                                                                  }
                                                                );
                                                              setLotes(
                                                                atualizarQtdUtilizarLote
                                                              );
                                                            }}
                                                          />
                                                          <Button
                                                            size={"icon"}
                                                            variant={"ghost"}
                                                          >
                                                            <Trash2
                                                              onClick={() => {
                                                                const eliminarItemListaLotes =
                                                                  produce(
                                                                    lotes,
                                                                    (draft) => {
                                                                      return draft.filter(
                                                                        (
                                                                          draftLote
                                                                        ) =>
                                                                          draftLote.BatchNumber !==
                                                                          lote.BatchNumber
                                                                      );
                                                                    }
                                                                  );
                                                                setLotes(
                                                                  eliminarItemListaLotes
                                                                );
                                                              }}
                                                            />
                                                          </Button>
                                                        </div>
                                                      </dl>
                                                    ))}
                                                    {artigoGeridoPorLotesSAP
                                                      .data
                                                      ?.ManageBatchNumbers ===
                                                      "tNO" && (
                                                      <>
                                                        <Separator />
                                                        Apenas para artigos sem
                                                        Lote
                                                        <div className="flex flex-row items-center">
                                                          {quantidadePorLote
                                                            .data?.value
                                                            .length! > 0 &&
                                                            quantidadePorLote.data &&
                                                            `Quantidade (${quantidadePorLote.data?.value[0].Quantity}): `}
                                                          <Input
                                                            className="w-[80px]"
                                                            onChange={(e) => {
                                                              console.log(
                                                                e.target.value
                                                              );
                                                              console.log(
                                                                "linha venda fora do produce",
                                                                linhaVenda.LineNum
                                                              );
                                                              const atualizarQuantidadeDocumentLine =
                                                                produce(
                                                                  documentLines,
                                                                  (draft) => {
                                                                    //caso ainda não exista ele insere uma nova linha
                                                                    console.log(
                                                                      "documentLines",
                                                                      documentLines
                                                                    );
                                                                    console.log(
                                                                      "linha venda do botao dentro do produce",
                                                                      lineNumLoteButton
                                                                    );
                                                                    if (
                                                                      draft.findIndex(
                                                                        (
                                                                          docLine
                                                                        ) =>
                                                                          docLine.BaseLine ===
                                                                          lineNumLoteButton
                                                                      ) === -1
                                                                    ) {
                                                                      draft.push(
                                                                        {
                                                                          BaseEntry:
                                                                            linhaVenda.DocEntry,
                                                                          BaseLine:
                                                                            lineNumLoteButton!,
                                                                          BaseType: 17,
                                                                          Quantity:
                                                                            Number(
                                                                              e
                                                                                .target
                                                                                .value
                                                                            ),
                                                                        }
                                                                      );
                                                                    }
                                                                    console.log(
                                                                      "draft do document lines",
                                                                      draft
                                                                    );
                                                                    if (
                                                                      draft.findIndex(
                                                                        (
                                                                          docLine
                                                                        ) =>
                                                                          docLine.BaseLine ===
                                                                          lineNumLoteButton
                                                                      ) !== -1
                                                                    ) {
                                                                      const indexDocLine =
                                                                        draft.findIndex(
                                                                          (
                                                                            docLine
                                                                          ) =>
                                                                            docLine.BaseLine ===
                                                                            lineNumLoteButton
                                                                        );
                                                                      draft[
                                                                        indexDocLine
                                                                      ].Quantity =
                                                                        Number(
                                                                          e
                                                                            .target
                                                                            .value
                                                                        );
                                                                    }
                                                                  }
                                                                );

                                                              setDocumentLines(
                                                                atualizarQuantidadeDocumentLine
                                                              );

                                                              console.log(
                                                                "atualizar quantidade doc lines",
                                                                atualizarQuantidadeDocumentLine
                                                              );
                                                              console.log(
                                                                "documentLines",
                                                                documentLines
                                                              );
                                                            }}
                                                          />
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                }
                                              </AlertDialogDescription>
                                            ) : null}
                                          </AlertDialogHeader>
                                          <div className="flex flex-row justify-between">
                                            <div>
                                              <Button
                                                disabled={
                                                  lotes.length === 0 &&
                                                  documentLines.length === 0
                                                }
                                                onClick={() => {
                                                  console.log(lotes);
                                                  console.log(
                                                    lineNumLoteButton
                                                  );
                                                  if (
                                                    artigoGeridoPorLotesSAP.data
                                                      ?.ManageBatchNumbers ===
                                                    "tYES"
                                                  ) {
                                                    const atualizarDocumentLinesBtc =
                                                      produce(
                                                        documentLinesBatchN,
                                                        (draft) => {
                                                          draft.push({
                                                            BaseEntry:
                                                              linhaVenda.DocEntry,
                                                            BaseLine:
                                                              lineNumLoteButton! /*
                                                              lineNumLoteButton !==
                                                              undefined
                                                                ? lineNumLoteButton
                                                                : 99*/,
                                                            BaseType: 17,
                                                            Quantity:
                                                              lotes.reduce(
                                                                (
                                                                  acc,
                                                                  currentVal
                                                                ) => {
                                                                  return (
                                                                    acc +
                                                                    currentVal.Quantity
                                                                  );
                                                                },
                                                                0
                                                              ),
                                                            BatchNumbers: lotes,
                                                          });
                                                        }
                                                      );
                                                    console.log(
                                                      "atualizar lotes line btc",
                                                      atualizarDocumentLinesBtc
                                                    );
                                                    console.log(
                                                      "Linha venda docline",
                                                      linhaVenda.LineNum
                                                    );
                                                    setDocumentLinesBatchN(
                                                      atualizarDocumentLinesBtc
                                                    );
                                                  }

                                                  setValidouSelecaoLote(true);
                                                  console.log(
                                                    "document Lines",
                                                    documentLines
                                                  );
                                                }}
                                              >
                                                Validar
                                              </Button>
                                            </div>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel
                                                onClick={() => {
                                                  setSelectLotes([]);
                                                  setLotes([]);
                                                }}
                                              >
                                                Cancelar
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                disabled={!validouSelecaoLote}
                                                onClick={() => {
                                                  setSelectLotes([]);
                                                  setLotes([]);
                                                  setValidouSelecaoLote(false);
                                                  console.log(
                                                    "document lines batchN",
                                                    documentLinesBatchN
                                                  );
                                                  setAbrirModalLote(false);
                                                }}
                                              >
                                                Continuar
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </div>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </dd>
                                  {documentLines.find(
                                    (docLineValidada) =>
                                      docLineValidada.BaseLine ===
                                      linhaVenda.LineNum
                                  ) !== undefined ? (
                                    <div className="flex flex-row">
                                      <div>Validado</div>
                                      <div>{` (${
                                        documentLines.find(
                                          (docLineValidada) =>
                                            docLineValidada.BaseLine ===
                                            linhaVenda.LineNum
                                        )?.Quantity
                                      })
                                      `}</div>
                                    </div>
                                  ) : null}
                                  {documentLinesBatchN.find(
                                    (docLineValidada) =>
                                      docLineValidada.BaseLine ===
                                      linhaVenda.LineNum
                                  ) !== undefined ? (
                                    <div className="flex flex-row">
                                      <div>Validado</div>
                                      <div>{` (${
                                        documentLinesBatchN.find(
                                          (docLineValidada) =>
                                            docLineValidada.BaseLine ===
                                            linhaVenda.LineNum
                                        )?.Quantity
                                      })
                                      `}</div>
                                    </div>
                                  ) : null}
                                  <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                                    <div className="flex flex-row gap-1 items-center">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        Quantidade:
                                      </span>
                                      {linhaVenda.RemainingOpenQuantity}/
                                      {linhaVenda.Quantity}
                                    </div>
                                  </dd>
                                </dl>
                                <Separator className="mt-1" />
                              </>
                            ))}
                        </div>
                      </div>
                    </section>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setSelectLotes([]);
                      setLotes([]);
                    }}
                  >
                    Cancelar
                  </AlertDialogCancel>
                  <Button
                    onClick={() => {
                      let arrayAuxiliar: any =
                        documentLinesBatchN.concat(documentLines);

                      setBody({
                        CardCode: cardCode,
                        DocDate: docDate,
                        DocumentLines: arrayAuxiliar,
                      });
                      setValidouValores(true);
                      console.log(arrayAuxiliar);
                      console.log(body);
                    }}
                  >
                    Validar
                  </Button>
                  <Button
                    disabled={!validouValores}
                    onClick={() =>
                      imprimirEtiqueta(`^XA
                        ^FO50,60^GFA,2016,2016,16,,:T07IF8,S0LFC,R0NFC,Q07OFC,P03QF,P0RFC,O03SF,O0TFC,N03UF,N0VFC,M01LFCI0LFE,M07KF8K07KF8,M0KFCM0KFC,L01JFEN01JFE,L03JFP03JF,L07IFCQ0JF8,K01JFR03IFE,K03IFER01JF,K07IF8S07IF8,K07IFT03IFC,K0IFCU0IFE,J01IF8U07FFE,J03IFJ0E38O03IF,J07FFE0079F7EO01IF8,J0IFC00JFEP0IFC,I01IF800JFEP07FFE,I01IFI0IF7EP03FFE,I03FFEI0F9E3CP01IF,I07FFCI03U0IF,I07FF8I078E3C7P07FF8,I0IFJ0FDF7EF8O03FFC,I0IFJ0LFCO03FFC,001FFEJ0LFCO01FFE,001FFCJ0FDF7EF8P0FFE,003FFCJ078E3C7Q0IF,003FF8L0E1830CO07FF,007FF8J079F7CF9FO03FF8,007FFK0NFO03FF8,00FFEK0NFO01FFC,00FFEK0JFEIFO01FFC,00FFCK0FDF3CF9FP0FFC,01FFCK078418S0FFE,01FFCK078E3CS0FFE,01FF8K0FDF7ES07FE,03FF8K0JFES07FF,:03FFL0FDF7ES03FF,03FFL078E18S03FF,07FFL038E1C30EP03FF807FEL07DFBEFDFP01FF807FEL0NF8O01FF8:07FEL0FDLF8O01FF807FEL07CF3E79FP01FFC0FFEL03060C306Q0FFC0FFCL07CF3E79F3CO0FFC0FFCL0FDFBEFDFFEO0FFC0FFCL0OFEO0FFC:P07DFBEFDF3E,P03861C30E1C,P038F1C78E1C7,P07DFBEFDF3EF8,0FFCL0QFCM0FFC:0FFCL0FDFBEFDFFEFCM0FFC0FFCL07CF3E79F3C78M0FFC0FFCL01X0FFC0FFEL03071ET0FFC07FEL07CFBFS01FFC07FEL0FDIFS01FF8:07FEL0FDFBFS01FF807FEL07CF1ES01FF807FFL03W03FF803FFL078F1E78E3CF8L03FF,03FFL0FDFBEFDF7EF8L03FF,03FF8K0QFCL07FF,:01FF8K07DFBEFDFFEF8L07FE,01FFCK038F1C78F3C7M0FFE,01FFCK03861C38E1C71EK0FFE,00FFCK07DFBE7DF3EFBFK0FFC,00FFEK0SFJ01FFC,:007FFK0FDJFDFFEFBFJ03FF8,007FFK07CF3E79F3E79EJ03FF8,003FF8J01060C3061870C1I07FF,003FFCJ038F3E78F3CF9F7C00IF,001FFCJ07DFBFFDLF7E00FFE,001FFEJ0TFE01FFE,I0IFJ0SF7E03FFC,I0IFJ07DFBEFDF3EF9F7C03FFC,I07FF8I07CF1C78E1C70C1807FF8,I03FFCY0IF8,I03FFEX01IF,I01IFX03FFE,J0IF8W07FFE,J0IFCW0IFC,J07FFEV01IF8,J03IFV03IF,J01IF8U07FFE,J01IFCU0IFC,K0JFT03IFC,K07IF8S07IF8,K03IFER01JF,K01JFR03IFE,L0JFCQ0JF8,L03JFP03JF,L01JFEN01JFE,M0KF8M07JFC,M07KF8K07KF8,M01LFE001LFE,N0VFC,N03UF,O0TFC,O03SF,P0RFE,P03QF,Q07OF8,Q01NFC,R01LFE,T07IF8,,^FS^FS
                        ^CF0,60
                        ^FO220,50^FDEgiquimica^FS
                        ^CF0,30
                        ^FO220,115^FDParque Industrial Guarda, Lt.10/15^FS
                        ^FO220,155^FDGuarda^FS
                        ^FO220,195^FDPortugal (PT)^FS
                        ^FO50,245^GB700,3,3^FS
                        ^CFD,40
                        ^FO50,265^FDCliente:^FS
                        ^CFA,30
                        ^FO50,315^FD${ordensVendaSAP.data?.value
                          .find(
                            (ordemVendaVal) =>
                              ordemVendaVal.DocEntry === pickagemOrdemVenda
                          )
                          ?.CardName.substring(0, 20)}...^FS
                        ^CFD,40
                        ^FO50,365^FDValidador:^FS
                        ^FO50,450^GB400,3,3^FS
                        ^CFA,40
                        ^FO150,1195^FD${format(datahora, "PPP", {
                          locale: pt,
                        })}^FS
                        ^FO515,255^BQ,,6
                        ^FDF:Ex&C1:${pickagemOrdemVenda}&C2:${
                        ordensVendaSAP.data?.value.find(
                          (ordemVendaVal) =>
                            ordemVendaVal.DocEntry === pickagemOrdemVenda
                        )?.CardCode
                      }&C3:${format(datahora, "P", {
                        locale: pt,
                      })}&C4:C5:&C6:&^FS
                        
                        ^FO50,500^GB700,60,3^FS
                        ^FO50,500^GB190,60,3^FS
                        ^FO50,500^GB500,60,3^FS
                        ^CF0,35
                        ^FO100,515^FDArtigo^FS
                        ^FO350,515^FDLote^FS
                        ^FO600,515^FDQtd.^FS
                        ^FO50,570^GB700,60,3^FS
                        ^FO50,570^GB190,60,3^FS
                        ^FO50,570^GB500,60,3^FS
                        ^FO100,585^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[0],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).itemCode) ??
                          "---"
                        }^FS
                        ^FO350,585^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[0],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).batchNumber) ??
                          "---"
                        }^FS
                        ^FO600,585^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[0],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).quantity) ??
                          "---"
                        }^FS
                        ^FO50,640^GB700,60,3^FS
                        ^FO50,640^GB190,60,3^FS
                        ^FO50,640^GB500,60,3^FS
                        ^FO100,655^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[1],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).itemCode) ??
                          "---"
                        }^FS
                        ^FO350,655^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[1],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).batchNumber) ??
                          "---"
                        }^FS
                        ^FO600,655^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[1],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).quantity) ??
                          "---"
                        }^FS
                        ^FO50,710^GB700,60,3^FS
                        ^FO50,710^GB190,60,3^FS
                        ^FO50,710^GB500,60,3^FS
                        ^FO100,725^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[2],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).itemCode) ??
                          "---"
                        }^FS
                        ^FO350,725^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[2],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).batchNumber) ??
                          "---"
                        }^FS
                        ^FO600,725^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[2],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).quantity) ??
                          "---"
                        }^FS
                        ^FO50,780^GB700,60,3^FS
                        ^FO50,780^GB190,60,3^FS
                        ^FO50,780^GB500,60,3^FS
                        ^FO100,795^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[3],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).itemCode) ??
                          "---"
                        }^FS
                        ^FO350,795^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[3],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).batchNumber) ??
                          "---"
                        }^FS
                        ^FO600,795^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[3],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).quantity) ??
                          "---"
                        }^FS
                        ^FO50,850^GB700,60,3^FS
                        ^FO50,850^GB190,60,3^FS
                        ^FO50,850^GB500,60,3^FS
                        ^FO100,865^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[4],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).itemCode) ??
                          "---"
                        }^FS
                        ^FO350,865^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[4],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).batchNumber) ??
                          "---"
                        }^FS
                        ^FO600,865^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[4],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).quantity) ??
                          "---"
                        }^FS
                        ^FO50,920^GB700,60,3^FS
                        ^FO50,920^GB190,60,3^FS
                        ^FO50,920^GB500,60,3^FS
                        ^FO100,935^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[5],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).itemCode) ??
                          "---"
                        }^FS
                        ^FO350,935^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[5],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).batchNumber) ??
                          "---"
                        }^FS
                        ^FO600,935^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[5],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).quantity) ??
                          "---"
                        }^FS
                        ^FO50,990^GB700,60,3^FS
                        ^FO50,990^GB190,60,3^FS
                        ^FO50,990^GB500,60,3^FS
                        ^FO100,1005^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[6],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).itemCode) ??
                          "---"
                        }^FS
                        ^FO350,1005^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[6],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).batchNumber) ??
                          "---"
                        }^FS
                        ^FO600,1005^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[6],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).quantity) ??
                          "---"
                        }^FS
                        ^FO50,1060^GB700,60,3^FS
                        ^FO50,1060^GB190,60,3^FS
                        ^FO50,1060^GB500,60,3^FS
                        ^FO100,1075^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[7],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).itemCode) ??
                          "---"
                        }^FS
                        ^FO350,1075^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[7],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).batchNumber) ??
                          "---"
                        }^FS
                        ^FO600,1075^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[7],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).quantity) ??
                          "---"
                        }^FS
                        ^FO50,1130^GB700,60,3^FS
                        ^FO50,1130^GB190,60,3^FS
                        ^FO50,1130^GB500,60,3^FS
                        ^FO100,1145^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[8],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).itemCode) ??
                          "---"
                        }^FS
                        ^FO350,1145^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[8],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).batchNumber) ??
                          "---"
                        }^FS
                        ^FO600,1145^FD${
                          (ordensVendaSAP.data &&
                            extractDetails(
                              body?.DocumentLines[8],
                              ordensVendaSAP.data?.value,
                              pickagemOrdemVenda
                            ).quantity) ??
                          "---"
                        }^FS
                        ^XZ`)
                    }
                  >
                    <Printer className="mr-1" /> Etiqueta
                  </Button>
                  <AlertDialogAction
                    disabled={!validouValores}
                    onClick={() => {
                      guiaRemessaSAPmutation.mutate(body);
                      setValidouValores(false);
                    }}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div
              className="mt-6 flex items-center justify-center sm:mt-8"
              aria-label="Page navigation"
            >
              <div className="mt-2 gap-x-2 flex flex-col">
                <div className="flex flex-row items-center mt-2 gap-x-2">
                  <Button
                    variant="ghost"
                    size={"icon"}
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      handlePaginaAnterior();
                    }}
                  >
                    <span className="sr-only">Página Anterior</span>
                    <ArrowLeftCircle
                      color="#84CC27"
                      size={30}
                      strokeWidth={1.5}
                    />
                  </Button>
                  <h2>Página</h2>
                  <Label className="text-lg">{numeroPagina}</Label>
                  <Button
                    variant="ghost"
                    size={"icon"}
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      handlePaginaSeguinte();
                    }}
                  >
                    <span className="sr-only">Próxima Página</span>
                    <ArrowRightCircle
                      color="#84CC27"
                      size={30}
                      strokeWidth={1.5}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
const logotipoEgiquimicaZPL =
  "^FO50,60^GFA,2016,2016,16,,:T07IF8,S0LFC,R0NFC,Q07OFC,P03QF,P0RFC,O03SF,O0TFC,N03UF,N0VFC,M01LFCI0LFE,M07KF8K07KF8,M0KFCM0KFC,L01JFEN01JFE,L03JFP03JF,L07IFCQ0JF8,K01JFR03IFE,K03IFER01JF,K07IF8S07IF8,K07IFT03IFC,K0IFCU0IFE,J01IF8U07FFE,J03IFJ0E38O03IF,J07FFE0079F7EO01IF8,J0IFC00JFEP0IFC,I01IF800JFEP07FFE,I01IFI0IF7EP03FFE,I03FFEI0F9E3CP01IF,I07FFCI03U0IF,I07FF8I078E3C7P07FF8,I0IFJ0FDF7EF8O03FFC,I0IFJ0LFCO03FFC,001FFEJ0LFCO01FFE,001FFCJ0FDF7EF8P0FFE,003FFCJ078E3C7Q0IF,003FF8L0E1830CO07FF,007FF8J079F7CF9FO03FF8,007FFK0NFO03FF8,00FFEK0NFO01FFC,00FFEK0JFEIFO01FFC,00FFCK0FDF3CF9FP0FFC,01FFCK078418S0FFE,01FFCK078E3CS0FFE,01FF8K0FDF7ES07FE,03FF8K0JFES07FF,:03FFL0FDF7ES03FF,03FFL078E18S03FF,07FFL038E1C30EP03FF807FEL07DFBEFDFP01FF807FEL0NF8O01FF8:07FEL0FDLF8O01FF807FEL07CF3E79FP01FFC0FFEL03060C306Q0FFC0FFCL07CF3E79F3CO0FFC0FFCL0FDFBEFDFFEO0FFC0FFCL0OFEO0FFC:P07DFBEFDF3E,P03861C30E1C,P038F1C78E1C7,P07DFBEFDF3EF8,0FFCL0QFCM0FFC:0FFCL0FDFBEFDFFEFCM0FFC0FFCL07CF3E79F3C78M0FFC0FFCL01X0FFC0FFEL03071ET0FFC07FEL07CFBFS01FFC07FEL0FDIFS01FF8:07FEL0FDFBFS01FF807FEL07CF1ES01FF807FFL03W03FF803FFL078F1E78E3CF8L03FF,03FFL0FDFBEFDF7EF8L03FF,03FF8K0QFCL07FF,:01FF8K07DFBEFDFFEF8L07FE,01FFCK038F1C78F3C7M0FFE,01FFCK03861C38E1C71EK0FFE,00FFCK07DFBE7DF3EFBFK0FFC,00FFEK0SFJ01FFC,:007FFK0FDJFDFFEFBFJ03FF8,007FFK07CF3E79F3E79EJ03FF8,003FF8J01060C3061870C1I07FF,003FFCJ038F3E78F3CF9F7C00IF,001FFCJ07DFBFFDLF7E00FFE,001FFEJ0TFE01FFE,I0IFJ0SF7E03FFC,I0IFJ07DFBEFDF3EF9F7C03FFC,I07FF8I07CF1C78E1C70C1807FF8,I03FFCY0IF8,I03FFEX01IF,I01IFX03FFE,J0IF8W07FFE,J0IFCW0IFC,J07FFEV01IF8,J03IFV03IF,J01IF8U07FFE,J01IFCU0IFC,K0JFT03IFC,K07IF8S07IF8,K03IFER01JF,K01JFR03IFE,L0JFCQ0JF8,L03JFP03JF,L01JFEN01JFE,M0KF8M07JFC,M07KF8K07KF8,M01LFE001LFE,N0VFC,N03UF,O0TFC,O03SF,P0RFE,P03QF,Q07OF8,Q01NFC,R01LFE,T07IF8,,^FS";

export default ListaOrdensVenda;
