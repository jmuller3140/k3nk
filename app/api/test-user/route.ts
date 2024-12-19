import { NextResponse } from 'next/server';
import { db } from '../../db';
import { users } from '../../db/schema';

export async function POST() {
  try {
    const newUser = await db.insert(users).values({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
    }).returning();

    return NextResponse.json(newUser[0]);
  } catch (error) {
    console.error('Failed to create test user:', error);
    return NextResponse.json(
      { error: 'Failed to create test user' },
      { status: 500 }
    );
  }
} 