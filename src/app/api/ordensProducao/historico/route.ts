import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";

interface POSTbody {
  ordemProducao: number;
  statusAnterior: number;
  statusNovo: number;
}

export const POST = async (req: NextRequest) => {
  try {
    const reqBody: POSTbody = await req.json();

    await prisma.transaction_ordens_producao.create({
      data: {
        ordem_producao: reqBody.ordemProducao,
        status_anterior: reqBody.statusAnterior,
        status_novo: reqBody.statusNovo,
      },
    });

    return NextResponse.json({ reqBody });
  } catch (error) {
    console.error(error);
  }
};
