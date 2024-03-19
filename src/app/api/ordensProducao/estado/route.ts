import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";
interface Iestado {
  estado: number;
}

export const PATCH = async (req: NextRequest) => {
  try {
    const ordemProducaoId = req.nextUrl.searchParams.get("order-id");

    const estadoRecebidoPeloUser: Iestado = await req.json();

    const estado = await prisma.ordens_producao.findMany({
      where: { id_ordem_producao: parseInt(ordemProducaoId!) },
      select: {
        status_ordens_producao: { select: { name: true } },
        id_ordem_producao: true,
        lote_fabrico: true,
        status: true,
      },
    });
    if (estado.length === 0) {
      return NextResponse.json(
        { message: "ordem inixistente", estado },
        { status: 406 }
      );
    }

    await prisma.ordens_producao.update({
      where: { id_ordem_producao: parseInt(ordemProducaoId!) },
      data: { status: estadoRecebidoPeloUser.estado },
    });

    const estadoUpdated = await prisma.ordens_producao.findMany({
      where: { id_ordem_producao: parseInt(ordemProducaoId!) },
      select: {
        status_ordens_producao: true,
        id_ordem_producao: true,
        lote_fabrico: true,
        status: true,
      },
    });
    return NextResponse.json(
      {
        message: "OK",
        estadoAnterior: estado,
        estadoNovo: estadoUpdated,
        requestBody: estadoRecebidoPeloUser,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Erro ao devolver ordens producao ${error}` },
      { status: 503 }
    );
  }
};
