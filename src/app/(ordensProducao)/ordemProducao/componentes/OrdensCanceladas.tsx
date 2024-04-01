"use client";
import ProgressBar from "react-customizable-progressbar";
import { FetchOrdens } from "@/Services/OrdensProducao/fetchOrdens";

import { CirclesWithBar } from "react-loader-spinner";

function ProgressoFabricoOrdensCanceladas() {
  const { data } = FetchOrdens();
  //console.log(data?.ordensProducao.length);

  const ordensPlanedas = data?.ordensProducao.filter(
    (ordem) =>
      ordem.status_ordens_producao.name === "Planeada" ||
      ordem.status_ordens_producao.name === "A Decorrer"
  );
  const ordensCanceladas = data?.ordensProducao.filter(
    (ordem) => ordem.status_ordens_producao.name === "Cancelada"
  );
  //console.log(ordensPlanedas?.length);
  return (
    <div>
      <ProgressBar
        progress={(100 * ordensCanceladas?.length!) / ordensPlanedas?.length!}
        radius={100}
        strokeWidth={3}
        cut={120}
        rotate={150}
        trackStrokeWidth={1}
        strokeLinecap="round"
        strokeColor="#DE2C37"
      >
        <div className="your-indicator">
          <div className="text-4xl text-slate-600 font-sans font-bold normal-nums">
            {data ? (
              `${(
                (100 * ordensCanceladas?.length!) /
                ordensPlanedas?.length!
              ).toFixed(1)}%`
            ) : (
              <CirclesWithBar color="#DE2C37" />
            )}
          </div>
        </div>
      </ProgressBar>
      <div className="-mt-3">
        <div className="flex flex-row">
          <p className="font-medium text-red-600">Ordens Canceladas:</p>&nbsp;
          {ordensCanceladas?.length} ordens
        </div>
      </div>
    </div>
  );
}

export default ProgressoFabricoOrdensCanceladas;
