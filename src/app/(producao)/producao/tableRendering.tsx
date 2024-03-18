"use client";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getOrders } from "@/redux/ordemProducao/ordemProducaoSlice";
import DataTable from "./data-table";
import ColumnsComponent from "./columns";

const TableRendering = () => {
  //const [data, setData] = useState<OrdemProducao[]>([]);
  const orders = useAppSelector((state) => state.ordemProducao.orders);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log();
    fetch(`http://localhost:3000/api/ordensProducao`)
      .then((res) => res.json())
      .then((data) => {
        dispatch(getOrders(data.ordensProducao));
        //setData(data.ordensProducao);
        //console.log(orders);
        //console.log(data.ordensProducao);
      });
  }, [orders]);
  return <DataTable columns={ColumnsComponent} data={orders} />;
};

export default TableRendering;
