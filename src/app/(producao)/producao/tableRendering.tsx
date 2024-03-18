"use client";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getOrders } from "@/redux/ordemProducao/ordemProducaoSlice";
import DataTable from "./data-table";
import { OrdemProducao } from "@/types";
import ColumnsComponent from "./columns";

const TableRendering = () => {
  //const [data, setData] = useState<OrdemProducao[]>([]);
  const orders = useAppSelector((state) => state.ordemProducao);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log();
    fetch(`http://localhost:3000/api/ordensProducao`)
      .then((res) => res.json())
      .then((data) => {
        //  setData(data.ordensProducao);
        dispatch(getOrders(data.ordensProducao));
        //console.log(orders.orders);
        //console.log(data.ordensProducao);
      });
  }, []);
  return <DataTable columns={ColumnsComponent} data={orders.orders} />;
};

export default TableRendering;
