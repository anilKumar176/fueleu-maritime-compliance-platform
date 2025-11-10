import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { poolMembers } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(poolMembers)
        .where(eq(poolMembers.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Pool member not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const poolId = searchParams.get('poolId');

    let query = db.select().from(poolMembers);

    // Build WHERE conditions
    const conditions = [];

    if (poolId) {
      if (isNaN(parseInt(poolId))) {
        return NextResponse.json(
          { error: 'Valid poolId is required', code: 'INVALID_POOL_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(poolMembers.poolId, parseInt(poolId)));
    }

    if (search) {
      conditions.push(like(poolMembers.vesselName, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(poolMembers.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { poolId, vesselName, contributionCb } = body;

    // Validate required fields
    if (!poolId) {
      return NextResponse.json(
        { error: 'poolId is required', code: 'MISSING_POOL_ID' },
        { status: 400 }
      );
    }

    if (!vesselName || typeof vesselName !== 'string' || vesselName.trim() === '') {
      return NextResponse.json(
        { error: 'vesselName is required and must be a non-empty string', code: 'INVALID_VESSEL_NAME' },
        { status: 400 }
      );
    }

    if (contributionCb === undefined || contributionCb === null) {
      return NextResponse.json(
        { error: 'contributionCb is required', code: 'MISSING_CONTRIBUTION_CB' },
        { status: 400 }
      );
    }

    // Validate data types
    if (isNaN(parseInt(poolId.toString()))) {
      return NextResponse.json(
        { error: 'poolId must be a valid integer', code: 'INVALID_POOL_ID_TYPE' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(contributionCb.toString()))) {
      return NextResponse.json(
        { error: 'contributionCb must be a valid number', code: 'INVALID_CONTRIBUTION_CB_TYPE' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedVesselName = vesselName.trim();
    const sanitizedPoolId = parseInt(poolId.toString());
    const sanitizedContributionCb = parseFloat(contributionCb.toString());

    // Create new pool member
    const newPoolMember = await db
      .insert(poolMembers)
      .values({
        poolId: sanitizedPoolId,
        vesselName: sanitizedVesselName,
        contributionCb: sanitizedContributionCb,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newPoolMember[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(poolMembers)
      .where(eq(poolMembers.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Pool member not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with validation
    const updates: Record<string, any> = {};

    if (body.poolId !== undefined) {
      if (isNaN(parseInt(body.poolId.toString()))) {
        return NextResponse.json(
          { error: 'poolId must be a valid integer', code: 'INVALID_POOL_ID_TYPE' },
          { status: 400 }
        );
      }
      updates.poolId = parseInt(body.poolId.toString());
    }

    if (body.vesselName !== undefined) {
      if (typeof body.vesselName !== 'string' || body.vesselName.trim() === '') {
        return NextResponse.json(
          { error: 'vesselName must be a non-empty string', code: 'INVALID_VESSEL_NAME' },
          { status: 400 }
        );
      }
      updates.vesselName = body.vesselName.trim();
    }

    if (body.contributionCb !== undefined) {
      if (isNaN(parseFloat(body.contributionCb.toString()))) {
        return NextResponse.json(
          { error: 'contributionCb must be a valid number', code: 'INVALID_CONTRIBUTION_CB_TYPE' },
          { status: 400 }
        );
      }
      updates.contributionCb = parseFloat(body.contributionCb.toString());
    }

    // If no valid updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Update the record
    const updated = await db
      .update(poolMembers)
      .set(updates)
      .where(eq(poolMembers.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(poolMembers)
      .where(eq(poolMembers.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Pool member not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the record
    const deleted = await db
      .delete(poolMembers)
      .where(eq(poolMembers.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Pool member deleted successfully',
        deleted: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}