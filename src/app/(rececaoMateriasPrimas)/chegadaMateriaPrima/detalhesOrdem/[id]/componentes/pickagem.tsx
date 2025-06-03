"use client";
import React, { useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Rings } from "react-loader-spinner";
import { useFetchUmaOrdemCompraSAPData } from "@/Services/OrdensCompra/fetchUmaOrdemCompraSAP";
import { useFetchQuantidadeArtigoLote } from "@/Services/LotesPorArtigo/fetchQuantidadeArtigoLote";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {
  BadgeCheck,
  BadgeX,
  BadgeAlert,
  CheckCircle,
  Calendar as CalendarIcon,
  Printer,
  Trash2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { produce } from "immer";
import { useEffect } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import QrcodeComponent from "@/components/ui/qrcodeComponent";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useLancarRececaoSAP } from "@/Services/RececoesMercadoria/criarRececaoMercadoria";
import { Button } from "@/components/ui/button";
import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useFetchBatchManagedSAPData } from "@/Services/Inventario/fetchVerificarBatchNumber";
import { DialogTitle } from "@radix-ui/react-dialog";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { batch } from "react-redux";



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
  BatchNumbers: batchNumbersInterface[];
}
interface documentLinesInterface {
  BaseEntry: Number;
  BaseLine: Number;
  BaseType: Number;
  Quantity: Number;
}
interface geridoPorLotesInterface {
  ItemCode: string;
  simNao: boolean;
}

function isJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

const Pickagem = () => {
  const datahora = new Date();
  const { id } = useParams();
  const router = useRouter();
  const [artigo, setArtigo] = useState("");
  const quantidadeLote = useFetchQuantidadeArtigoLote(artigo);
  const geridoPorLotesSAP = useFetchBatchManagedSAPData(artigo);
  const lancarRececaoSAPmutation = useLancarRececaoSAP();
  const OrdemCompra = useFetchUmaOrdemCompraSAPData(Number(id));
  const [pickagens, setPickagens] = useState({
    C1: "",
    C2: "",
    C3: "",
    C4: "",
    C5: "",
    C6: "",
    F: "",
  });
  const [docDate, setDocDate] = useState("");
  const [cardCode, setCardCode] = useState("");
  const [itensPorPickar, setitensPorPickar] = useState(0);
  const [quantidadePorReceber, setQuantidadePorReceber] = useState([
    { ItemCode: "", quantidade: 0 },
  ]);
  const [batchNumbers, setBatchNumbers] = useState<batchNumbersInterface[]>([]);
  const [numeroLote, setNumeroLote] = useState("");
  const [geridoPorLotes, setGeridoPorLotes] = useState<
    geridoPorLotesInterface[]
  >([]);
  const [itensAValidar, setItensAValidar] = useState([
    { LineNum: 0, ItemCode: "MP0053", ItemDescription: "ALCOOL ISOPROPÍLICO" },
  ]);
  const [itensValidados, setItensValidados] = useState([
    { ItemCode: "", timestamp: "", quantidade: 0, baseLine: 9999 },
  ]);
  const [dataValidadeItensValidados, setDataValidadeItensValidados] = useState([
    {
      LineNum: 9999,
      ItemCode: "",
      dataValidade: datahora.toISOString(),
    },
  ]);
  const [pickState, setPickState] = useState({
    success: false,
    alert: false,
    error: false,
  });
  const [documentLinesBatchN, setDocumentLinesBatchN] = useState<
    documentLinesBatchN[]
  >([]);
  const [documentLines, setDocumentLines] = useState<documentLinesInterface[]>(
    []
  );
  const [documentLinesGlobal, setDocumentLinesGlobal] = useState<any[]>([]);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [validouValores, setValidouValores] = useState(false);
  const { lastMessage } = useWebSocket("ws://localhost:8080/pickagem", {
    onOpen(event) {
      console.log(event);
      console.log("websocket aberto");
    },
    onMessage(event) {
      console.log("mensagem recebida", event.data);
      if (isJSON(event.data)) {
        const dataPARSEADA = JSON.parse(event.data);

        //console.log(JSON.parse(event.data));

        if (dataPARSEADA.type === "qr_data" && dataPARSEADA.payload?.parsed) {
          const qrData = dataPARSEADA.payload.parsed;

          console.log("qr data", qrData);

          const atualizarListaPickagens = produce(pickagens, (draft) => {
            draft.C1 = qrData.C1;
            draft.C2 = qrData.C2;
            draft.C3 = qrData.C3;
            draft.C4 = qrData.C4;
            draft.C5 = qrData.C5;
            draft.C6 = qrData.C6;
            draft.F = qrData.F;
            console.log(draft);
            return draft;
          });
          console.log("atualizar lista picagens", atualizarListaPickagens);

          setPickagens(atualizarListaPickagens);
        } else if (dataPARSEADA.type === "status") {
          console.log("Status update:", dataPARSEADA.payload);
        } else {
          console.log("Unknown body message");
        }
      }
    },
    share: true,
  });

  const handlePickagem = () => {
    if (pickagens?.F == "MateriaPrima") {
      let codigoMateriaPrima = pickagens.C1;
      console.log("codigo materia prima picagem", codigoMateriaPrima);

      // criar logica das pickagens:
      //caso o pick realizado exista na lista itensAValidar e ainda não tenha sido validado mostrar badgeCheck
      //caso o pick realizado exista na lista itensAValidar e já tenha sido validado mostrar badgeAlert
      //caso o pick realizado não exista na lista itensAValidar mostrar badgeX

      //caso o pick realizado exista na lista itensAValidar e ainda não tenha sido validado mostrar badgeCheck
      if (
        itensAValidar.some(
          (item) => item.LineNum === Number(codigoMateriaPrima)
        ) &&
        itensValidados.find(
          (item) => item.baseLine === Number(codigoMateriaPrima)
        ) === undefined
      ) {
        //force do nunca sera nulo no itemCode e na quantidade ao fim do draft.push no itemCode e no RemainingOpenQuantity
        const atualizarListaItensValidados = produce(
          itensValidados,
          (draft) => {
            draft.push({
              ItemCode: OrdemCompra.data?.DocumentLines.find(
                (itemOrdem) => itemOrdem.LineNum === Number(codigoMateriaPrima)
              )?.ItemCode!,
              timestamp: format(datahora, "PPpp", { locale: pt }),
              quantidade: OrdemCompra.data?.DocumentLines.find(
                (itemOrdem) => itemOrdem.LineNum === Number(codigoMateriaPrima)
              )?.RemainingOpenQuantity!,
              baseLine: Number(codigoMateriaPrima),
            });
          }
        );
        console.log(
          "atualizar lista itens validados",
          atualizarListaItensValidados
        );
        setItensValidados(atualizarListaItensValidados);
        const atualizarDataValidadeItensValidados = produce(
          dataValidadeItensValidados,
          (draft) => {
            draft.push({
              //force do nao nulo no ItemCode
              LineNum: Number(codigoMateriaPrima),
              ItemCode: OrdemCompra.data?.DocumentLines.find(
                (itemOrdem) => itemOrdem.LineNum === Number(codigoMateriaPrima)
              )?.ItemCode!,
              dataValidade: datahora.toISOString(),
            });
            if (draft[0].ItemCode === "") {
              draft.shift();
            }
          }
        );
        setDataValidadeItensValidados(atualizarDataValidadeItensValidados);
        console.log(dataValidadeItensValidados);
        console.log("itens validados",itensValidados);
        const atualizarPickState = produce(pickState, (draft) => {
          draft.success = true;
          draft.alert = false;
          draft.error = false;
        });
        setPickState(atualizarPickState);
      }

      //caso o pick realizado exista na lista itensAValidar e já tenha sido validado mostrar badgeAlert
      if (
        itensAValidar.some((item) =>
          codigoMateriaPrima.includes(item.LineNum.toString())
        ) &&
        itensValidados.find(
          (item) => item.baseLine === Number(codigoMateriaPrima)
        ) !== undefined &&
        pickagens.C1.includes(codigoMateriaPrima)
      ) {
        console.log(pickagens.C1);
        console.log(itensValidados);
        const atualizarPickState = produce(pickState, (draft) => {
          draft.success = false;
          draft.alert = true;
          draft.error = false;
        });
        setPickState(atualizarPickState);
      }

      //caso o pick realizado não exista na lista itensAValidar mostrar badgeX
      if (
        !itensAValidar.some((item) =>
          codigoMateriaPrima.includes(item.LineNum.toString())
        )
      ) {
        const atualizarPickState = produce(pickState, (draft) => {
          draft.success = false;
          draft.alert = false;
          draft.error = true;
        });
        setPickState(atualizarPickState);
      }
    }
  };
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
    if (printerStatus.isReadyToPrint) {
      await browserPrint.print(zpl);
    }
  };

  useEffect(() => {
    console.log(OrdemCompra.data?.DocEntry);
    const atualizarItensAVAlidar = produce(itensAValidar, (draft) => {
      draft.length = 0;
      OrdemCompra.data?.DocumentLines.forEach((docLine) => {
        draft.push({
          LineNum: docLine.LineNum,
          ItemCode: docLine.ItemCode,
          ItemDescription: docLine.ItemDescription,
        });
      });
      //console.log(draft);
      return draft;
    });
    console.log(atualizarItensAVAlidar);
    setItensAValidar(atualizarItensAVAlidar);
    if (OrdemCompra.data?.CardCode !== undefined) {
      console.log(OrdemCompra.data?.CardCode);
      setCardCode(OrdemCompra.data?.CardCode);
    }

    if (OrdemCompra.data?.DocumentLines !== undefined) {
      const numeroItensPorPickar = OrdemCompra.data?.DocumentLines.reduce(
        (contador, docLine) =>
          docLine.LineStatus === "bost_Open" ? contador + 1 : contador,
        0
      );
      setitensPorPickar(numeroItensPorPickar);
      const atualizarListaDeQuantidadePorReceber = produce(
        quantidadePorReceber,
        (draft) => {
          draft.length = 0;
          OrdemCompra.data?.DocumentLines.forEach((itemLine) =>
            draft.push({
              ItemCode: itemLine.ItemCode,
              quantidade: itemLine.RemainingOpenQuantity,
            })
          );
        }
      );
      console.log(atualizarListaDeQuantidadePorReceber);
      setQuantidadePorReceber(atualizarListaDeQuantidadePorReceber);
      console.log(quantidadePorReceber);
    }
    setDocDate(format(datahora.toISOString(), "yyyyMMdd"));
  }, [OrdemCompra.data]);

  useEffect(() => {
    OrdemCompra.refetch();
    if (lancarRececaoSAPmutation.isSuccess) {
      toast.success("Receção Realizada com Sucesso!");
      router.push(`/chegadaMateriaPrima`);
    }
  }, [lancarRececaoSAPmutation]);

  useEffect(() => {
    handlePickagem();
  }, [pickagens]);

  return (
    <div className="min-w-full">
      <section className="bg-white py-6 antialiased dark:bg-gray-900 md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <div>
            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">
                Itens por Pickar:
              </span>{" "}
              {/*itensAValidar.length - (itensValidados.length - 1)*/}
              {itensPorPickar}
            </p>
            <Progress
              value={
                OrdemCompra.data
                  ? ((OrdemCompra.data?.DocumentLines.length - itensPorPickar) *
                      100) /
                    OrdemCompra.data?.DocumentLines.length
                  : 0
              }
            />
          </div>
          <div className="mt-6 sm:mt-8 lg:flex lg:gap-8">
            {OrdemCompra.isLoading ? (
              <div>A carregar itens ...</div>
            ) : (
              <div className="w-full divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700 lg:max-w-xl xl:max-w-2xl">
                {OrdemCompra.data?.DocumentLines.map((item, index) => (
                  <div key={index} className="space-y-4 p-6">
                    <div className="flex items-center gap-6">
                      <a className="h-14 w-14 shrink-0">
                        {itensValidados.find(
                          (itemValidado) =>
                            itemValidado.baseLine === item.LineNum
                        ) ? (
                          <img
                            className="h-full w-full"
                            src="/assets/images/packageClr.png"
                            alt="package image"
                          />
                        ) : (
                          <img
                            className="h-full w-full"
                            src="/assets/images/package.png"
                            alt="package image"
                          />
                        )}
                      </a>

                      <div className="min-w-0 flex-1 flex-row font-medium text-gray-900 dark:text-white">
                        {item.LineNum} {item.ItemDescription}
                        {item.LineStatus === "bost_Open" ? (
                          <div className="mt-1 flex items-center gap-x-1.5">
                            <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <p className="text-xs leading-5 text-gray-500">
                              {`Em aberto (falta ${
                                quantidadePorReceber.find(
                                  (itemReceber) =>
                                    itemReceber.ItemCode === item.ItemCode
                                )?.quantidade
                              })`}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-1 flex items-center gap-x-1.5">
                            <div className="flex-none rounded-full bg-rose-500/20 p-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            </div>
                            <p className="text-xs leading-5 text-gray-500">
                              Fechada
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <QrcodeComponent
                          information={`F:MateriaPrima&C1:${item.LineNum}&C2:${
                            item.ItemDescription
                          }&C3:F0001&C4:4230126&C5:2024-01-05T00:00:00Z&C6:${format(
                            datahora,
                            "P",
                            { locale: pt }
                          )}&`}
                        />
                        {/*<Dialog>
                          <DialogTrigger>
                            <Info />
                          </DialogTrigger>
                          <DialogContent className="max-w-[250px] justify-center">
                            <DialogHeader>
                              <DialogDescription>
                                <QrcodeComponent
                                  information={`F:MateriaPrima&C1:${
                                    item.ItemCode
                                  }&C2:${
                                    item.ItemDescription
                                  }&C3:F0001&C4:4230126&C5:2024-01-05T00:00:00Z&C6:${format(
                                    datahora,
                                    "P",
                                    { locale: pt }
                                  )}&`}
                                />
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>*/}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">
                          ID do Produto:
                        </span>{" "}
                        {item.ItemCode}
                      </p>
                      <div className="flex items-center justify-end gap-4">
                        <p className="text-base font-normal text-gray-900 dark:text-white">
                          x{item.Quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 grow sm:mt-8 lg:mt-0">
              <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Histórico Ordem
                </h3>
                <div className="flex flex-row space-x-2 items-center">
                  <Select
                    onValueChange={(e) => {
                      console.log("lotes",e);

                      setArtigo(e);
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Artigo" />
                    </SelectTrigger>
                    <SelectContent>
                      {itensValidados.map(
                        (itemValidadoSelect) =>
                          itemValidadoSelect.ItemCode !== "" && (
                            <SelectItem
                              key={`${itemValidadoSelect.ItemCode}-${itemValidadoSelect.quantidade}`}
                              value={itemValidadoSelect.ItemCode.toString()}
                            >
                              {`${itemValidadoSelect.baseLine} ${itemValidadoSelect.ItemCode}`}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={(e) => {
                      //setArtigo(item.ItemCode);
                      e.preventDefault();

                      quantidadeLote.refetch();
                      geridoPorLotesSAP.refetch();
                      console.log("quantidades sap",quantidadeLote.data);
                      console.log("gerido por lotes sap",geridoPorLotesSAP.data);
                    }}
                  >
                    {quantidadeLote.isRefetching ||
                    quantidadeLote.isFetching ? (
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
                      <>Lote</>
                    )}
                  </Button>

                  <div>
                    <Dialog>
                      <DialogTrigger>Detalhes</DialogTrigger>
                      <DialogContent>
                        <DialogTitle></DialogTitle>
                        <DialogDescription>
                          <div className="space-y-4 max-h-[339px] overflow-y-scroll sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
                            {quantidadeLote.data?.value.map((lote, index) => (
                              <dl
                                key={index}
                                className="sm:flex items-center justify-between gap-4"
                              >
                                <dd className="flex-col items-center justify-center">
                                  <div className="font-medium text-gray-900 dark:text-white sm:text-end">
                                    Artigo
                                  </div>
                                  <div>{lote.ItemCode}</div>
                                </dd>
                                <dd className="flex-col items-center justify-center">
                                  <div className="font-medium text-gray-900 dark:text-white sm:text-end">
                                    Gerido por Lotes
                                  </div>
                                  <div>
                                    {lote.IsBatchManaged === "Y"
                                      ? "Sim"
                                      : "Não"}
                                  </div>
                                </dd>
                                <dd className="flex-col items-center justify-center">
                                  <div className="font-medium text-gray-900 dark:text-white sm:text-end">
                                    Armazém
                                  </div>
                                  <div>{lote.WhsCode}</div>
                                </dd>

                                <dd className="flex-col items-center justify-center">
                                  <div className="font-medium text-gray-900 dark:text-white sm:text-end">
                                    Número Lote
                                  </div>
                                  <div>{lote.BatchNum}</div>
                                </dd>
                                <dd className="flex-col items-center justify-center">
                                  <div className="font-medium text-gray-900 dark:text-white sm:text-end">
                                    Quantidade
                                  </div>
                                  <div>{lote.Quantity}</div>
                                </dd>
                              </dl>
                            ))}
                          </div>
                        </DialogDescription>
                        <DialogFooter>
                          <Input
                            onChange={(e) => {
                              setNumeroLote(e.target.value);
                            }}
                          />
                          <Button
                            disabled={
                              itensValidados.filter(
                                (itemValidadoButtonDis) =>
                                  itemValidadoButtonDis.ItemCode !== ""
                              ).length < 1
                            }
                            onClick={(e) => {
                              e.preventDefault();

                              const dadosJaColocadosBatchNumber =
                                batchNumbers.find(
                                  (batch) =>
                                    batch.ItemCode === artigo &&
                                    batch.BatchNumber === numeroLote
                                );

                              if (dadosJaColocadosBatchNumber) {
                                console.log(
                                  "dados ja colocados",
                                  dadosJaColocadosBatchNumber
                                );
                                return;
                              }

                              const atualizarBatchNumber = produce(
                                batchNumbers,
                                (draft) => {
                                  draft.push({
                                    ItemCode: artigo,
                                    BatchNumber: numeroLote,
                                    Quantity: 0,
                                  });
                                }
                              );
                              setBatchNumbers(atualizarBatchNumber);
                              console.log(
                                "atualizar batch number",
                                atualizarBatchNumber
                              );

                              const dadosJaColocadosGeridoPorLotes =
                                geridoPorLotes.find(
                                  (item) => item.ItemCode === artigo
                                );

                              if (!dadosJaColocadosGeridoPorLotes) {
                                const atualizarListaGeridoPorLotes = produce(
                                  geridoPorLotes,
                                  (draft) => {
                                    draft.push({
                                      ItemCode: artigo,
                                      simNao: true,
                                    });
                                  }
                                );
                                setGeridoPorLotes(atualizarListaGeridoPorLotes);
                              }
                            }}
                          >
                            Definir Número Lote
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <ol className="relative ms-3 border-s border-gray-200 dark:border-gray-700">
                  {itensValidados.map((item, index) => {
                    return item.ItemCode !== "" ? (
                      <div className="flex flex-row items-center space-x-4">
                        <li
                          className="ms-6 py-2 text-primary-700 dark:text-primary-500"
                          key={index}
                        >
                          <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
                            <CheckCircle color="#84CC27" />
                            <path
                              stroke="currentColor"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 11.917 9.724 16.5 19 7.5"
                            />
                          </span>
                          <div>
                            <h4 className="mb-0.5 font-semibold">
                              {item.timestamp}
                            </h4>
                            <a className="text-sm font-mediums">
                              Item pickado - ID do Produto {item.ItemCode}
                            </a>
                          </div>
                        </li>
                      </div>
                    ) : null;
                  })}
                </ol>
                <div className="gap-4 sm:flex sm:items-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        onClick={() => {
                          console.log("");
                        }}
                      >
                        Confirmar Receção
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle></AlertDialogTitle>
                        <AlertDialogDescription className="mx-auto">
                          <section className="bg-white py-4 antialiased dark:bg-gray-900 md:py-16">
                            <div className="mx-auto max-w-2xl px-4 2xl:px-0">
                              <p className="text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
                                Quaisquer alterações que desejar realizar no
                                lançamento da receção de produtos da ordem{" "}
                                <a className="font-medium text-gray-900 dark:text-white">
                                  #{id}
                                </a>{" "}
                                deverá ser feita agora.
                              </p>
                              <div className="space-y-4 max-h-[339px] overflow-y-scroll sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
                                {itensValidados.map((item, index) => {
                                  return (
                                    item.ItemCode !== "" && (
                                      <div className=" border border-red-400 rounded-lg outline-offset-4">
                                        <dl
                                          key={index}
                                          className="sm:flex items-center justify-between gap-4"
                                        >
                                          <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">
                                            {`${
                                              OrdemCompra.data?.DocumentLines.find(
                                                (itemOrdem) =>
                                                  itemOrdem.ItemCode ===
                                                  item.ItemCode
                                              )?.ItemDescription
                                            } (${item.ItemCode})`}
                                          </dt>

                                          <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                                            <div className="flex flex-row gap-1 items-center">
                                              <span className="font-medium text-gray-900 dark:text-white">
                                                Quantidade:
                                              </span>
                                              <Input
                                                className="w-[85px]"
                                                defaultValue={
                                                  itensValidados.find(
                                                    (itemValidado) =>
                                                      itemValidado.ItemCode ===
                                                      item.ItemCode
                                                  )?.quantidade
                                                }
                                                onChange={(e) => {
                                                  const atualizarQuantidadeItensValidados =
                                                    produce(
                                                      itensValidados,
                                                      (draft) => {
                                                        console.log(
                                                          (draft[
                                                            index
                                                          ].quantidade =
                                                            parseInt(
                                                              e.target.value
                                                            ))
                                                        );
                                                      }
                                                    );
                                                  setItensValidados(
                                                    atualizarQuantidadeItensValidados
                                                  );

                                                  console.log(batchNumbers);
                                                  const atualizarQuantidadeBatchNumber =
                                                    produce(
                                                      batchNumbers,
                                                      (draft) => {
                                                        const indexItemAtualizar =
                                                          draft.findIndex(
                                                            (batchNumber) =>
                                                              batchNumber.ItemCode ===
                                                              item.ItemCode
                                                          );
                                                        draft[
                                                          indexItemAtualizar
                                                        ].Quantity = Number(
                                                          e.target.value
                                                        );
                                                      }
                                                    );
                                                  console.log(
                                                    atualizarQuantidadeBatchNumber
                                                  );
                                                  setBatchNumbers(
                                                    atualizarQuantidadeBatchNumber
                                                  );
                                                }}
                                              />
                                            </div>
                                            <div className="flex flex-row gap-1 items-center mt-1">
                                              <span className="font-medium text-gray-900 dark:text-white">
                                                Validade:
                                              </span>
                                              <Popover>
                                                <PopoverTrigger asChild>
                                                  <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                      "w-[180px] justify-start text-left font-normal",
                                                      !dataValidadeItensValidados.find(
                                                        (itemData) =>
                                                          itemData.ItemCode ===
                                                          item.ItemCode
                                                      )?.dataValidade &&
                                                        "text-muted-foreground"
                                                    )}
                                                  >
                                                    {dataValidadeItensValidados.find(
                                                      (itemData) =>
                                                        itemData.ItemCode ===
                                                        item.ItemCode
                                                    )?.dataValidade ? (
                                                      format(
                                                        dataValidadeItensValidados.find(
                                                          (itemData) =>
                                                            itemData.ItemCode ===
                                                            item.ItemCode
                                                        )?.dataValidade!,
                                                        "P",
                                                        { locale: pt }
                                                      )
                                                    ) : (
                                                      <>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        <span>Pick a date</span>
                                                      </>
                                                    )}
                                                  </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                  <Calendar
                                                    fixedWeeks
                                                    locale={pt}
                                                    mode="single"
                                                    selected={
                                                      dataValidadeItensValidados.find(
                                                        (itemData) =>
                                                          itemData.ItemCode ===
                                                          item.ItemCode
                                                      )?.dataValidade
                                                        ? new Date(
                                                            dataValidadeItensValidados.find(
                                                              (itemData) =>
                                                                itemData.ItemCode ===
                                                                item.ItemCode
                                                            )?.dataValidade!
                                                          )
                                                        : new Date()
                                                    }
                                                    onSelect={(event) => {
                                                      const atualizarDataValidade =
                                                        produce(
                                                          dataValidadeItensValidados,
                                                          (draft) => {
                                                            if (
                                                              event?.toISOString()
                                                            ) {
                                                              draft[
                                                                index - 1
                                                              ].dataValidade =
                                                                event.toISOString(); // Only assign if it's defined
                                                            }
                                                          }
                                                        );
                                                      setDataValidadeItensValidados(
                                                        atualizarDataValidade
                                                      );
                                                    }}
                                                    initialFocus
                                                  />
                                                </PopoverContent>
                                              </Popover>
                                            </div>
                                          </dd>
                                          <Button
                                            size={"icon"}
                                            variant={"ghost"}
                                            onClick={() => {
                                              const removerItemValidado =
                                                produce(
                                                  itensValidados,
                                                  (draft) => {
                                                    const listaAtualizada =
                                                      draft.filter(
                                                        (itemValidado) =>
                                                          itemValidado.baseLine !==
                                                          item.baseLine
                                                      );
                                                    //console.log(listaAtualizada);
                                                    return listaAtualizada;
                                                  }
                                                );
                                              setItensValidados(
                                                removerItemValidado
                                              );
                                            }}
                                          >
                                            <Trash2 />
                                          </Button>

                                        </dl>
                                        <Separator className="mt-1" />
                                      </div>
                                    )
                                  );
                                })}
                              </div>
                            </div>
                          </section>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <Button
                          disabled={itensValidados.length === 0}
                          onClick={() => {
                            console.log(itensValidados);
                            const atualizarListaDocumentLines = produce(
                              documentLines,
                              (draft) => {
                                itensValidados.map((itemValidado) => {
                                  if (itemValidado.ItemCode !== "") {
                                    if (
                                      geridoPorLotes.findIndex(
                                        (artigoLote) =>
                                          artigoLote.ItemCode ===
                                          itemValidado.ItemCode
                                      ) === -1
                                    ) {
                                      if (
                                        draft.findIndex(
                                          (draftItem) =>
                                            draftItem.BaseLine ===
                                            itemValidado.baseLine
                                        ) === -1
                                      ) {
                                        draft.push({
                                          BaseEntry: Number(id),
                                          BaseLine: itemValidado.baseLine,
                                          BaseType: 22,
                                          Quantity: itemValidado.quantidade,
                                        });
                                      }
                                      if (
                                        draft.findIndex(
                                          (draftItem) =>
                                            draftItem.BaseLine ===
                                            itemValidado.baseLine
                                        ) !== -1
                                      ) {
                                        const indexItemAtualizar =
                                          draft.findIndex(
                                            (draftItem) =>
                                              draftItem.BaseLine ===
                                              itemValidado.baseLine
                                          );
                                        draft[indexItemAtualizar].BaseEntry =
                                          Number(id);
                                        draft[indexItemAtualizar].BaseLine =
                                          itemValidado.baseLine;
                                        draft[indexItemAtualizar].BaseType = 22;
                                        draft[indexItemAtualizar].Quantity =
                                          itemValidado.quantidade;
                                      }
                                    }
                                  }
                                });
                                //draft.shift();
                              }
                            );
                            console.log(atualizarListaDocumentLines);
                            setDocumentLines(atualizarListaDocumentLines);
                            const atualizarListaDocumentLinesBatchNumber =
                              produce(documentLinesBatchN, (draft) => {
                                itensValidados.map((itemValidado) => {
                                  if (
                                    geridoPorLotes.findIndex(
                                      (artigoLote) =>
                                        artigoLote.ItemCode ===
                                        itemValidado.ItemCode
                                    ) !== -1
                                  ) {
                                    const atualizarBatchNumbers = produce(
                                      batchNumbers,
                                      (draft) =>
                                        draft.forEach((item, index) => {
                                          if (
                                            item.ItemCode ===
                                            itemValidado.ItemCode
                                          ) {
                                            draft[index].BatchNumber =
                                              numeroLote;

                                            draft[index].ItemCode =
                                              itemValidado.ItemCode;

                                            draft[index].Quantity =
                                              itemValidado.quantidade;
                                          }
                                        })
                                    );
                                    console.log(
                                      "atualizar batch numbers",
                                      atualizarBatchNumbers
                                    );
                                    setBatchNumbers(atualizarBatchNumbers);
                                    const batchNumberAdicionar =
                                      batchNumbers.filter(
                                        (btchN) =>
                                          btchN.ItemCode ===
                                          itemValidado.ItemCode
                                      );
                                    //console.log(batchNumbers);
                                    console.log(
                                      "batch number adicionar",
                                      batchNumberAdicionar
                                    );

                                    if (
                                      draft.findIndex(
                                        (docLineBatchNum) =>
                                          docLineBatchNum.BaseLine ===
                                          itemValidado.baseLine
                                      ) === -1
                                    ) {
                                      draft.push({
                                        BaseEntry: Number(id),
                                        BaseLine: itemValidado.baseLine,
                                        BaseType: 22,
                                        Quantity:
                                          batchNumberAdicionar[0].Quantity,
                                        BatchNumbers: batchNumberAdicionar,
                                      });
                                    }

                                    if (
                                      draft.findIndex(
                                        (docLineBatchNum) =>
                                          docLineBatchNum.BaseLine ===
                                          itemValidado.baseLine
                                      ) !== -1
                                    ) {
                                      const itemAtualizar = draft.findIndex(
                                        (docLineBatchNum) =>
                                          docLineBatchNum.BaseLine ===
                                          itemValidado.baseLine
                                      );
                                      draft[itemAtualizar].BaseEntry =
                                        Number(id);
                                      draft[itemAtualizar].BaseLine =
                                        itemValidado.baseLine;
                                      draft[itemAtualizar].BaseType = 22;
                                      draft[itemAtualizar].Quantity =
                                        batchNumberAdicionar[0].Quantity;
                                      draft[itemAtualizar].BatchNumbers =
                                        batchNumberAdicionar;
                                    }
                                  }
                                });
                              });

                            console.log(
                              "atualizar lista documnet lines batch number",
                              atualizarListaDocumentLinesBatchNumber
                            );
                            setDocumentLinesBatchN(
                              atualizarListaDocumentLinesBatchNumber
                            );

                            const atualizarDocumentLinesGlobal = produce(
                              documentLinesGlobal,
                              (draft) => {
                                
                                draft.length = 0;

                                draft.push(...documentLines,...documentLinesBatchN);
                                /*
                                documentLines.forEach((docLine) =>{
                                  
                                  draft.push(docLine)
                                }
                                );
                                documentLinesBatchN.forEach((docLineBatch) =>
                                  draft.push(docLineBatch)
                                );
                                */
                              }
                            );
                            console.log(
                              "atualizar documnet lines global",
                              atualizarDocumentLinesGlobal
                            );
                            setDocumentLinesGlobal(
                              atualizarDocumentLinesGlobal
                            );
                            const atualizarListaEtiquetas = produce(
                              etiquetas,
                              (draft) => {
                                draft.length = 0;
                                itensValidados.forEach((itemValidado, index) => {
                                  console.log(
                                    "itens validados",
                                    itensValidados
                                  );
                                  console.log(
                                    "data validade itens validados",
                                    dataValidadeItensValidados
                                  );
                                  if (itemValidado.ItemCode !== "") {
                                    draft.push(
                                      `^XA${logotipoEgiquimicaZPL}^CF0,60^FO220,50^FDEgiquimica^FS^CF0,30^FO220,115^FDParque Industrial Guarda, Lt.10/15^FS^FO220,155^FDGuarda^FS^FO220,195^FDPortugal (PT)^FS^FO50,245^GB700,3,3^FS^CFD,50^FO50,265^FDOrdem Compra:^FS^CFA,45^FO50,315^FD${
                                        OrdemCompra.data?.DocumentLines.find(
                                          (itemOrdem) =>
                                            itemOrdem.ItemCode ===
                                            itemValidado.ItemCode
                                        )?.DocEntry
                                      }^FS^CFD,50^FO50,400^FDLote:^FS^CFA,45^FO50,450^FD${numeroLote}^FS^CFD,50^FO50,550^FDValidade:^FS^CFA,45^FO50,600^FD${format(
                                        dataValidadeItensValidados[index - 1]
                                          .dataValidade,
                                        "P",
                                        { locale: pt }
                                      )}^FS^CFA,50^FO50,700^FD${datahora.toISOString()}^FS^FO515,255^BQ,,6^FD123F:MateriaPrima&C1:${
                                        itemValidado.ItemCode
                                      }&C2:${
                                        OrdemCompra.data?.DocumentLines.find(
                                          (itemOrdem) =>
                                            itemOrdem.ItemCode ===
                                            itemValidado.ItemCode
                                        )?.ItemDescription
                                      }&C3:${
                                        OrdemCompra.data?.CardCode
                                      }&C4:${numeroLote}&C5:${format(
                                        dataValidadeItensValidados[index - 1]
                                          .dataValidade,
                                        "P",
                                        { locale: pt }
                                      )}&C6:${format(
                                        datahora.toISOString(),
                                        "P",
                                        { locale: pt }
                                      )}&^FS^FO50,775^GB700,100,3^FS^FO50,875^GB700,300,3^FS^CF0,200^FO60,940^FD${
                                        itemValidado.ItemCode
                                      }^FS^CF0,50^FO250,800^FDMateria Prima^FS^XZ^PQ2`
                                    );
                                  }
                                });
                              }
                            );
                            setEtiquetas(atualizarListaEtiquetas);
                            setValidouValores(true);
                            //console.log(etiqueta.current);
                            //console.log(etiquetas);
                          }}
                        >
                          Validar
                        </Button>
                        <Button
                          disabled={
                            !validouValores || itensValidados.length === 1
                          }
                          onClick={() => imprimirEtiqueta(etiquetas.join(""))}
                        >
                          <Printer className="mr-1" /> Etiquetas
                        </Button>
                        <AlertDialogAction
                          disabled={!validouValores}
                          onClick={(e) => {
                            e.preventDefault();

                            lancarRececaoSAPmutation.mutate(
                              JSON.stringify({
                                DocDate: docDate,
                                CardCode: cardCode,
                                DocumentLines: documentLinesGlobal,
                              })
                            );

                            console.log(
                              JSON.stringify({
                                DocDate: docDate,
                                CardCode: cardCode,
                                DocumentLines: documentLinesGlobal,
                              })
                            );
                            setValidouValores(false);
                            const atualizarItensValidados = produce(
                              itensValidados,
                              (draft) => {
                                draft.length = 0;
                              }
                            );
                            setItensValidados(atualizarItensValidados);
                            console.log(
                              "atualizar dados dos itens validados",
                              atualizarItensValidados
                            );
                          }}
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex flex-col py-2">
                <div className="flex rounded-lg border bg-card text-card-foreground shadow-sm min-w-56 min-h-56 justify-center items-center">
                  <div className="flex flex-col items-center">
                    {pickState.success ? (
                      <>
                        <BadgeCheck
                          size={150}
                          strokeWidth={0.75}
                          color="#2EA64C"
                        />
                        <p>Pickagem Realizada!</p>
                      </>
                    ) : pickState.alert ? (
                      <>
                        <BadgeAlert
                          size={150}
                          strokeWidth={0.75}
                          color="#FFCC2D"
                        />
                        <p>Este item já foi pickado!</p>
                      </>
                    ) : pickState.error ? (
                      <>
                        <BadgeX size={150} strokeWidth={0.75} color="#DE2C37" />
                        <p>Este item não existe nesta ordem!</p>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <p>Campos da pickagem:</p>
                <p>{pickagens?.C1}</p>
                <p>{pickagens?.C2}</p>
                <p>{pickagens?.C3}</p>
                {/*<p>{pickagens[pickagens.length - 4]}</p>
                <p>{pickagens[pickagens.length - 3]}</p>
                <p>{pickagens[pickagens.length - 2]}</p>
                <p>{pickagens[pickagens.length - 1]}</p>*/}
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="flex flex-row min-w-full justify-evenly">
        <div className="flex flex-col min-w-fit">
          <p>
            Última Pickagem:
            {pickagens ? JSON.stringify(pickagens) : "Nenhuma"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pickagem;
/*
 */

const logotipoEgiquimicaZPL =
  "^FO50,60^GFA,2016,2016,16,,:T07IF8,S0LFC,R0NFC,Q07OFC,P03QF,P0RFC,O03SF,O0TFC,N03UF,N0VFC,M01LFCI0LFE,M07KF8K07KF8,M0KFCM0KFC,L01JFEN01JFE,L03JFP03JF,L07IFCQ0JF8,K01JFR03IFE,K03IFER01JF,K07IF8S07IF8,K07IFT03IFC,K0IFCU0IFE,J01IF8U07FFE,J03IFJ0E38O03IF,J07FFE0079F7EO01IF8,J0IFC00JFEP0IFC,I01IF800JFEP07FFE,I01IFI0IF7EP03FFE,I03FFEI0F9E3CP01IF,I07FFCI03U0IF,I07FF8I078E3C7P07FF8,I0IFJ0FDF7EF8O03FFC,I0IFJ0LFCO03FFC,001FFEJ0LFCO01FFE,001FFCJ0FDF7EF8P0FFE,003FFCJ078E3C7Q0IF,003FF8L0E1830CO07FF,007FF8J079F7CF9FO03FF8,007FFK0NFO03FF8,00FFEK0NFO01FFC,00FFEK0JFEIFO01FFC,00FFCK0FDF3CF9FP0FFC,01FFCK078418S0FFE,01FFCK078E3CS0FFE,01FF8K0FDF7ES07FE,03FF8K0JFES07FF,:03FFL0FDF7ES03FF,03FFL078E18S03FF,07FFL038E1C30EP03FF807FEL07DFBEFDFP01FF807FEL0NF8O01FF8:07FEL0FDLF8O01FF807FEL07CF3E79FP01FFC0FFEL03060C306Q0FFC0FFCL07CF3E79F3CO0FFC0FFCL0FDFBEFDFFEO0FFC0FFCL0OFEO0FFC:P07DFBEFDF3E,P03861C30E1C,P038F1C78E1C7,P07DFBEFDF3EF8,0FFCL0QFCM0FFC:0FFCL0FDFBEFDFFEFCM0FFC0FFCL07CF3E79F3C78M0FFC0FFCL01X0FFC0FFEL03071ET0FFC07FEL07CFBFS01FFC07FEL0FDIFS01FF8:07FEL0FDFBFS01FF807FEL07CF1ES01FF807FFL03W03FF803FFL078F1E78E3CF8L03FF,03FFL0FDFBEFDF7EF8L03FF,03FF8K0QFCL07FF,:01FF8K07DFBEFDFFEF8L07FE,01FFCK038F1C78F3C7M0FFE,01FFCK03861C38E1C71EK0FFE,00FFCK07DFBE7DF3EFBFK0FFC,00FFEK0SFJ01FFC,:007FFK0FDJFDFFEFBFJ03FF8,007FFK07CF3E79F3E79EJ03FF8,003FF8J01060C3061870C1I07FF,003FFCJ038F3E78F3CF9F7C00IF,001FFCJ07DFBFFDLF7E00FFE,001FFEJ0TFE01FFE,I0IFJ0SF7E03FFC,I0IFJ07DFBEFDF3EF9F7C03FFC,I07FF8I07CF1C78E1C70C1807FF8,I03FFCY0IF8,I03FFEX01IF,I01IFX03FFE,J0IF8W07FFE,J0IFCW0IFC,J07FFEV01IF8,J03IFV03IF,J01IF8U07FFE,J01IFCU0IFC,K0JFT03IFC,K07IF8S07IF8,K03IFER01JF,K01JFR03IFE,L0JFCQ0JF8,L03JFP03JF,L01JFEN01JFE,M0KF8M07JFC,M07KF8K07KF8,M01LFE001LFE,N0VFC,N03UF,O0TFC,O03SF,P0RFE,P03QF,Q07OF8,Q01NFC,R01LFE,T07IF8,,^FS";
