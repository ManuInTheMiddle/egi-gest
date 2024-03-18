"use client";
import React from "react";
import { estadosOrdem } from "./estados";
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
import { Button } from "@/components/ui/button";
import { Save, Redo, ArrowRightToLine } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { OrdemProducao } from "@/types";
import { useAppDispatch } from "@/redux/hooks";
import { changeState } from "@/redux/ordemProducao/ordemProducaoSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface propsBotao {
  ordem: OrdemProducao;
  estadoOrdem: string;
}

const BotaoConfirmacao = ({ ordem, estadoOrdem }: propsBotao) => {
  const dispatch = useAppDispatch();

  const { toast } = useToast();

  const handleAtualizacaoEstado = async (idOrdem: number, estado: number) => {
    try {
      await fetch(
        `http://localhost:3000/api/ordensProducao/estado?order-id=${idOrdem}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            estado: estado,
          }),
        }
      ).then((res) => {
        console.log(res.json());

        if (res.status.toString() === "200") {
          //console.log("confirmasse que o estado da ordem é 200");
          dispatch(changeState({ idOrdem, estado }));
        }

        res.status.toString() != "200"
          ? toast({
              variant: "destructive",
              title: "Estado da ordem",
              description: `Falha ao alterar o estado da ordem ${ordem.lote_fabrico}!`,
            })
          : toast({
              variant: "default",
              title: "Estado da ordem",
              description: `O estado da ordem ${ordem.lote_fabrico}  foi alterado com sucesso!`,
            });
      });
    } catch (error) {
      console.error("Erro ao atualizar estado da ordem", error);
    }
  };
  const estadoNovoString = estadosOrdem.filter((estado) => {
    if (estado.value === estadoOrdem) {
      return estado;
    }
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>
          <Save />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{`Ordem ${ordem.lote_fabrico}`}</AlertDialogTitle>
          <AlertDialogDescription className="mt-10">
            Tem a certeza absoluta que deseja mudar o estado da ordem
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-row gap-3  items-center">
          <Label className="text-red-400">
            {ordem.status_ordens_producao.name}{" "}
          </Label>
          <Redo strokeWidth={1.5} />
          <Label className="text-green-700">{estadoNovoString[0].estado}</Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleAtualizacaoEstado(
                ordem.id_ordem_producao,
                parseInt(estadoOrdem)
              );
            }}
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BotaoConfirmacao;
