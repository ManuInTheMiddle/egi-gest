"use client";
import React from "react";
import QrcodeComponent from "@/components/ui/qrcodeComponent";
import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";
import { ordensProd } from "../../../../../public/assets/mockData/ordensFabrico";
import { ArrowLeftCircle, ArrowRightCircle, Printer } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useFetchOrdensEnchimentoSAPData } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranferenciaInvSAP } from "@/Services/Inventario/criacaoTransferenciaInv";

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

function isJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

const ListaOrdensProducao = () => {
  const transferirInventario = useTranferenciaInvSAP();
  const ordensEnchimentoSAP = useFetchOrdensEnchimentoSAPData("boposReleased");
  const [validouValores, setValidouValores] = useState(false);
  const [pickagemOrdemProducao, setPickagemOrdemProducao] = useState(0);
  const [abrirModalPickagem, setAbrirModalPickagem] = useState(false);
  const [quantidadeMP, setQuantidadeMP] = useState(0);
  /////////////////////////////////////////////////////////////////////////////
  const [numeroPagina, setNumeroPagina] = useState(0);
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
    onMessage(event) {

      if (isJSON(event.data)) {

        console.log("mensagem recebida", event.data);
        const dataPARSEADA = JSON.parse(event.data);

        if(dataPARSEADA.type === "qr_data" && dataPARSEADA.payload?.parsed){
          
          const qrData = dataPARSEADA.payload.parsed;
          console.log("qr data", qrData);
          
          const atualizarPickagemOrdemEscolhida = produce(
            pickagemOrdemProducao,
            (draft) => {
              const numeroParseado = Number(qrData.C2);
              draft = numeroParseado;
              console.log(numeroParseado);
              return draft;
            }
          );
          setPickagemOrdemProducao(atualizarPickagemOrdemEscolhida);
          //console.log(pickagemOrdemProducao);
          
          if (
            ordensEnchimentoSAP.data?.value.find(
              (ordemProd) =>
                ordemProd.AbsoluteEntry === Number(qrData.C2)
            ) !== undefined
          ) {
            setAbrirModalPickagem(true);
          }
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

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen px-4 2xl:px-0">
        {ordensEnchimentoSAP.isFetching || ordensEnchimentoSAP.isRefetching ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Skeleton className="h-[500px] w-[300px]" />
            <Skeleton className="h-[500px] w-[300px]" />
            <Skeleton className="h-[500px] w-[300px]" />
            <Skeleton className="h-[500px] w-[300px]" />
          </div>
        ) : (
          <div className="mx-auto">
            {
              <ul
                role="list"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              >
                {ordensEnchimentoSAP.data?.value.map((ordemProd, index) => (
                  <li
                    key={index}
                    className="col-span-1 flex flex-col divide-y max-w-[350px] divide-gray-200 rounded-lg bg-white text-center shadow-2xl"
                  >
                    <div className="flex flex-1 flex-col p-8 mx-auto">
                      <div className="mx-auto h-32 w-32 flex-shrink-0 rounded-full">
                        <QrcodeComponent
                          information={`F:produtoacabado&C1:absentry&C2:${ordemProd.AbsoluteEntry}&C3:&C4:&C5:&C6:&`}
                        />
                      </div>
                      <h3 className="mt-6 text-sm font-medium text-gray-500">
                        #{ordemProd.AbsoluteEntry}
                      </h3>
                      <dl className="mt-1 flex flex-grow flex-col justify-between">
                        <dt className="sr-only">Descriçao</dt>
                        <dd className="text-base font-semibold text-black">{`${ordemProd.ProductDescription}(${ordemProd.ItemNo})`}</dd>
                        <dt className="sr-only">Data</dt>
                        <dd className="text-sm text-gray-500 mt-2">
                          {format(ordemProd.CreationDate, "PP", { locale: pt })}
                        </dd>
                        <dt className="sr-only">Estado</dt>
                        <dd className="mt-3">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {ordemProd.ProductionOrderStatus ===
                              "boposReleased" && (
                              <span className="text-green-800">
                                Autorizada a Sair
                              </span>
                            )}
                            {ordemProd.ProductionOrderStatus ===
                              "boposClosed" && (
                              <span className="text-green-300">Concluída</span>
                            )}
                            {ordemProd.ProductionOrderStatus ===
                              "boposCancelled" && (
                              <span className="text-red-800">Cancelada</span>
                            )}
                            {ordemProd.ProductionOrderStatus ===
                              "boposPlanned" && (
                              <span className="text-yellow-800">Planeada</span>
                            )}
                          </span>
                        </dd>
                      </dl>
                    </div>
                    <div>
                      <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                          <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                            Qtd Planeada:
                            {` ${ordemProd.PlannedQuantity}`}
                          </div>
                        </div>
                        <div className="-ml-px flex w-0 flex-1">
                          <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                            Concluída:
                            {` ${ordemProd.CompletedQuantity}`}
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
              <AlertDialogContent className="max-w-[800px]">
                <AlertDialogHeader>
                  <AlertDialogTitle></AlertDialogTitle>
                  <AlertDialogDescription>
                    <section className="bg-white py-2 antialiased dark:bg-gray-900 md:py-12">
                      <div className="mx-auto max-w-2xl px-4 2xl:px-0">
                        <p className="text-base text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
                          Confirmar quantidade produzida na ordem de produção
                          <a className="font-medium text-gray-900 dark:text-white">
                            {` #${pickagemOrdemProducao} `}
                          </a>
                          para o produto
                          <a className="font-medium text-gray-900 dark:text-white">
                            {` ${
                              ordensEnchimentoSAP.data?.value.find(
                                (ordemProdVal) =>
                                  ordemProdVal.AbsoluteEntry ===
                                  pickagemOrdemProducao
                              )?.ProductDescription
                            }(${
                              ordensEnchimentoSAP.data?.value.find(
                                (ordemProdVal) =>
                                  ordemProdVal.AbsoluteEntry ===
                                  pickagemOrdemProducao
                              )?.ItemNo
                            })`}
                          </a>
                        </p>

                        <div className="space-y-3 max-h-[339px] overflow-y-auto sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
                          {ordensEnchimentoSAP.data?.value
                            .find(
                              (ordemProducao) =>
                                ordemProducao.AbsoluteEntry ===
                                pickagemOrdemProducao
                            )
                            ?.ProductionOrderLines.map((linhaProducao, index) =>
                              linhaProducao.ProductionOrderIssueType ===
                              "im_Manual" ? (
                                <>
                                  <dl
                                    key={index}
                                    className="sm:flex items-center justify-between gap-4"
                                  >
                                    <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">
                                      {`${linhaProducao.ItemName}(${linhaProducao.ItemNo})`}
                                    </dt>
                                    <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                                      <div className="flex flex-row gap-1 items-center">
                                        <div className="flex flex-col">
                                          <span className="flex flex-col font-medium text-gray-900 dark:text-white">
                                            Quantidade:
                                          </span>
                                          {quantidadeMP >
                                          linhaProducao.PlannedQuantity ? (
                                            <dt className="font-light text-xs mb-1 sm:mb-0 text-red-500">
                                              {`(${quantidadeMP}) L/Kg`}
                                            </dt>
                                          ) : (
                                            <dt className="font-light text-xs mb-1 sm:mb-0 text-green-500">
                                              {`(${quantidadeMP}) L/Kg`}
                                            </dt>
                                          )}
                                        </div>
                                        <Input
                                          className="w-[120px]"
                                          placeholder="Embalagens"
                                          onChange={(e) => {
                                            const quantidadeMPAux =
                                              Number(e.target.value) *
                                              linhaProducao.BaseQuantity;
                                            setQuantidadeMP(
                                              Number(quantidadeMPAux.toFixed(2))
                                            );
                                          }}
                                        />
                                      </div>
                                    </dd>
                                  </dl>
                                  <Separator className="mt-1" />
                                </>
                              ) : null
                            )}
                        </div>
                      </div>
                    </section>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Button onClick={() => setValidouValores(true)}>
                    Validar
                  </Button>
                  <Button
                    disabled={!validouValores}
                    onClick={() =>
                      imprimirEtiqueta(
                        `^XA${logotipoEgiquimicaZPL}^FS^CF0,60^FO220,50^FDEgiquimica^FS^CF0,30^FO220,115^FDParque Industrial Guarda,Lt.10/15^FS^FO220,155^FDGuarda^FS^FO220,195^FDPortugal(PT)^FS^FO50,245^GB700,3,3^FS^CFD,50^FO50,265^FDOrdem Produc:^FS^CFA,45^FO50,315^FD${
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )?.AbsoluteEntry
                        }^FS^CFD,50^FO50,400^FDLote:^FS^CFA,45^FO50,450^FD${
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )?.ItemNo
                        }^FS^CFD,50^FO50,550^FDDescricao:^FS^CFA,45^FO50,600^FD${ordensEnchimentoSAP.data?.value
                          .find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )
                          ?.ProductDescription.substring(
                            0,
                            21
                          )}...^FS^CFA,50^FO50,700^FD${new Date().toISOString()}^FS^FO515,255^BQ,,6^FD123F:PA&C1:${
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )?.ItemNo
                        }&C2:${ordensEnchimentoSAP.data?.value
                          .find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )
                          ?.ProductDescription.substring(0, 21)}...
                        &C3:lote&C4:${new Date().toISOString()}&C5:${
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )?.AbsoluteEntry
                        }&C6:&^FS^FO50,775^GB700,100,3^FS^FO50,875^GB700,300,3^FS^CF0,200^FO60,920^FD${
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )?.ItemNo
                        }^FS^CF0,50^FO250,800^FDPrd Acabado^FS^XZ`
                      )
                    }
                  >
                    <Printer className="mr-1" /> Etiquetas
                  </Button>
                  <AlertDialogAction
                    disabled={!validouValores}
                    onClick={() => {
                      setValidouValores(false);
                      //setQuantidadeMP(0);
                      console.log(
                        "corpo da transferencia",
                        JSON.stringify({
                          FromWarehouse: "A2",
                          ToWarehouse: "A3",
                          StockTransferLines: [
                            {
                              LineNum: 0,
                              ItemCode:
                                ordensEnchimentoSAP.data &&
                                ordensEnchimentoSAP.data?.value
                                  .find(
                                    (ordemProducao: any) =>
                                      ordemProducao.AbsoluteEntry ===
                                      pickagemOrdemProducao
                                  )
                                  ?.ProductionOrderLines.find(
                                    (linhaProducao: any) =>
                                      linhaProducao.ProductionOrderIssueType ===
                                      "im_Manual"
                                  )?.ItemNo,
                              Quantity: quantidadeMP,
                              WarehouseCode: "A3",
                              FromWarehouseCode: "A2",
                              BatchNumbers: [
                                {
                                  BatchNumber:
                                    ordensEnchimentoSAP.data &&
                                    ordensEnchimentoSAP.data?.value
                                      .find(
                                        (ordemProducao: any) =>
                                          ordemProducao.AbsoluteEntry ===
                                          pickagemOrdemProducao
                                      )
                                      ?.ProductionOrderLines.find(
                                        (linhaProducao: any) =>
                                          linhaProducao.ProductionOrderIssueType ===
                                          "im_Manual"
                                      )?.BatchNumbers[0]?.BatchNumber,
                                  Quantity: quantidadeMP,
                                  ItemCode:
                                    ordensEnchimentoSAP.data &&
                                    ordensEnchimentoSAP.data?.value
                                      .find(
                                        (ordemProducao: any) =>
                                          ordemProducao.AbsoluteEntry ===
                                          pickagemOrdemProducao
                                      )
                                      ?.ProductionOrderLines.find(
                                        (linhaProducao: any) =>
                                          linhaProducao.ProductionOrderIssueType ===
                                          "im_Manual"
                                      )?.ItemNo,
                                },
                              ],
                            },
                          ],
                        })
                      );
                      transferirInventario.mutate(
                        JSON.stringify({
                          FromWarehouse: "A2",
                          ToWarehouse: "A3",
                          StockTransferLines: [
                            {
                              LineNum: 0,
                              ItemCode:
                                ordensEnchimentoSAP.data &&
                                ordensEnchimentoSAP.data?.value
                                  .find(
                                    (ordemProducao: any) =>
                                      ordemProducao.AbsoluteEntry ===
                                      pickagemOrdemProducao
                                  )
                                  ?.ProductionOrderLines.find(
                                    (linhaProducao: any) =>
                                      linhaProducao.ProductionOrderIssueType ===
                                      "im_Manual"
                                  )?.ItemNo,
                              Quantity: quantidadeMP,
                              WarehouseCode: "A3",
                              FromWarehouseCode: "A2",
                              BatchNumbers: [
                                {
                                  BatchNumber:
                                    ordensEnchimentoSAP.data &&
                                    ordensEnchimentoSAP.data?.value
                                      .find(
                                        (ordemProducao: any) =>
                                          ordemProducao.AbsoluteEntry ===
                                          pickagemOrdemProducao
                                      )
                                      ?.ProductionOrderLines.find(
                                        (linhaProducao: any) =>
                                          linhaProducao.ProductionOrderIssueType ===
                                          "im_Manual"
                                      )?.BatchNumbers[0]?.BatchNumber,
                                  Quantity: quantidadeMP,
                                  ItemCode:
                                    ordensEnchimentoSAP.data &&
                                    ordensEnchimentoSAP.data?.value
                                      .find(
                                        (ordemProducao: any) =>
                                          ordemProducao.AbsoluteEntry ===
                                          pickagemOrdemProducao
                                      )
                                      ?.ProductionOrderLines.find(
                                        (linhaProducao: any) =>
                                          linhaProducao.ProductionOrderIssueType ===
                                          "im_Manual"
                                      )?.ItemNo,
                                },
                              ],
                            },
                          ],
                        })
                      );
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
                    disabled={numeroPagina<=0}
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
                    disabled={ordensEnchimentoSAP.data?.value === undefined || ordensEnchimentoSAP.data?.value.length === 0}
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

export default ListaOrdensProducao;
