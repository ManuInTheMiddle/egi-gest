"use client";
import { FetchOrdens } from "@/Services/OrdensProducao/fetchOrdens";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ordensPlanedasI {
  numeroOrdensPlan: number;
}

function OrdensPlaneadas({ numeroOrdensPlan }: ordensPlanedasI) {
  const { data } = FetchOrdens();
  //console.log(data?.ordensProducao.length);
  const ordensPlanedas = data?.ordensProducao.filter(
    (ordem) =>
      ordem.status_ordens_producao.name === "Planeada" ||
      ordem.status_ordens_producao.name === "A Decorrer"
  );

  //console.log(ordensPlanedas?.length);
  return (
    <div>
      <Card className="border-2 border-lime-500 flex flex-col shadow-md ">
        <CardHeader>
          <h1 className="text-xl">Planeamento de Ordens</h1>
          <CardDescription>Numero de Ordens planeadas em SAP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row">
            <p className="font-medium">Ordens Planeadas SAP:</p>&nbsp;
            {numeroOrdensPlan ? numeroOrdensPlan : "NA"}
          </div>
          <div className="">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-row">
                    <p className="font-medium">Ordens Planeadas:</p>&nbsp;
                    {ordensPlanedas?.length} ordens
                    <HelpCircle size={16} className="ml-1" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ordens planeadas + Ordens a Decorrer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrdensPlaneadas;
