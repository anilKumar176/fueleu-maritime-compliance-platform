import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { eq, like, desc } from 'drizzle-orm';

const pools = sqliteTable('pools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  poolName: text('pool_name').notNull(),
  createdAt: text('created_at').notNull()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const pool = await db.select()
        .from(pools)
        .where(eq(pools.id, parseInt(id)))
        .limit(1);

      if (pool.length === 0) {
        return NextResponse.json({ 
          error: 'Pool not found',
          code: 'POOL_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(pool[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(pools);

    if (search) {
      query = query.where(like(pools.poolName, `%${search}%`));
    }

    const results = await query
      .orderBy(desc(pools.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { poolName } = body;

    if (!poolName) {
      return NextResponse.json({ 
        error: "Pool name is required",
        code: "MISSING_POOL_NAME" 
      }, { status: 400 });
    }

    if (typeof poolName !== 'string' || poolName.trim().length === 0) {
      return NextResponse.json({ 
        error: "Pool name must be a non-empty string",
        code: "INVALID_POOL_NAME" 
      }, { status: 400 });
    }

    const newPool = await db.insert(pools)
      .values({
        poolName: poolName.trim(),
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newPool[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(pools)
      .where(eq(pools.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Pool not found',
        code: 'POOL_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { poolName } = body;

    if (!poolName) {
      return NextResponse.json({ 
        error: "Pool name is required",
        code: "MISSING_POOL_NAME" 
      }, { status: 400 });
    }

    if (typeof poolName !== 'string' || poolName.trim().length === 0) {
      return NextResponse.json({ 
        error: "Pool name must be a non-empty string",
        code: "INVALID_POOL_NAME" 
      }, { status: 400 });
    }

    const updated = await db.update(pools)
      .set({
        poolName: poolName.trim()
      })
      .where(eq(pools.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(pools)
      .where(eq(pools.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Pool not found',
        code: 'POOL_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(pools)
      .where(eq(pools.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Pool deleted successfully',
      pool: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}