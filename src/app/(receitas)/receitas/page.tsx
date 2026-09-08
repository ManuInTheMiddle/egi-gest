"use client";
import React, { useEffect } from "react";
import { Rings, Oval } from "react-loader-spinner";
import { useFetchArtigosProdutoIntermedio } from "@/Services/Receitas/fetchRecipeMateriaPrima";
import { useFetchArtigoProdutoIntermedioUnico } from "@/Services/Receitas/fetchRecipeMateriaPrima";
import { RefreshCw } from "lucide-react"; // Add RefreshCw icon
import {
  Info,
  PlusCircle,
  MinusCircle,
  Search,
  CornerRightDown,
  ClipboardCheck,
  ClipboardX,
  AlertTriangle,
  Eye,
  Trash2,
  EraserIcon,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { produce } from "immer";
import { Reorder } from "framer-motion";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Retorceder from "./componentes/retorceder";
import { useFetchRecipeInformationData } from "@/Services/Receitas/fetchRecipeInformation";
import { useFetchRecipeMateriaPrimaData } from "@/Services/Receitas/fetchRecipeMateriaPrima";
import { useCriarReceitaSCADA } from "@/Services/ReceitasSCADA/criarReceitaSCADA";
import { useFetchReceitasSCADA } from "@/Services/ReceitasSCADA/fetchUmaReceitaSCADA";
import { useApagarReceitaSCADA } from "@/Services/ReceitasSCADA/apagarReceitaSCADA";
import { toast } from "sonner";
import { format } from "date-fns";
//import { artigosSap as artigos } from "@/lib/artigosSAPreceitas";
interface materiaPrima {
  artigo: string;
  descricao: string;
}

interface ArtigoItem {
  "odata.etag": string;
  ItemCode: string;
  ItemName: string;
}

interface ApiResponseArtigos {
  "odata.metadata": string;
  value: ArtigoItem[];
  "odata.nextLink"?: string;
}
interface PassosReceitas {
  NumeroPasso: number;
  Receita: string;
  PhMin: number;
  PhMax: number;
  Densidade: number;
  Fase: number;
  MateriaPrima: string;
  Parametro1: number;
  Parametro2: number;
}

const Page = () => {
  const [artigo, setArtigo] = useState("");
  const [realizouFetchArtigo, setRealizouFetchArtigo] = useState(false);
  const [verificouExistenciaReceita, setVerificouExistenciaReceita] =
    useState(false);
  const [receitaExisteNoSistema, setReceitaExisteNoSistema] = useState(false);
  const [abrirModalCriacaoReceita, setAbrirModalCriacaoReceita] =
    useState(false);

  const [artigosData, setArtigosData] = useState<ArtigoItem[]>([]);
  const [artigosSkip, setArtigosSkip] = useState(0);
  const [loadingMoreArtigos, setLoadingMoreArtigos] = useState(false);
  const [hasMoreArtigos, setHasMoreArtigos] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Add these with your existing state variables
  const [searchingIndividualItem, setSearchingIndividualItem] = useState(false);
  const [searchItemCode, setSearchItemCode] = useState("");
  const [addedCustomItems, setAddedCustomItems] = useState<string[]>([]);
  //variavel do drag and drop
  const [podeEditar, setPodeEditar] = useState(true);

  const CriarReceitasScada = useCriarReceitaSCADA();
  const ReceitasSCADA = useFetchReceitasSCADA(artigo);
  const artigosProdutoIntermedio = useFetchArtigosProdutoIntermedio({
    skip: artigosSkip,
    itemGroupCode: 112, // Produtos intermedios
  });
  const ApagarReceitaScada = useApagarReceitaSCADA();
  // Add this with your other hooks
  const artigoProdutoIntermedioUnico = useFetchArtigoProdutoIntermedioUnico({
    itemCode: searchItemCode,
  });

  //////////////////////////////////////////////////
  //////////Limpar receita aquando a confirmaçao da receita ou criacao///////////
  const handleLimparItemsListReceita = () => {
    const resetarlista = produce(itemsList, (draft) => {
      while (draft.length > 0) {
        draft.pop();
      }
      draft.push({
        id: 0,
        etapa: "",
        fase: "",
        param1: "",
        param2: "",
      });
    });
    setItemsList(resetarlista);
  };

  const handleLimparPassosReceita = () => {
    setPasssosReceita([]);
  };
  const handleSearchItem = async (itemCode: string) => {
    if (!itemCode.trim()) return;

    const itemExists = artigosData.find(
      (item) => item.ItemCode.toLowerCase() === itemCode.toLowerCase()
    );

    if (itemExists) {
      toast.info(`Artigo ${itemCode} já está na lista`);
      return;
    }

    if (addedCustomItems.includes(itemCode.toLowerCase())) {
      toast.info(`Artigo ${itemCode} já foi adicionado`);
      return;
    }

    try {
      setSearchingIndividualItem(true);
      setSearchItemCode(itemCode);
    } catch (error) {
      console.error("Error searching for item:", error);
      toast.error("Erro ao procurar artigo");
      setSearchingIndividualItem(false);
    }
  };

  const isValidItemCode = (code: string) => {
    return code.length >= 2 && /^[a-zA-Z0-9\/]+$/.test(code);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isValidItemCode(searchTerm)) {
        handleSearchItem(searchTerm);
      }
    }
  };
  //////////////////////////////////////////////////
  // Function to load initial artigos data
  const loadArtigosData = async () => {
    setArtigosSkip(0);
    setArtigosData([]);
    await artigosProdutoIntermedio.refetch();
  };

  // Function to load more artigos (for pagination)
  const loadMoreArtigos = async () => {
    if (!loadingMoreArtigos && hasMoreArtigos) {
      try {
        setLoadingMoreArtigos(true);
        setArtigosSkip((prev) => prev + 20);
        await artigosProdutoIntermedio.refetch();
      } catch (error) {
        console.error("Error loading more artigos:", error);
        toast.error("Erro ao carregar mais artigos");
        setLoadingMoreArtigos(false); // Reset loading state on error
      }
    }
  };

  // Filter artigos based on search term
  const filteredArtigos = artigosData.filter(
    (artigo) =>
      artigo.ItemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artigo.ItemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [parametrosMatriz, setParametrosMatriz] = useState({
    U_Aci: "-",
    U_Aci_Max: "-",
    U_Aci_Min: "-",
    U_Alc_Hidro: "-",
    U_Alc_Max: "-",
    U_Alc_Min: "-",
    U_Amo_Max: "-",
    U_Amo_Min: "-",
    U_AnSab_Max: "-",
    U_AnSab_Min: "-",
    U_AnSab_PM: "-",
    U_Anio_Max: "-",
    U_Anio_Min: "-",
    U_Anio_PM: "-",
    U_Cat_Max: "-",
    U_Cat_Min: "-",
    U_Cat_PM: "-",
    U_Clo_Max: "-",
    U_Clo_Min: "-",
    U_Den_Max: "-",
    U_Den_Min: "-",
    U_Pero_Max: "-",
    U_Pero_Min: "-",
    U_Ph_Max: "-",
    U_Ph_Min: "-",
    U_Res_Max: "-",
    U_Res_Min: "-",
    U_TuCo_Max: "-",
    U_TuCo_Min: "-",
    U_Visc_Max: "-",
    U_Visc_Min: "-",
    U_Visc_Rot: "-",
    U_Visc_Spi: "-",
  });
  const [materiasPrimas, setMateriasPrimas] = useState([] as materiaPrima[]);
  const materiasPrimasReceita = useFetchRecipeMateriaPrimaData(artigo);
  const receita = useFetchRecipeInformationData(artigo);

  useEffect(() => {
    if (artigoProdutoIntermedioUnico.data && searchingIndividualItem) {
      const newItem = {
        "odata.etag": artigoProdutoIntermedioUnico.data["odata.etag"],
        ItemCode: artigoProdutoIntermedioUnico.data.ItemCode,
        ItemName: artigoProdutoIntermedioUnico.data.ItemName,
      };

      setArtigosData((prev) => [newItem, ...prev]);
      setAddedCustomItems((prev) => [...prev, newItem.ItemCode.toLowerCase()]);

      toast.success(`Artigo ${newItem.ItemCode} adicionado à lista`);
      setSearchTerm("");
      setSearchingIndividualItem(false);
      setSearchItemCode("");
    }

    if (artigoProdutoIntermedioUnico.isError && searchingIndividualItem) {
      toast.error(`Artigo "${searchItemCode}" não encontrado`);
      setSearchingIndividualItem(false);
      setSearchItemCode("");
    }
  }, [
    artigoProdutoIntermedioUnico.data,
    artigoProdutoIntermedioUnico.isError,
    searchingIndividualItem,
    searchItemCode,
  ]);
  // Handle artigos data loading
  useEffect(() => {
    if (artigosProdutoIntermedio.data) {
      const newArtigos = artigosProdutoIntermedio.data.value;

      if (artigosSkip === 0) {
        setArtigosData(newArtigos);
      } else {
        setArtigosData((prev) => [...prev, ...newArtigos]);
      }

      setHasMoreArtigos(!!artigosProdutoIntermedio.data["odata.nextLink"]);
    }

    // Always reset loading state when data changes or on error
    if (artigosProdutoIntermedio.data || artigosProdutoIntermedio.isError) {
      setLoadingMoreArtigos(false);
    }
  }, [
    artigosProdutoIntermedio.data,
    artigosProdutoIntermedio.isError,
    artigosSkip,
  ]);

  // Load artigos on component mount
  useEffect(() => {
    loadArtigosData();
  }, []);
  useEffect(() => {
    console.log(receita.isFetched);
    console.log("vai comecar a atualizar");
    if (receita.isFetched) {
      const atualizarParametros = produce(parametrosMatriz, (draft) => {
        draft.U_Aci = receita.data?.U_Aci!;
        draft.U_Aci_Max = receita.data?.U_Aci_Max!;
        draft.U_Aci_Min = receita.data?.U_Aci_Min!;
        draft.U_Alc_Hidro = receita.data?.U_Alc_Hidro!;
        draft.U_Alc_Max = receita.data?.U_Alc_Max!;
        draft.U_Alc_Min = receita.data?.U_Alc_Min!;
        draft.U_Amo_Max = receita.data?.U_Amo_Max!;
        draft.U_Amo_Min = receita.data?.U_Amo_Min!;
        draft.U_AnSab_Max = receita.data?.U_AnSab_Max!;
        draft.U_AnSab_Min = receita.data?.U_AnSab_Min!;
        draft.U_AnSab_PM = receita.data?.U_AnSab_PM!;
        draft.U_Anio_Max = receita.data?.U_Anio_Max!;
        draft.U_Anio_Min = receita.data?.U_Anio_Min!;
        draft.U_Anio_PM = receita.data?.U_Anio_PM!;
        draft.U_Cat_Max = receita.data?.U_Cat_Max!;
        draft.U_Cat_Min = receita.data?.U_Cat_Min!;
        draft.U_Cat_PM = receita.data?.U_Cat_PM!;
        draft.U_Clo_Max = receita.data?.U_Clo_Max!;
        draft.U_Clo_Min = receita.data?.U_Clo_Min!;
        draft.U_Den_Max = receita.data?.U_Den_Max!;
        draft.U_Den_Min = receita.data?.U_Den_Min!;
        draft.U_Pero_Max = receita.data?.U_Pero_Max!;
        draft.U_Pero_Min = receita.data?.U_Pero_Min!;
        draft.U_Ph_Max = receita.data?.U_Ph_Max!;
        draft.U_Ph_Min = receita.data?.U_Ph_Min!;
        draft.U_Res_Max = receita.data?.U_Res_Max!;
        draft.U_Res_Min = receita.data?.U_Res_Min!;
        draft.U_TuCo_Max = receita.data?.U_TuCo_Max!;
        draft.U_TuCo_Min = receita.data?.U_TuCo_Min!;
        draft.U_Visc_Max = receita.data?.U_Visc_Max!;
        draft.U_Visc_Min = receita.data?.U_TuCo_Min!;
        draft.U_Visc_Rot = receita.data?.U_Visc_Rot!;
        draft.U_Visc_Spi = receita.data?.U_Visc_Spi!;
      });
      console.log(atualizarParametros);
      setParametrosMatriz(atualizarParametros);
    }

    //console.log("BOM",materiasPrimasReceita.data);

    ReceitasSCADA.data !== null
      ? setReceitaExisteNoSistema(true)
      : setReceitaExisteNoSistema(false);
  }, [receita, verificouExistenciaReceita]);

  useEffect(() => {
    if (CriarReceitasScada.isSuccess) {
      toast.success("Receita criada com sucesso");
    }

    if (CriarReceitasScada.isError) {
      toast.error("Erro ao criar receita");
    }
  }, [CriarReceitasScada.isSuccess, CriarReceitasScada.isError]);

  useEffect(() => {
    if (ApagarReceitaScada.isSuccess) {
      toast.success("Receita apagada com sucesso");
    }

    if (ApagarReceitaScada.isError) {
      toast.error("Erro ao apagar receita");
    }
  }, [ApagarReceitaScada.isSuccess, ApagarReceitaScada.isError]);

  const [itemsList, setItemsList] = useState([
    {
      id: 0,
      etapa: "",
      fase: "",
      param1: "",
      param2: "",
    },
  ]);

  const [passosReceita, setPasssosReceita] = useState([] as PassosReceitas[]);

  return (
    <div className="flex flex-col">
      <section className="border-2 border-slate-600 rounded-md p-5 shadow-2xl items-center h-full min-h-screen justify-start m-1 max-w-full">
        <Retorceder />
        <div className="flex flex-row gap-x-1">
          <div className="border-2 border-lime-500 rounded-md p-5 shadow-2xl items-center min-h-screen justify-start max-w-full mx-auto w-1/4">
            <div>
              <div className="mt-2">
                <h3 className="text-base font-semibold leading-7 text-gray-900">
                  Nº do Artigo
                </h3>
              </div>
              <div className="mt-2">
                <Select
                  onValueChange={(e) => {
                    setArtigo(e);
                    console.log("select do N artigo das receitas", e);
                    handleLimparItemsListReceita();
                    handleLimparPassosReceita();
                    setVerificouExistenciaReceita(false);
                    setRealizouFetchArtigo(false);
                  }}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Selecione o Nº artigo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Artigos</SelectLabel>
                      {/* Loading overlay when fetching more data */}
                      {(loadingMoreArtigos ||
                        artigosProdutoIntermedio.isFetching) &&
                        artigosSkip > 0 && (
                          <div className="px-2 py-2 bg-gray-50 border-t border-b">
                            <div className="flex items-center justify-center space-x-2">
                              <Oval
                                visible={true}
                                height="16"
                                width="16"
                                color="#84cc27"
                                ariaLabel="oval-loading"
                              />
                              <span className="text-sm text-gray-600">
                                Carregando novos artigos...
                              </span>
                            </div>
                          </div>
                        )}
                      {/* Enhanced search input */}
                      <div className="px-2 py-1">
                        <div className="relative">
                          <Input
                            placeholder="Procurar artigo... (Enter para adicionar)"
                            value={searchTerm}
                            onChange={(e) =>
                              handleSearchInputChange(e.target.value)
                            }
                            onKeyPress={handleSearchKeyPress}
                            className="h-8 pr-16"
                            disabled={searchingIndividualItem}
                          />

                          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                            {searchingIndividualItem ? (
                              <Oval
                                visible={true}
                                height="16"
                                width="16"
                                color="#84cc27"
                                ariaLabel="searching-loading"
                              />
                            ) : (
                              isValidItemCode(searchTerm) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSearchItem(searchTerm)}
                                  className="h-6 w-6 p-0"
                                  title="Adicionar artigo à lista"
                                >
                                  <PlusCircle size={14} />
                                </Button>
                              )
                            )}
                          </div>
                        </div>

                        {searchTerm &&
                          isValidItemCode(searchTerm) &&
                          !searchingIndividualItem && (
                            <div className="text-xs text-gray-500 mt-1">
                              {`Pressione Enter ou clique + para adicionar "
                              ${searchTerm}" à lista`}
                            </div>
                          )}
                      </div>

                      {/* Loading state */}
                      {artigosProdutoIntermedio.isLoading &&
                        artigosSkip === 0 && (
                          <div className="flex items-center justify-center py-4">
                            <Oval
                              visible={true}
                              height="20"
                              width="20"
                              color="#84cc27"
                              ariaLabel="oval-loading"
                            />
                            <span className="ml-2 text-sm">
                              Carregando artigos...
                            </span>
                          </div>
                        )}

                      {/* Error state */}
                      {artigosProdutoIntermedio.isError && (
                        <div className="px-2 py-4 text-center">
                          <p className="text-red-500 text-sm">
                            Erro ao carregar artigos
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={loadArtigosData}
                            className="mt-2"
                          >
                            Tentar novamente
                          </Button>
                        </div>
                      )}

                      {/* ✅ FIXED: Using filteredArtigos instead of artigos */}
                      {filteredArtigos.map((artigo, index) => (
                        <SelectItem
                          key={`${artigo.ItemCode}-${index}`}
                          value={artigo.ItemCode}
                          className={
                            addedCustomItems.includes(
                              artigo.ItemCode.toLowerCase()
                            )
                              ? "bg-green-50 border-l-2 border-green-500"
                              : ""
                          }
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{`(${artigo.ItemCode}) ${artigo.ItemName}`}</span>
                            {addedCustomItems.includes(
                              artigo.ItemCode.toLowerCase()
                            ) && (
                              <span className="text-green-600 text-xs ml-2">
                                ●
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}

                      {hasMoreArtigos &&
                        !artigosProdutoIntermedio.isLoading && (
                          <div className="px-2 py-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={loadMoreArtigos}
                              disabled={
                                loadingMoreArtigos ||
                                artigosProdutoIntermedio.isFetching
                              }
                              className="w-full"
                            >
                              {loadingMoreArtigos ||
                              artigosProdutoIntermedio.isFetching ? (
                                <>
                                  <Oval
                                    visible={true}
                                    height="16"
                                    width="16"
                                    color="#84cc27"
                                    ariaLabel="oval-loading"
                                  />
                                  <span className="ml-2">Carregando...</span>
                                </>
                              ) : (
                                `Carregar mais artigos ${
                                  artigosData.length > 0
                                    ? `(${artigosData.length} carregados)`
                                    : ""
                                }`
                              )}
                            </Button>
                            {/* NEW: Additional loading indicator below the button */}
                            {(loadingMoreArtigos ||
                              artigosProdutoIntermedio.isFetching) && (
                              <div className="flex items-center justify-center mt-2">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Rings
                                    visible={true}
                                    height="20"
                                    width="20"
                                    color="#84cc27"
                                    ariaLabel="rings-loading"
                                  />
                                  <span>Buscando mais artigos...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      {/* No results message */}
                      {filteredArtigos.length === 0 &&
                        !artigosProdutoIntermedio.isLoading &&
                        searchTerm && (
                          <div className="px-2 py-4 text-center">
                            <p className="text-gray-500 text-sm">
                              {`Nenhum artigo encontrado para "${searchTerm}"`}
                            </p>
                          </div>
                        )}
                      {/* Enhanced error state for pagination */}
                      {artigosProdutoIntermedio.isError && artigosSkip > 0 && (
                        <div className="px-2 py-4 text-center bg-red-50 border-t">
                          <p className="text-red-500 text-sm mb-2">
                            Erro ao carregar mais artigos
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLoadingMoreArtigos(false);
                              loadMoreArtigos();
                            }}
                            className="text-red-600 border-red-200"
                          >
                            Tentar novamente
                          </Button>
                        </div>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  <Button
                    disabled={artigo === ""}
                    size={"icon"}
                    variant={"default"}
                    onClick={() => {
                      receita.refetch();
                      materiasPrimasReceita.refetch();
                      setRealizouFetchArtigo(true);
                    }}
                  >
                    {receita.isRefetching || receita.isFetching ? (
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setArtigosData((prev) =>
                              prev.filter(
                                (item) =>
                                  !addedCustomItems.includes(
                                    item.ItemCode.toLowerCase()
                                  )
                              )
                            );
                            setAddedCustomItems([]);
                            toast.success("Artigos personalizados removidos");
                          }}
                          disabled={addedCustomItems.length === 0}
                          className="h-8"
                        >
                          <MinusCircle size={14} />
                          <span className="ml-1 text-xs">
                            Limpar adicionados
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remover artigos adicionados manualmente</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Separator className="my-4" />
                <div>
                  <div className="flex flex-row gap-2 items-center">
                    <h3 className="text-base font-semibold leading-7 text-gray-900">
                      Propriedades do Artigo
                    </h3>
                    <TooltipProvider>
                      <Sheet>
                        <SheetContent className="w-[850px]">
                          <SheetHeader>
                            <SheetTitle>
                              Outras Especificações do Artigo
                            </SheetTitle>
                            <SheetDescription>
                              Outras especificações pertencentes á matriz de
                              especificações do artigo em questão
                            </SheetDescription>
                            <Separator className="mt-1" />
                          </SheetHeader>
                          <div className="grid grid-cols-2 overflow-auto mx-auto h-screen py-5">
                            <div className="px-2 mx-2 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Viscosidade (20ºC)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                                {parametrosMatriz.U_Visc_Spi}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                Viscosidade Rotação
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                                {parametrosMatriz.U_Visc_Rot}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Viscosidade Mínima (cP)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-red-700 sm:mt-0">
                                {parametrosMatriz.U_Visc_Min}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Viscosidade Máxima (cP) "}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-green-700 sm:mt-0">
                                {parametrosMatriz.U_Visc_Max}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Matéria Activa aniónica PM (g/mol)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                                {parametrosMatriz.U_Anio_PM}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Matéria Activa aniónica Minima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-red-700 sm:mt-0">
                                {parametrosMatriz.U_Anio_Min}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Matéria Activa aniónica Máxima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-green-700 sm:mt-0">
                                {parametrosMatriz.U_Anio_Max}
                              </dd>
                            </div>{" "}
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Matéria Activa catiónica PM (g/mol)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                                {parametrosMatriz.U_Cat_PM}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Matéria Activa catiónica Mínima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-red-700 sm:mt-0">
                                {parametrosMatriz.U_Cat_Min}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Matéria Activa catiónica Máxima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-green-700 sm:mt-0">
                                {parametrosMatriz.U_Cat_Max}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Matéria Activa aniónica/sabão PM (g/mol)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                                {parametrosMatriz.U_AnSab_PM}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Matéria Activa aniónica/sabão Mínima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-red-700 sm:mt-0">
                                {parametrosMatriz.U_AnSab_Min}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Matéria Activa aniónica/sabão Máxima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-green-700 sm:mt-0">
                                {parametrosMatriz.U_AnSab_Max}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Alcalinidade Hidróxido"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                                {parametrosMatriz.U_Alc_Hidro}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Alcalinidade Mínima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-red-700 sm:mt-0">
                                {parametrosMatriz.U_Alc_Min}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Alcalinidade Máxima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-green-700 sm:mt-0">
                                {parametrosMatriz.U_Alc_Max}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Acidez Ácido"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                                {parametrosMatriz.U_Aci}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Acidez Mínima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-red-700 sm:mt-0">
                                {parametrosMatriz.U_Aci_Min}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Acidez Máxima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-green-700 sm:mt-0">
                                {parametrosMatriz.U_Aci_Max}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Amoníaco Mínima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-red-700 sm:mt-0">
                                {parametrosMatriz.U_Amo_Min}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Amoníaco Máxima (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-green-700 sm:mt-0">
                                {parametrosMatriz.U_Amo_Max}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Cloro Mínimo(%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-red-700 sm:mt-0">
                                {parametrosMatriz.U_Clo_Min}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Cloro Máximo (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-green-700 sm:mt-0">
                                {parametrosMatriz.U_Clo_Max}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Peróxido de hidrogénio Mínimo (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-red-700 sm:mt-0">
                                {parametrosMatriz.U_Pero_Min}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Peróxido de hidrogénio Máximo (%)"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-green-700 sm:mt-0">
                                {parametrosMatriz.U_Pero_Max}
                              </dd>
                            </div>
                            <div className="px-4 py-4 gap-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Ponto de turvação/congelação Mínimo"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-red-700 sm:mt-0">
                                {parametrosMatriz.U_TuCo_Min}
                              </dd>
                            </div>
                            <div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 items-center">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                {"Ponto de turvação/congelação Máxima"}
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-green-700 sm:mt-0">
                                {parametrosMatriz.U_TuCo_Max}
                              </dd>
                            </div>
                          </div>
                        </SheetContent>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SheetTrigger asChild>
                              <Button variant={"ghost"} size={"icon"}>
                                <Info size={18} />
                              </Button>
                            </SheetTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div>Mais Informação</div>
                          </TooltipContent>
                        </Tooltip>
                      </Sheet>
                    </TooltipProvider>
                  </div>

                  <div className="px-2 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-center">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      pH Mínimo
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-red-700 sm:col-span-2 sm:mt-0">
                      {parametrosMatriz.U_Ph_Min}
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-center">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      pH Máximo
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-green-700 sm:col-span-2 sm:mt-0">
                      {parametrosMatriz.U_Ph_Max}
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-center">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      {"Densidade Mínima (g/ml)"}
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-red-700 sm:col-span-2 sm:mt-0">
                      {parametrosMatriz.U_Den_Min}
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-center">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      {"Densidade Máxima (g/ml) "}
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-green-700 sm:col-span-2 sm:mt-0">
                      {parametrosMatriz.U_Den_Max}
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-center">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Resíduo Seco Mínimo
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-red-700 sm:col-span-2 sm:mt-0">
                      {parametrosMatriz.U_Res_Min}
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-center">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Resíduo Seco Máximo
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-green-700 sm:col-span-2 sm:mt-0">
                      {parametrosMatriz.U_Res_Max}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-2 border-lime-500 rounded-md p-5 shadow-2xl items-center min-h-screen justify-start max-w-full mx-auto w-9/12">
            <div className="flex flex-row items-center justify-between">
              <div>Editor de Receitas</div>
              {artigo === "" ? (
                <></>
              ) : verificouExistenciaReceita ? (
                <></>
              ) : (
                <div className="flex flex-col items-center">
                  <AlertTriangle color="#FFA500" size={30} />
                  <div className="font-medium text-sm ml-2">
                    Antes de Criar receita verifique a sua existência
                  </div>
                </div>
              )}
              <div className="flex flex-row gap-x-2">
                <div className="mr-3 flex flex-col items-center">
                  <div>Apagar Fases</div>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    onClick={() => {
                      handleLimparItemsListReceita();
                      handleLimparPassosReceita();
                    }}
                  >
                    <EraserIcon />
                  </Button>
                </div>
                <div className="mr-3 flex flex-col items-center">
                  <div>Passos</div>
                  <div className="space-x-1">
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      onClick={() => {
                        const removerUmaEtapaReceita = produce(
                          itemsList,
                          (draft) => {
                            if (draft.length > 1) {
                              draft.pop();
                            }
                            console.log("impossivel remover mais items");
                          }
                        );
                        setItemsList(removerUmaEtapaReceita);
                        console.log("Foi removido uma etapa");
                      }}
                    >
                      <MinusCircle />
                    </Button>
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      onClick={() => {
                        console.log("more");
                        const adicionarEtapaReceita = produce(
                          itemsList,
                          (draft) => {
                            const idUltimoItem = draft.length - 1;

                            draft.push({
                              id: idUltimoItem + 1,
                              etapa: "",
                              fase: "",
                              param1: "",
                              param2: "",
                            });
                          }
                        );
                        setItemsList(adicionarEtapaReceita);
                        console.log("Foi adicionada uma etapa");
                      }}
                    >
                      <PlusCircle />
                    </Button>
                  </div>
                </div>
                <div className="mr-3 flex flex-col items-center">
                  <div>Permitir edição</div>
                  <Switch
                    checked={podeEditar}
                    onCheckedChange={() => setPodeEditar(!podeEditar)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="select-none">
              <Reorder.Group
                axis="y"
                onReorder={setItemsList}
                values={itemsList}
                className="max-h-[480px] overflow-auto"
              >
                {itemsList.map((item) => {
                  return (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      dragListener={podeEditar}
                      drag={item.fase != "" ? "y" : false}
                    >
                      <div className=" border flex flex-row items-center rounded-sm my-2 px-2 py-4  sm:gap-4 sm:px-0">
                        <div className="ml-3">
                          <CornerRightDown strokeWidth={1} />
                        </div>
                        <Select
                          disabled={!podeEditar || !verificouExistenciaReceita}
                          onValueChange={(e) => {
                            //verificar valor da fase
                            //console.log(e);
                            const atualizarFaseReceita = produce(
                              itemsList,
                              (draft) => {
                                draft[item.id].fase = e;
                              }
                            );
                            setItemsList(atualizarFaseReceita);
                            //console.log(atualizarFaseReceita);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Fase pretendida ..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Fases</SelectLabel>
                              {fases.map((fase, index) => (
                                <SelectItem key={index} value={fase.value}>
                                  {fase.descricao}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {item.fase ? (
                          item.fase === "1" || item.fase === "3" ? (
                            item.fase === "1" ? (
                              <>
                                <Select
                                  disabled={!podeEditar}
                                  onValueChange={(e) => {
                                    console.log(
                                      "evento do input materias primas",
                                      e
                                    );
                                    //esta funcao levou atualizacao para atualizar tambem o parametro 2 mediante a selecao da materia prima
                                    const atualizarParametro1 = produce(
                                      itemsList,
                                      (draft) => {
                                        draft[item.id].param1 = e;
                                        //verificar se a materia prima selecionada se encontra no corpo do array dos product tree lines
                                        const indexDoArrayProductTreeLines =
                                          materiasPrimasReceita.data?.ProductTreeLines.findIndex(
                                            (productTreeLine) =>
                                              productTreeLine.ItemCode === e
                                          );
                                        //calculo da percentagem de produto atravez da quantidade do artigo pai e seus correspondentes
                                        if (
                                          indexDoArrayProductTreeLines !== -1
                                        ) {
                                          draft[item.id].param2 = (
                                            (materiasPrimasReceita.data
                                              ?.ProductTreeLines[
                                              indexDoArrayProductTreeLines!
                                            ].Quantity! *
                                              100) /
                                            materiasPrimasReceita.data
                                              ?.Quantity!
                                          ).toString();
                                        }
                                      }
                                    );
                                    console.log(
                                      "parametro1",
                                      atualizarParametro1
                                    );
                                    setItemsList(atualizarParametro1);
                                  }}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue
                                      onClick={(e) =>
                                        console.log("select value", e)
                                      }
                                      placeholder="Matéria Prima ..."
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Matérias Primas</SelectLabel>
                                      {materiasPrimasTanque.map((mpTanque) => {
                                        //devolve automaticos
                                        return materiasPrimas.findIndex(
                                          (materiaPrima) =>
                                            materiaPrima.artigo ===
                                            mpTanque.artigo
                                        ) !== -1 ||
                                          mpTanque.artigo === "MP0000" ||
                                          mpTanque.artigo === "MP000a" ? (
                                          <SelectItem value={mpTanque.artigo}>
                                            {`(${mpTanque.artigo})${mpTanque.descricao}`}
                                          </SelectItem>
                                        ) : null;
                                      })}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                <>
                                  <Input
                                    value={itemsList[item.id].param2}
                                    onChange={(e) => {
                                      console.log(e.target.value);
                                      if (Number(e.target.value) > 100) {
                                        alert(
                                          "Nao colocar valores superiores a 100"
                                        );
                                        e.target.value = "100";
                                      }
                                      const atualizarPercentagemMPReceita =
                                        produce(itemsList, (draft) => {
                                          draft[item.id].param2 =
                                            e.target.value;
                                        });
                                      setItemsList(
                                        atualizarPercentagemMPReceita
                                      );
                                    }}
                                    disabled={false}
                                    className="max-w-[100px]"
                                    min={0}
                                    max={100}
                                  />
                                  <p className="-ml-2">%</p>
                                  <p className="text-pretty font-light text-sm ml-4">
                                    Escolha a MP a adicionar e a sua percentagem
                                    na receita automatico
                                  </p>
                                </>
                              </>
                            ) : (
                              <>
                                <Select
                                  disabled={!podeEditar}
                                  onValueChange={(e) => {
                                    //parametro 2 vai passar a ser atualizado aqui para obter a percentagem automaticamente 09-19-2024
                                    console.log("select dos manuais", e);
                                    const atualizarParametro1 = produce(
                                      itemsList,
                                      (draft) => {
                                        draft[item.id].param1 = e;
                                        //verificar se a materia prima selecionada se encontra no corpo do array dos product tree lines
                                        const indexDoArrayProductTreeLines =
                                          materiasPrimasReceita.data?.ProductTreeLines.findIndex(
                                            (productTreeLine) =>
                                              productTreeLine.ItemCode === e
                                          );
                                        //calculo da percentagem de produto atravez da quantidade do artigo pai e seus correspondentes
                                        if (
                                          indexDoArrayProductTreeLines !== -1
                                        ) {
                                          draft[item.id].param2 = (
                                            (materiasPrimasReceita.data
                                              ?.ProductTreeLines[
                                              indexDoArrayProductTreeLines!
                                            ].Quantity! *
                                              100) /
                                            materiasPrimasReceita.data
                                              ?.Quantity!
                                          ).toString();
                                        }
                                      }
                                    );
                                    //console.log(atualizarParametro1Manual);
                                    setItemsList(atualizarParametro1);
                                  }}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Matéria Prima ..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Matérias Primas</SelectLabel>
                                      {materiasPrimas.map((mp) => {
                                        //devolve manuais
                                        return materiasPrimasTanque.findIndex(
                                          (mpTanque) =>
                                            mpTanque.artigo === mp.artigo
                                        ) === -1 ? (
                                          <SelectItem value={mp.artigo}>
                                            {`(${mp.artigo})${mp.descricao}`}
                                          </SelectItem>
                                        ) : null;
                                      })}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                <>
                                  <Input
                                    value={
                                      itemsList.find(
                                        (itemDoFind) =>
                                          itemDoFind.param1 == item.param1
                                      )?.param2
                                    }
                                    onChange={(e) => {
                                      console.log(e.target.value);
                                      if (Number(e.target.value) > 100) {
                                        alert(
                                          "Nao colocar valores superiores a 100"
                                        );
                                        e.target.value = "100";
                                      }
                                      const atualizarPercentagemMPReceita =
                                        produce(itemsList, (draft) => {
                                          draft[item.id].param2 =
                                            e.target.value;
                                        });
                                      setItemsList(
                                        atualizarPercentagemMPReceita
                                      );
                                    }}
                                    disabled={!podeEditar}
                                    className="max-w-[100px]"
                                    min={0}
                                    max={100}
                                  />
                                  <p className="-ml-2">%</p>
                                  <p className="text-pretty font-light text-sm ml-4">
                                    Escolha a MP a adicionar e a sua percentagem
                                    na receita manuais
                                  </p>
                                </>
                              </>
                            )
                          ) : item.fase === "2" ||
                            item.fase === "5" ||
                            item.fase === "4" ? (
                            item.fase === "2" ? (
                              <>
                                <Input
                                  onChange={(e) => {
                                    if (Number(e.target.value) > 100) {
                                      alert(
                                        "Nao colocar valores superiores a 100"
                                      );
                                      e.target.value = "100";
                                    }
                                    const atualizarPercentagemAgitacaoReceita =
                                      produce(itemsList, (draft) => {
                                        draft[item.id].param1 = e.target.value;
                                      });
                                    setItemsList(
                                      atualizarPercentagemAgitacaoReceita
                                    );
                                  }}
                                  disabled={!podeEditar}
                                  className="max-w-[100px]"
                                  type="number"
                                  required
                                  min={10}
                                  max={100}
                                />
                                <p className="-ml-2">%</p>
                                <p className="text-pretty font-light text-sm ml-4">
                                  Escolha um valor entre 10 e 100
                                </p>
                              </>
                            ) : item.fase === "5" ? (
                              <>
                                <Input
                                  onChange={(e) => {
                                    if (Number(e.target.value) > 100) {
                                      alert(
                                        "Nao colocar valores superiores a 100"
                                      );
                                      e.target.value = "100";
                                    }
                                    const atualizarTempoEsperaReceita = produce(
                                      itemsList,
                                      (draft) => {
                                        draft[item.id].param1 = e.target.value;
                                      }
                                    );
                                    setItemsList(atualizarTempoEsperaReceita);
                                  }}
                                  disabled={!podeEditar}
                                  className="max-w-[100px]"
                                  required
                                  type="number"
                                  min={1}
                                />
                                <p className="-ml-2">min.</p>
                                <p className="text-pretty font-light text-sm ml-4">
                                  Escolha o tempo de espera em minutos
                                </p>
                              </>
                            ) : (
                              <>
                                <Select
                                  disabled={!podeEditar}
                                  onValueChange={(e) => {
                                    //console.log(e);
                                    const atualizarParametro1 = produce(
                                      itemsList,
                                      (draft) => {
                                        draft[item.id].param1 = e;
                                      }
                                    );
                                    //console.log(atualizarParametro1);
                                    setItemsList(atualizarParametro1);
                                  }}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Validação ..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Validações</SelectLabel>
                                      {tipoValidacao.map((validacao, index) => (
                                        <SelectItem
                                          key={index}
                                          value={validacao.value}
                                        >
                                          {validacao.descricao}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </>
                            )
                          ) : (
                            <></>
                          )
                        ) : (
                          <></>
                        )}
                      </div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>
            <div className="py-4 flex">
              {itemsList.length === 1 ? (
                <h2 className="mx-auto">
                  Para adicionar mais passos pressione o icone + no lado
                  superior direito
                </h2>
              ) : (
                ""
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row items-center space-x-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      onClick={() => {
                        ///FAZER AQUI A ATUALIZACAO
                        console.log(receitaExisteNoSistema);
                        const atualizarPassosReceita = produce(
                          passosReceita,
                          (draft) => {
                            itemsList.map((etapa, index) => {
                              if (draft.length < itemsList.length) {
                                if (
                                  parseInt(etapa.fase) === 1 ||
                                  parseInt(etapa.fase) === 3
                                ) {
                                  draft.push({
                                    NumeroPasso: index + 1,
                                    Receita: artigo,
                                    Fase: parseInt(etapa.fase),
                                    MateriaPrima: etapa.param1,
                                    Densidade: parseFloat(
                                      parametrosMatriz.U_Den_Max
                                    ),
                                    PhMin: parseFloat(
                                      parametrosMatriz.U_Ph_Min
                                    ),
                                    PhMax: parseFloat(
                                      parametrosMatriz.U_Ph_Max
                                    ),
                                    Parametro1: parseFloat(etapa.param2),
                                    Parametro2: 0,
                                  });
                                }
                                if (
                                  parseInt(etapa.fase) === 2 ||
                                  parseInt(etapa.fase) === 4 ||
                                  parseInt(etapa.fase) === 5
                                ) {
                                  draft.push({
                                    NumeroPasso: index + 1,
                                    Receita: artigo,
                                    Fase: parseInt(etapa.fase),
                                    MateriaPrima: "",
                                    Densidade: parseFloat(
                                      parametrosMatriz.U_Den_Max
                                    ),
                                    PhMin: parseFloat(
                                      parametrosMatriz.U_Ph_Min
                                    ),
                                    PhMax: parseFloat(
                                      parametrosMatriz.U_Ph_Max
                                    ),
                                    Parametro1: 0.0,
                                    Parametro2: parseFloat(etapa.param1),
                                  });
                                }
                              }
                            });
                          }
                        );
                        setPasssosReceita(atualizarPassosReceita);
                        console.log(passosReceita);
                      }}
                      disabled={
                        itemsList.filter((item) => item.fase === "").length >
                          0 || verificouExistenciaReceita === false
                          ? true
                          : false
                      }
                    >
                      Criar!
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex flex-row justify-between">
                        <AlertDialogTitle>Receita {artigo}</AlertDialogTitle>
                        <div>pH Min:{parametrosMatriz.U_Ph_Min}</div>
                        <div>pH Max:{parametrosMatriz.U_Ph_Max}</div>
                        <div>Densidade:{parametrosMatriz.U_Den_Max}</div>
                      </div>
                      <AlertDialogDescription>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {itemsList.map((item: any, index) => (
                            <div
                              key={index}
                              className="border rounded p-3 bg-gray-50"
                            >
                              <div className="flex flex-col space-y-2">
                                <div className="font-medium">
                                  Etapa {index + 1}:
                                </div>

                                <div>
                                  Fase:{" "}
                                  {item.fase
                                    ? fases.filter(
                                        (fase) => fase.value === item.fase
                                      )[0].descricao
                                    : ""}
                                </div>

                                {/* Parameter 1 - Material or Operation Parameter */}
                                {item.param1 !== "" ? (
                                  <div className="flex items-center gap-2">
                                    <span>Parametro 1:</span>
                                    {item.fase === "4" ? (
                                      // Validation type - keep read-only
                                      <span className="font-medium">
                                        {
                                          tipoValidacao.filter(
                                            (validacao) =>
                                              validacao.value === item.param1
                                          )[0].descricao
                                        }
                                      </span>
                                    ) : item.fase === "2" ? (
                                      // Agitation percentage - editable
                                      <div className="flex items-center gap-1">
                                        <Input
                                          type="number"
                                          value={item.param1}
                                          onChange={(e) => {
                                            const value = Math.min(
                                              Math.max(
                                                parseFloat(e.target.value) ||
                                                  10,
                                                10
                                              ),
                                              100
                                            );
                                            const updatedList = produce(
                                              itemsList,
                                              (draft) => {
                                                draft[index].param1 =
                                                  value.toString();
                                              }
                                            );
                                            setItemsList(updatedList);
                                          }}
                                          className="w-24 h-8 text-base"
                                          min="10"
                                          max="100"
                                        />
                                        <span>%</span>
                                      </div>
                                    ) : item.fase === "5" ? (
                                      // Wait time - editable
                                      <div className="flex items-center gap-1">
                                        <Input
                                          type="number"
                                          value={item.param1}
                                          onChange={(e) => {
                                            const value = Math.max(
                                              parseFloat(e.target.value) || 1,
                                              1
                                            );
                                            const updatedList = produce(
                                              itemsList,
                                              (draft) => {
                                                draft[index].param1 =
                                                  value.toString();
                                              }
                                            );
                                            setItemsList(updatedList);
                                          }}
                                          className="w-24 h-8 text-base"
                                          min="1"
                                        />
                                        <span>min.</span>
                                      </div>
                                    ) : (
                                      // Material code - read-only
                                      <span className="font-medium">
                                        {item.param1}
                                      </span>
                                    )}
                                  </div>
                                ) : null}

                                {/* Parameter 2 - Material Percentage */}
                                {item.param2 !== "" &&
                                (item.fase === "1" || item.fase === "3") ? (
                                  <div className="flex items-center gap-2">
                                    <span>Parametro 2:</span>
                                    <div className="flex items-center gap-1">
                                      <Input
                                        type="number"
                                        value={item.param2}
                                        onChange={(e) => {
                                          const value = Math.min(
                                            Math.max(
                                              parseFloat(e.target.value) || 0,
                                              0
                                            ),
                                            100
                                          );
                                          const updatedList = produce(
                                            itemsList,
                                            (draft) => {
                                              draft[index].param2 =
                                                value.toString();
                                            }
                                          );
                                          setItemsList(updatedList);
                                        }}
                                        className="w-24 h-8 text-base"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                      />
                                      <span>%</span>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          console.log(receitaExisteNoSistema);

                          if (receitaExisteNoSistema) {
                            setAbrirModalCriacaoReceita(true);
                          }
                          if (!receitaExisteNoSistema) {
                            console.log(passosReceita);
                            console.log(JSON.stringify(passosReceita));
                            const passosReceitaJson =
                              JSON.stringify(passosReceita);
                            await CriarReceitasScada.mutate(passosReceitaJson);
                            handleLimparItemsListReceita();
                            handleLimparPassosReceita();
                            setVerificouExistenciaReceita(false);
                          }
                        }}
                      >
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog
                  open={abrirModalCriacaoReceita}
                  onOpenChange={setAbrirModalCriacaoReceita}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Tem a certeza que deseja criar a receita?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta receita já existe no sistema ao confirmar irá{" "}
                        <span className="text-red-500">apagar</span> a receita
                        anterior!!
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          await ApagarReceitaScada.mutate(artigo);

                          console.log(passosReceita);
                          console.log(JSON.stringify(passosReceita));
                          const passosReceitaJson =
                            JSON.stringify(passosReceita);
                          await CriarReceitasScada.mutate(passosReceitaJson);
                          handleLimparItemsListReceita();
                          handleLimparPassosReceita();
                          setVerificouExistenciaReceita(false);
                        }}
                      >
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {itemsList.filter((item) => item.fase === "").length > 0 ? (
                  <div className="font-medium text-sm text-red-500">
                    Não deixe fases por definir !!!
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div className="mt-2 flex flex-row items-center">
                <Button
                  disabled={
                    artigo === "" ||
                    !realizouFetchArtigo ||
                    materiasPrimasReceita.isFetching ||
                    materiasPrimasReceita.isRefetching
                  }
                  onClick={async () => {
                    await ReceitasSCADA.refetch();
                    const atualizarMateriasPrimas = produce(
                      materiasPrimas,
                      (draft: materiaPrima[]) => {
                        materiasPrimasReceita.data?.ProductTreeLines.map(
                          (materiaPrima) => {
                            if (
                              draft.findIndex(
                                (itemMateriaPrima) =>
                                  itemMateriaPrima.artigo ===
                                  materiaPrima.ItemCode
                              ) === -1
                            ) {
                              draft.push({
                                artigo: materiaPrima.ItemCode,
                                descricao: materiaPrima.ItemName,
                              });
                            }
                          }
                        );
                      }
                    );
                    console.log(atualizarMateriasPrimas);
                    setMateriasPrimas(atualizarMateriasPrimas);
                    setVerificouExistenciaReceita(true);
                  }}
                >
                  {ReceitasSCADA.isLoading ? (
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
                    <>
                      Verificar existência
                      {artigo !== "" ? (
                        verificouExistenciaReceita ? (
                          <ClipboardCheck className="ml-2" />
                        ) : (
                          <ClipboardX className="ml-2" />
                        )
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </Button>
                {materiasPrimasReceita.isFetching ||
                materiasPrimasReceita.isRefetching ? (
                  <div className="ml-2">
                    <Oval
                      visible={true}
                      height="40"
                      width="40"
                      color="#84cc27"
                      ariaLabel="oval-loading"
                      wrapperStyle={{}}
                      wrapperClass=""
                    />
                  </div>
                ) : null}

                {verificouExistenciaReceita ? (
                  ReceitasSCADA.data !== null ? (
                    <div className="flex flex-row items-center ml-2">
                      <Dialog>
                        <DialogTrigger>
                          <Button size={"icon"}>
                            <Eye />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Receita {ReceitasSCADA.data![0].receita}
                            </DialogTitle>
                            <DialogDescription>
                              <div>
                                <div className="flex flex-row justify-end">
                                  <span className="font-bold mr-1">
                                    Data Criação
                                  </span>
                                  {format(
                                    ReceitasSCADA.data![0].dataCriacao,
                                    "yyyy-MM-dd HH:mm:ss"
                                  )}
                                </div>
                                <div className="flex flex-col mx-auto">
                                  {ReceitasSCADA.data!.map(
                                    (passoReceitaSCADA, index) => (
                                      <div
                                        key={index}
                                        className="flex flex-col"
                                      >
                                        <div className="flex flex-row gap-2 py-1">
                                          <div className="font-bold">
                                            <span className="mr-1">Etapa</span>
                                            {passoReceitaSCADA.numeroPasso}:
                                          </div>
                                          <div>
                                            <span className="font-semibold mr-1">
                                              Fase:
                                            </span>
                                            {
                                              fases.find(
                                                (fase) =>
                                                  Number(fase.value) ===
                                                  passoReceitaSCADA.fase
                                              )?.descricao
                                            }
                                          </div>
                                          <div>
                                            <span className="font-semibold mr-1">
                                              Parametro1:
                                            </span>
                                            {passoReceitaSCADA.fase === 1 ||
                                            passoReceitaSCADA.fase === 3 ? (
                                              <>
                                                {passoReceitaSCADA.materiaPrima}
                                              </>
                                            ) : passoReceitaSCADA.fase === 4 ? (
                                              tipoValidacao.find(
                                                (validacao) =>
                                                  Number(validacao.value) ===
                                                  passoReceitaSCADA.parametro2
                                              )?.descricao
                                            ) : passoReceitaSCADA.fase === 2 ? (
                                              <>
                                                {passoReceitaSCADA.parametro2} %
                                              </>
                                            ) : (
                                              <>
                                                {passoReceitaSCADA.parametro2}{" "}
                                                minutos
                                              </>
                                            )}
                                          </div>

                                          {passoReceitaSCADA.fase === 1 ||
                                          passoReceitaSCADA.fase === 3 ? (
                                            <div>
                                              <span className="font-semibold mr-1">
                                                Parametro2:
                                              </span>
                                              {passoReceitaSCADA.parametro1}
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                        <Separator />
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button className="ml-2" size={"icon"}>
                            <Trash2 />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Tem a certeza que deseja apagar a receita?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              <p className="text-red-500">
                                Esta ação não é revertivel.
                              </p>
                              Ao confirmar irá apagar permanentemente a receita
                              do sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                console.log(artigo);
                                console.log("botao para eliminar");
                                await ApagarReceitaScada.mutate(artigo);
                                setVerificouExistenciaReceita(false);
                              }}
                            >
                              Apagar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <p className="font-medium text-sm text-green-500 ml-2">
                        Receita {artigo} já existe no sistema
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-sm text-red-500 ml-2">
                        Receita {artigo} ainda não existe no sistema
                      </p>
                    </>
                  )
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;

const fases = [
  { value: "1", descricao: "Adição Automática" },
  { value: "2", descricao: "Agitação" },
  { value: "3", descricao: "Adição Manual" },
  { value: "4", descricao: "Validação" },
  { value: "5", descricao: "Espera" },
];

const tipoValidacao = [
  { value: "1", descricao: "Aprovação Final" },
  { value: "2", descricao: "pH" },
];

const materiasPrimasTanque: materiaPrima[] = [
  { artigo: "MP0000", descricao: "ÁGUA Osmose" },
  { artigo: "MP000a", descricao: "ÁGUA Limpeza IBC" },
  { artigo: "MP0042", descricao: "TEXAPON PLT227 / EMAL 227E" },
  { artigo: "MP0139", descricao: "SODA CÁUSTICA A 32%" },
  { artigo: "MP0137", descricao: "EDTA LIQ" },
  { artigo: "MP0027", descricao: "UFACID K" },
  { artigo: "MP0069", descricao: "HIPOCLORITO DE SÓDIO" },
  { artigo: "MP0002", descricao: "BETADET HR / DEHYTON PK" },
  { artigo: "ibc", descricao: "ibc" },
  { artigo: "ibc", descricao: "ibc" },
  { artigo: "ibc", descricao: "ibc" },
  { artigo: "ibc", descricao: "ibc" },
  { artigo: "ibc", descricao: "ibc" },
  { artigo: "ibc", descricao: "ibc" },
];
