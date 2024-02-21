"use client";
import { useState, useEffect } from "react";
import ProgressBar from "react-customizable-progressbar";

interface progressBarProps {
  Ipercentage: number;
}

function ProgressoFabrico({ Ipercentage }: progressBarProps) {
  return (
    <ProgressBar
      progress={Ipercentage}
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
          {Ipercentage}%
        </div>
      </div>
    </ProgressBar>
  );
}

export default ProgressoFabrico;
