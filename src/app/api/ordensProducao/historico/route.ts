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

export const GET = async (req: NextRequest) => {
  const skipPageNum = req.nextUrl.searchParams.get("skip");
  try {
    const historicoOrdens = skipPageNum
      ? await prisma.transaction_ordens_producao.findMany({
          skip: parseInt(skipPageNum),
          take: 10,
          select: {
            ordens_producao: true,
            status_ordens_producao_transaction_ordens_producao_status_anteriorTostatus_ordens_producao:
              true,
            status_ordens_producao_transaction_ordens_producao_status_novoTostatus_ordens_producao:
              true,
            timestamp: true,
          },
        })
      : await prisma.transaction_ordens_producao.findMany({
          select: {
            ordens_producao: true,
            status_ordens_producao_transaction_ordens_producao_status_anteriorTostatus_ordens_producao:
              true,
            status_ordens_producao_transaction_ordens_producao_status_novoTostatus_ordens_producao:
              true,
            timestamp: true,
          },
        });
    return NextResponse.json({ message: "OK", historicoOrdens });
  } catch (error) {
    console.error(error);
  }
};
