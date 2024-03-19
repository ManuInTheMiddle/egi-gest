import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";

export const GET = async (req: NextRequest) => {
  try {
    const id = req.nextUrl.pathname.split("ordensProducao/")[1];

    const ordemProducao = await prisma.ordens_producao.findUnique({
      where: {
        id_ordem_producao: parseInt(id!),
      },
      select: {
        id_ordem_producao: true,
        status_ordens_producao: { select: { name: true } },
        lote_fabrico: true,
        quantidade: true,
        data_criacao: true,
        produtos: true,
        detalhes_ordens_producao: true,
      },
    });

    return NextResponse.json({ message: "OK", ordemProducao }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao devolver ordem producao" },
      { status: 503 }
    );
  }
};

export const PUT = async (req: NextRequest) => {
  console.log("fazer update  na ordem de fabrico mediate o id ");
};
