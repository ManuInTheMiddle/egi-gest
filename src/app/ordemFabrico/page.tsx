"use client";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableRow,
  TableHeader,
  TableBody,
  TableCaption,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormField,
  FormControl,
  FormLabel,
} from "@/components/ui/form";
import { Search } from "lucide-react";
import ProgressoFabrico from "./progressoFabrico";

const formSchema = z.object({
  ordemFabrico: z.string(),
  produto: z.string(),
  estado: z.string(),
});

const page = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ordemFabrico: "",
      produto: "",
      estado: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <div className="m-4 mt-10">
      <section className="border-2 border-slate-600 rounded-md p-7 shadow-2xl">
        <h1 className="text-lg mb-3">Ordens de Fabrico</h1>
        <div className="flex flex-row gap-5">
          <div>
            <h1 className="text-md">Filtros</h1>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  name="produto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="produto" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="estado" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="ordemFabrico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordem Fabrico</FormLabel>
                      <FormControl>
                        <Input placeholder="ordemFabrico" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  className="mt-2 rounded-full bg-slate-600"
                  type="submit"
                >
                  <Search />
                </Button>
              </form>
            </Form>
          </div>
          <div className="flex flex-row ml-auto mr-0 gap-5 ">
            <Card className="border-2 border-lime-500 flex flex-col shadow-md">
              <CardHeader>
                <CardDescription>Lista das Ordens de Fabrico</CardDescription>
              </CardHeader>
              <CardContent>
                <Table className="border rounded-2xl ">
                  <TableCaption>Status das ordens de fabrico</TableCaption>
                  <TableHeader className="space-x-1 ">
                    <TableRow className="bg-slate-600 hover:bg-slate-600">
                      <TableHead className="text-white">
                        Ordem Fabrico
                      </TableHead>
                      <TableHead className="text-white">Produto</TableHead>
                      <TableHead className="text-white">Descrição</TableHead>
                      <TableHead className="text-white">Quantidade</TableHead>
                      <TableHead className="text-white">Estado</TableHead>
                      <TableHead className="text-white"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>100100</TableCell>
                      <TableCell>ProdutoA</TableCell>
                      <TableCell>Detregente Limão</TableCell>
                      <TableCell>5000</TableCell>
                      <TableCell>A decorrer</TableCell>
                      <TableCell>
                        <a className="underline" href="">
                          Detalhes
                        </a>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>100200</TableCell>
                      <TableCell>ProdutoB</TableCell>
                      <TableCell>Lixivia Artesanal</TableCell>
                      <TableCell>6000</TableCell>
                      <TableCell>Finalizado</TableCell>
                      <TableCell>
                        <a className="underline" href="">
                          Detalhes
                        </a>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>100300</TableCell>
                      <TableCell>ProdutoC</TableCell>
                      <TableCell>Limpa Carros</TableCell>
                      <TableCell>7000</TableCell>
                      <TableCell>A decorrer</TableCell>
                      <TableCell>
                        <a className="underline" href="">
                          Detalhes
                        </a>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div>
              <Card className="border-2 border-lime-500 flex flex-col shadow-md">
                <CardHeader>
                  <CardDescription>
                    Progresso das ordens de fabrico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressoFabrico Ipercentage={100} />
                  <div className="-mt-3">
                    <div className="flex flex-row">
                      <p className="font-medium">Ordens Agendadas:</p>&nbsp;
                      {0} ordens
                    </div>
                    <div className="flex flex-row">
                      <p className="font-medium">Ordens Concluidas:</p>&nbsp;
                      {0} ordens
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-5 py-5 border-2 border-lime-500 flex flex-col shadow-md">
                <CardContent>
                  <Table className="border ">
                    <TableCaption>Ordens a fabricar (SAP)</TableCaption>
                    <TableHeader className="space-x-1 ">
                      <TableRow className="bg-slate-600 hover:bg-slate-600">
                        <TableHead className="text-white">
                          Ordem Fabrico
                        </TableHead>
                        <TableHead className="text-white">Produto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>100100</TableCell>
                        <TableCell>ProdutoA</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>100200</TableCell>
                        <TableCell>ProdutoB</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>100300</TableCell>
                        <TableCell>ProdutoC</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;
