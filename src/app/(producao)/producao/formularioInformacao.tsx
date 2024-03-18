"use client";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";

import { ListaBom, OrdemProducao } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { estadosOrdem } from "../componentes/estados";
import { useEffect, useState } from "react";

import BotaoConfirmacao from "../componentes/BotaoConfirmacao";

const FormularioInformacao = (ordem: OrdemProducao) => {
  const [estadoOrdem, setEstadoOrdem] = useState("");

  const [data, setData] = useState<ListaBom[]>();

  useEffect(() => {
    fetch(
      `http://localhost:3000/api/ordensProducao/bom?product-id=${ordem.produtos.id_produto}`
    )
      .then((res) => res.json())
      .then((data) => {
        setData(data.billOfMaterials);
      });
  }, []);

  return (
    <div className="flex flex-row ">
      <div className="flex flex-col">
        <div className="flex flex-row justify-items-center">
          <div className="flex flex-col justify-items gap-4 m-2">
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Referência
              </Label>
              <Input
                id="name"
                value={ordem.produtos.artigo}
                disabled
                className="text-center"
              />
            </div>
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Lote de Fabrico
              </Label>
              <Input
                disabled
                id="username"
                value={ordem.lote_fabrico}
                className="text-center"
              />
            </div>
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Descrição
              </Label>
              <Input
                disabled
                id="username"
                value={ordem.produtos.descricao}
                className="text-center"
              />
            </div>
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Quantidade
              </Label>
              <Input
                id="username"
                value={ordem.quantidade}
                disabled
                className="text-center"
              />
            </div>
          </div>
          <div className="flex flex-col justify-items gap-4 m-2">
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Estado
              </Label>
              <Select
                defaultValue={ordem.status_ordens_producao.name}
                onValueChange={(e) => {
                  //console.log(e);
                  const estadoFiltrado = estadosOrdem.filter((estado) => {
                    return estado.estado === e;
                  });
                  //console.log(estadoFiltrado);
                  const id = estadoFiltrado[0].value;
                  console.log(id);
                  return setEstadoOrdem(id);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Escolha um estado ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {estadosOrdem.map((estado) => (
                      <SelectItem
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
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Cliente
              </Label>
              <Input
                id="username"
                value="Cliente"
                disabled
                className="text-center"
              />
            </div>
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Reator
              </Label>
              <Input
                id="username"
                value="Reator A"
                disabled
                className="text-center"
              />
            </div>
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Data de Criação
              </Label>
              <Input
                id="username"
                value={ordem.data_criacao}
                disabled
                className="text-center"
              />
            </div>
          </div>
        </div>
        <div className="pt-10 ml-3">
          <BotaoConfirmacao estadoOrdem={estadoOrdem} ordem={ordem} />
        </div>
      </div>
      <div className="flex flex-col justify-items-center gap-4 mx-4 ">
        <Label htmlFor="username" className="text-center">
          Detalhes Bom
        </Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Matéria Prima</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Percentagem</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.length > 0 &&
              data!.map((mp) => (
                <TableRow key={mp.id_bom}>
                  <TableCell className="font-medium">
                    {mp.materias_primas.artigo}
                  </TableCell>
                  <TableCell>{mp.lote}</TableCell>
                  <TableCell className="text-center">
                    {mp.percentagem}
                  </TableCell>
                  <TableCell className="text-right">
                    {(ordem.quantidade * parseFloat(mp.percentagem)) / 100}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">------</TableCell>
              <TableCell className="text-right">------</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default FormularioInformacao;
/*

*/
