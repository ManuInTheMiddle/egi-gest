import React from "react";
import { useState } from "react";
import { Column } from "@ant-design/plots";

const GraficoBarras = () => {
  const [meses, setMeses] = useState({
    Jan: 9000,
    Fev: 1000,
    Mar: 50000,
    Abr: 45000,
    Mai: 13000,
    Jun: 14000,
    Jul: 0,
    Ago: 0,
    Set: 0,
    Out: 0,
    Nov: 0,
    Dez: 0,
  });
  const data = [
    { type: "Jan", Quantidade: meses.Jan },
    { type: "Fev", Quantidade: meses.Fev },
    { type: "Mar", Quantidade: meses.Mar },
    { type: "Abr", Quantidade: meses.Abr },
    { type: "Mai", Quantidade: meses.Mai },
    { type: "Jun", Quantidade: meses.Jun },
    { type: "Jul", Quantidade: meses.Jul },
    { type: "Ago", Quantidade: meses.Ago },
    { type: "Set", Quantidade: meses.Set },
    { type: "Out", Quantidade: meses.Out },
    { type: "Nov", Quantidade: meses.Nov },
    { type: "Dez", Quantidade: meses.Dez },
  ];
  const config = {
    data,
    xField: "type",
    yField: "Quantidade",
    style: {
      fill: () => "#475569",
    },
    legend: false,
  };
  return <Column {...config} />;
};

export default GraficoBarras;
