import { NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/video-cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stats = getCacheStats();
  return NextResponse.json(stats);
}
