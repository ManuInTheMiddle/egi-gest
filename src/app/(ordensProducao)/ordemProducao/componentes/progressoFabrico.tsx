"use client";
import ProgressBar from "react-customizable-progressbar";
import { useAppSelector } from "@/redux/hooks";

function ProgressoFabrico() {
  const ordensComEstadoConcluido = useAppSelector(
    (state) => state.ordemProducao.orders
  );
  return (
    <div>
      <ProgressBar
        progress={89}
        radius={100}
        strokeWidth={5}
        cut={120}
        rotate={150}
        trackStrokeWidth={0}
        strokeLinecap="round"
        strokeColor="#475569"
      >
        <div className="your-indicator">
          <div className="text-4xl text-slate-600 font-sans font-bold normal-nums">
            {89}%
          </div>
        </div>
      </ProgressBar>
      <div className="-mt-3">
        <div className="flex flex-row">
          <p className="font-medium">Ordens Planeadas:</p>&nbsp;
          {0} ordens
        </div>
        <div className="flex flex-row">
          <p className="font-medium">Ordens Concluidas:</p>&nbsp;
          {0} ordens
        </div>
      </div>
    </div>
  );
}

export default ProgressoFabrico;
