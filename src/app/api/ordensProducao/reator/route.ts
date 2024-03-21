import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";

interface Ireator {
  reator: number;
}

export const GET = async (req: NextRequest) => {
  try {
    const orderId = req.nextUrl.searchParams.get("order-id");
    const reator = orderId
      ? await prisma.ordens_producao.findMany({
          where: { id_ordem_producao: parseInt(orderId!) },
          select: {
            id_ordem_producao: true,
            reatores: true,
            lote_fabrico: true,
            quantidade: true,
            status_ordens_producao: true,
            produtos: true,
          },
        })
      : await prisma.ordens_producao.findMany({
          select: {
            id_ordem_producao: true,
            reatores: true,
            lote_fabrico: true,
            quantidade: true,
            status_ordens_producao: true,
            produtos: true,
          },
        });

    if (reator.length === 0) {
      return NextResponse.json(
        { message: "ordem inixistente", reator },
        { status: 406 }
      );
    }

    return NextResponse.json({ message: "OK", reator }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao devolver ordens producao" },
      { status: 503 }
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const orderId = req.nextUrl.searchParams.get("order-id");
    const reatorRecebidoPeloUser: Ireator = await req.json();

    const reator = await prisma.ordens_producao.findMany({
      where: { id_ordem_producao: parseInt(orderId!) },
      select: { id_ordem_producao: true, reatores: true, lote_fabrico: true },
    });

    if (reator.length === 0) {
      return NextResponse.json(
        { message: "ordem inixistente", reator },
        { status: 406 }
      );
    }

    await prisma.ordens_producao.update({
      where: { id_ordem_producao: parseInt(orderId!) },
      data: { reator: reatorRecebidoPeloUser.reator },
    });
    return NextResponse.json({
      message: "OK",
      reator,
      reatorDefinidoPeloUser: reatorRecebidoPeloUser.reator,
    });
  } catch (error) {}
};
