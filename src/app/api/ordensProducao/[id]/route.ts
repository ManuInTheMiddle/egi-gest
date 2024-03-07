import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";

export const GET = async (req: NextRequest) => {
  try {
    const id = req.nextUrl.pathname.split("ordensProducao/")[1];
    const ordemProducao = await prisma.ordens_producao.findUnique({
      where: {
        id_ordem_producao: parseInt(id!),
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
