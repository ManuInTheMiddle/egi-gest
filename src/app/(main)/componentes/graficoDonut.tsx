import React, { useState } from "react";
import { Pie } from "@ant-design/plots";

const GraficoDonut = () => {
  const [materiasPrimas, setMateriaPrimas] = useState({
    Laurileter: 0,
    Soda: 0,
    EDTA: 0,
    Betaina: 0,
  });

  const config = {
    data: [
      { type: "Betaína", value: materiasPrimas.Betaina },
      { type: "Laurileter", value: materiasPrimas.Laurileter },
      { type: "Soda", value: materiasPrimas.Soda },
      { type: "EDTA", value: materiasPrimas.EDTA },
    ],
    angleField: "value",
    colorField: "type",
    paddingRight: 50,
    innerRadius: 0.5,
    label: {
      text: "value",
      style: {
        fontWeight: "bold",
      },
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
  };
  return <Pie {...config} />;
};

export default GraficoDonut;
