import { NextResponse } from 'next/server';
import { db } from '../../db';
import { statusLogs, users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId, status } = await request.json();
    const now = new Date().toISOString();
    
    // Begin transaction
    await db.transaction(async (tx) => {
      // Insert status log
      await tx.insert(statusLogs).values({
        userId,
        status,
        createdAt: now,
      });

      // Update user's current status and last online time
      await tx.update(users)
        .set({ 
          isOnline: status,
          lastOnline: now 
        })
        .where(eq(users.id, userId));
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