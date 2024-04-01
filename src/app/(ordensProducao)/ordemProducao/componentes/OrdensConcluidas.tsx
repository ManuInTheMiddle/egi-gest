"use client";
import ProgressBar from "react-customizable-progressbar";
import { FetchOrdens } from "@/Services/OrdensProducao/fetchOrdens";
import { CirclesWithBar } from "react-loader-spinner";

function ProgressoFabricoOrdensConcluidas() {
  const { data } = FetchOrdens();
  //console.log(data?.ordensProducao.length);
  const ordensConcluidas = data?.ordensProducao.filter(
    (ordem) => ordem.status_ordens_producao.name === "Finalizada"
  );
  const ordensPlanedas = data?.ordensProducao.filter(
    (ordem) =>
      ordem.status_ordens_producao.name === "Planeada" ||
      ordem.status_ordens_producao.name === "A Decorrer"
  );

  //console.log(ordensPlanedas?.length);
  return (
    <div>
      <ProgressBar
        progress={(100 * ordensConcluidas?.length!) / ordensPlanedas?.length!}
        radius={100}
        strokeWidth={3}
        cut={120}
        rotate={150}
        trackStrokeWidth={1}
        strokeLinecap="round"
        strokeColor="#2EA64C"
      >
        <div className="your-indicator">
          <div className="text-4xl text-slate-600 font-sans font-bold normal-nums">
            {data ? (
              `${(
                (100 * ordensConcluidas?.length!) /
                ordensPlanedas?.length!
              ).toFixed(1)}%`
            ) : (
              <CirclesWithBar color="#2EA64C" />
            )}
          </div>
        </div>
      </ProgressBar>
      <div className="-mt-3">
        <div className="flex flex-row">
          <p className="font-medium text-green-600">Ordens Concluidas:</p>
          &nbsp;
          {ordensConcluidas?.length} ordens
        </div>
      </div>
    </div>
  );
}

export default ProgressoFabricoOrdensConcluidas;
