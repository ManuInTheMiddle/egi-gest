import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/db";
export const GET = async (req: NextRequest) => {
  try {
    const ordensProducao = await prisma.ordens_producao.findMany({
      select: {
        id_ordem_producao: true,
        status_ordens_producao: true,
        lote_fabrico: true,
        quantidade: true,
        data_criacao: true,
        produtos: true,
        detalhes_ordens_producao: true,
      },
    });

    return NextResponse.json(
      { message: "OK", ordensProducao },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao devolver ordens producao" },
      { status: 503 }
    );
  }
};
