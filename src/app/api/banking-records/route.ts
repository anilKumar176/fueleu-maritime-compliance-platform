import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { eq, like, and, or, desc } from 'drizzle-orm';

// Define the bankingRecords table schema
const bankingRecords = sqliteTable('banking_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vesselName: text('vessel_name').notNull(),
  year: integer('year').notNull(),
  bankedCb: real('banked_cb').notNull(),
  appliedCb: real('applied_cb').notNull(),
  remainingCb: real('remaining_cb').notNull(),
  createdAt: text('created_at').notNull()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(bankingRecords)
        .where(eq(bankingRecords.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Banking record not found',
          code: "RECORD_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const yearFilter = searchParams.get('year');
    const vesselFilter = searchParams.get('vessel');

    let query = db.select().from(bankingRecords);

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(like(bankingRecords.vesselName, `%${search}%`));
    }

    if (yearFilter) {
      const year = parseInt(yearFilter);
      if (!isNaN(year)) {
        conditions.push(eq(bankingRecords.year, year));
      }
    }

    if (vesselFilter) {
      conditions.push(like(bankingRecords.vesselName, `%${vesselFilter}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(bankingRecords.createdAt))
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
    const { vesselName, year, bankedCb, appliedCb, remainingCb } = body;

    // Validate required fields
    if (!vesselName || vesselName.trim() === '') {
      return NextResponse.json({ 
        error: "vesselName is required",
        code: "MISSING_VESSEL_NAME" 
      }, { status: 400 });
    }

    if (year === undefined || year === null) {
      return NextResponse.json({ 
        error: "year is required",
        code: "MISSING_YEAR" 
      }, { status: 400 });
    }

    if (bankedCb === undefined || bankedCb === null) {
      return NextResponse.json({ 
        error: "bankedCb is required",
        code: "MISSING_BANKED_CB" 
      }, { status: 400 });
    }

    if (appliedCb === undefined || appliedCb === null) {
      return NextResponse.json({ 
        error: "appliedCb is required",
        code: "MISSING_APPLIED_CB" 
      }, { status: 400 });
    }

    if (remainingCb === undefined || remainingCb === null) {
      return NextResponse.json({ 
        error: "remainingCb is required",
        code: "MISSING_REMAINING_CB" 
      }, { status: 400 });
    }

    // Validate numeric fields
    const parsedYear = parseInt(year);
    if (isNaN(parsedYear)) {
      return NextResponse.json({ 
        error: "year must be a valid integer",
        code: "INVALID_YEAR" 
      }, { status: 400 });
    }

    const parsedBankedCb = parseFloat(bankedCb);
    if (isNaN(parsedBankedCb)) {
      return NextResponse.json({ 
        error: "bankedCb must be a valid number",
        code: "INVALID_BANKED_CB" 
      }, { status: 400 });
    }

    const parsedAppliedCb = parseFloat(appliedCb);
    if (isNaN(parsedAppliedCb)) {
      return NextResponse.json({ 
        error: "appliedCb must be a valid number",
        code: "INVALID_APPLIED_CB" 
      }, { status: 400 });
    }

    const parsedRemainingCb = parseFloat(remainingCb);
    if (isNaN(parsedRemainingCb)) {
      return NextResponse.json({ 
        error: "remainingCb must be a valid number",
        code: "INVALID_REMAINING_CB" 
      }, { status: 400 });
    }

    // Create new banking record
    const newRecord = await db.insert(bankingRecords)
      .values({
        vesselName: vesselName.trim(),
        year: parsedYear,
        bankedCb: parsedBankedCb,
        appliedCb: parsedAppliedCb,
        remainingCb: parsedRemainingCb,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

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

    // Check if record exists
    const existingRecord = await db.select()
      .from(bankingRecords)
      .where(eq(bankingRecords.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Banking record not found',
        code: "RECORD_NOT_FOUND" 
      }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and update vesselName
    if (body.vesselName !== undefined) {
      if (body.vesselName.trim() === '') {
        return NextResponse.json({ 
          error: "vesselName cannot be empty",
          code: "INVALID_VESSEL_NAME" 
        }, { status: 400 });
      }
      updates.vesselName = body.vesselName.trim();
    }

    // Validate and update year
    if (body.year !== undefined) {
      const parsedYear = parseInt(body.year);
      if (isNaN(parsedYear)) {
        return NextResponse.json({ 
          error: "year must be a valid integer",
          code: "INVALID_YEAR" 
        }, { status: 400 });
      }
      updates.year = parsedYear;
    }

    // Validate and update bankedCb
    if (body.bankedCb !== undefined) {
      const parsedBankedCb = parseFloat(body.bankedCb);
      if (isNaN(parsedBankedCb)) {
        return NextResponse.json({ 
          error: "bankedCb must be a valid number",
          code: "INVALID_BANKED_CB" 
        }, { status: 400 });
      }
      updates.bankedCb = parsedBankedCb;
    }

    // Validate and update appliedCb
    if (body.appliedCb !== undefined) {
      const parsedAppliedCb = parseFloat(body.appliedCb);
      if (isNaN(parsedAppliedCb)) {
        return NextResponse.json({ 
          error: "appliedCb must be a valid number",
          code: "INVALID_APPLIED_CB" 
        }, { status: 400 });
      }
      updates.appliedCb = parsedAppliedCb;
    }

    // Validate and update remainingCb
    if (body.remainingCb !== undefined) {
      const parsedRemainingCb = parseFloat(body.remainingCb);
      if (isNaN(parsedRemainingCb)) {
        return NextResponse.json({ 
          error: "remainingCb must be a valid number",
          code: "INVALID_REMAINING_CB" 
        }, { status: 400 });
      }
      updates.remainingCb = parsedRemainingCb;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATES" 
      }, { status: 400 });
    }

    const updated = await db.update(bankingRecords)
      .set(updates)
      .where(eq(bankingRecords.id, parseInt(id)))
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

    // Check if record exists
    const existingRecord = await db.select()
      .from(bankingRecords)
      .where(eq(bankingRecords.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Banking record not found',
        code: "RECORD_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(bankingRecords)
      .where(eq(bankingRecords.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Banking record deleted successfully',
      record: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}