// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const SCADA_BASE_URL = process.env.SCADA_BASE_URL || 'http://192.168.1.251:8080';
    
    // Test connection to SCADA backend
    const response = await fetch(`${SCADA_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const scadaHealth = response.ok ? 'healthy' : 'unhealthy';
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        nextjs: 'healthy',
        scada: scadaHealth,
      },
      version: '1.0.0'
    }, { status: 200 });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        nextjs: 'healthy',
        scada: 'unhealthy',
      },
      error: 'SCADA connection failed'
    }, { status: 503 });
  }
}

// Optional: Handle other HTTP methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })}