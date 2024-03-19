"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import ColumnsComponent from "./columns";

import ProgressoFabrico from "./componentes/progressoFabrico";
import Retorceder from "./componentes/retorceder";
import PlanearOrdens from "./componentes/planearOrdens";
import DataTable from "./data-table";
import { ordensProdPlan } from "../../../../public/assets/mockData/ordensFabrico";

const page = () => {
  const ordens: any = [];
  const planeamento = ordensProdPlan;
  return (
    <div className="flex flex-col">
      <section className="border-2 border-slate-600 rounded-md p-5 shadow-2xl items-center min-h-full justify-start m-1">
        <Retorceder />
        <div className="flex flex-row ">
          <div className="flex flex-col gap-3">
            <Card className="border-2 border-lime-500 flex flex-col shadow-md">
              <CardHeader>
                <CardDescription>Ordens Concluidas / Agendadas</CardDescription>
              </CardHeader>
              <CardContent className="mx-auto">
                <ProgressoFabrico Ipercentage={89} />
              </CardContent>
            </Card>
            <Card className="border-2 border-lime-500 flex flex-col shadow-md">
              <CardHeader>
                <CardDescription>Lista das Ordens de Fabrico</CardDescription>
              </CardHeader>
              <CardContent>
                <PlanearOrdens />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-row gap-4 mx-auto">
            <Card className="border-2 border-lime-500 flex flex-col shadow-md">
              <CardHeader>
                <CardDescription>Lista das Ordens de Fabrico</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={ColumnsComponent} data={ordensProdPlan} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;
