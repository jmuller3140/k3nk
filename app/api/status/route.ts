import { NextResponse } from 'next/server';
import { db } from '../../db';
import { statusLogs } from '../../db/schema';

export async function POST(request: Request) {
  try {
    const { userId, status } = await request.json();
    
    await db.insert(statusLogs).values({
      userId,
      status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
} 