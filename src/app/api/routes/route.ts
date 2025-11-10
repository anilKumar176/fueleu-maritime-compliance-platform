import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { routes } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID' 
          },
          { status: 400 }
        );
      }

      const route = await db.select()
        .from(routes)
        .where(eq(routes.id, parseInt(id)))
        .limit(1);

      if (route.length === 0) {
        return NextResponse.json(
          { error: 'Route not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(route[0], { status: 200 });
    }

    // List with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const year = searchParams.get('year');

    let query = db.select().from(routes);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(routes.routeName, `%${search}%`),
          like(routes.vesselName, `%${search}%`)
        )
      );
    }

    if (year) {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        conditions.push(eq(routes.year, yearInt));
      }
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query
      .orderBy(desc(routes.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      routeName,
      vesselName,
      distanceNm,
      fuelConsumedMt,
      ghgIntensity,
      referenceGhgIntensity,
      complianceBalance,
      year
    } = body;

    // Validate required fields
    if (!routeName || typeof routeName !== 'string' || !routeName.trim()) {
      return NextResponse.json(
        { 
          error: 'Route name is required and must be a non-empty string',
          code: 'MISSING_ROUTE_NAME' 
        },
        { status: 400 }
      );
    }

    if (!vesselName || typeof vesselName !== 'string' || !vesselName.trim()) {
      return NextResponse.json(
        { 
          error: 'Vessel name is required and must be a non-empty string',
          code: 'MISSING_VESSEL_NAME' 
        },
        { status: 400 }
      );
    }

    if (distanceNm === undefined || distanceNm === null || isNaN(parseFloat(distanceNm))) {
      return NextResponse.json(
        { 
          error: 'Distance (NM) is required and must be a valid number',
          code: 'INVALID_DISTANCE' 
        },
        { status: 400 }
      );
    }

    if (fuelConsumedMt === undefined || fuelConsumedMt === null || isNaN(parseFloat(fuelConsumedMt))) {
      return NextResponse.json(
        { 
          error: 'Fuel consumed (MT) is required and must be a valid number',
          code: 'INVALID_FUEL_CONSUMED' 
        },
        { status: 400 }
      );
    }

    if (ghgIntensity === undefined || ghgIntensity === null || isNaN(parseFloat(ghgIntensity))) {
      return NextResponse.json(
        { 
          error: 'GHG intensity is required and must be a valid number',
          code: 'INVALID_GHG_INTENSITY' 
        },
        { status: 400 }
      );
    }

    if (referenceGhgIntensity === undefined || referenceGhgIntensity === null || isNaN(parseFloat(referenceGhgIntensity))) {
      return NextResponse.json(
        { 
          error: 'Reference GHG intensity is required and must be a valid number',
          code: 'INVALID_REFERENCE_GHG_INTENSITY' 
        },
        { status: 400 }
      );
    }

    if (complianceBalance === undefined || complianceBalance === null || isNaN(parseFloat(complianceBalance))) {
      return NextResponse.json(
        { 
          error: 'Compliance balance is required and must be a valid number',
          code: 'INVALID_COMPLIANCE_BALANCE' 
        },
        { status: 400 }
      );
    }

    if (!year || isNaN(parseInt(year))) {
      return NextResponse.json(
        { 
          error: 'Year is required and must be a valid integer',
          code: 'INVALID_YEAR' 
        },
        { status: 400 }
      );
    }

    const newRoute = await db.insert(routes)
      .values({
        routeName: routeName.trim(),
        vesselName: vesselName.trim(),
        distanceNm: parseFloat(distanceNm),
        fuelConsumedMt: parseFloat(fuelConsumedMt),
        ghgIntensity: parseFloat(ghgIntensity),
        referenceGhgIntensity: parseFloat(referenceGhgIntensity),
        complianceBalance: parseFloat(complianceBalance),
        year: parseInt(year),
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newRoute[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if route exists
    const existingRoute = await db.select()
      .from(routes)
      .where(eq(routes.id, parseInt(id)))
      .limit(1);

    if (existingRoute.length === 0) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    // Validate and add fields if provided
    if (body.routeName !== undefined) {
      if (typeof body.routeName !== 'string' || !body.routeName.trim()) {
        return NextResponse.json(
          { 
            error: 'Route name must be a non-empty string',
            code: 'INVALID_ROUTE_NAME' 
          },
          { status: 400 }
        );
      }
      updateData.routeName = body.routeName.trim();
    }

    if (body.vesselName !== undefined) {
      if (typeof body.vesselName !== 'string' || !body.vesselName.trim()) {
        return NextResponse.json(
          { 
            error: 'Vessel name must be a non-empty string',
            code: 'INVALID_VESSEL_NAME' 
          },
          { status: 400 }
        );
      }
      updateData.vesselName = body.vesselName.trim();
    }

    if (body.distanceNm !== undefined) {
      if (isNaN(parseFloat(body.distanceNm))) {
        return NextResponse.json(
          { 
            error: 'Distance (NM) must be a valid number',
            code: 'INVALID_DISTANCE' 
          },
          { status: 400 }
        );
      }
      updateData.distanceNm = parseFloat(body.distanceNm);
    }

    if (body.fuelConsumedMt !== undefined) {
      if (isNaN(parseFloat(body.fuelConsumedMt))) {
        return NextResponse.json(
          { 
            error: 'Fuel consumed (MT) must be a valid number',
            code: 'INVALID_FUEL_CONSUMED' 
          },
          { status: 400 }
        );
      }
      updateData.fuelConsumedMt = parseFloat(body.fuelConsumedMt);
    }

    if (body.ghgIntensity !== undefined) {
      if (isNaN(parseFloat(body.ghgIntensity))) {
        return NextResponse.json(
          { 
            error: 'GHG intensity must be a valid number',
            code: 'INVALID_GHG_INTENSITY' 
          },
          { status: 400 }
        );
      }
      updateData.ghgIntensity = parseFloat(body.ghgIntensity);
    }

    if (body.referenceGhgIntensity !== undefined) {
      if (isNaN(parseFloat(body.referenceGhgIntensity))) {
        return NextResponse.json(
          { 
            error: 'Reference GHG intensity must be a valid number',
            code: 'INVALID_REFERENCE_GHG_INTENSITY' 
          },
          { status: 400 }
        );
      }
      updateData.referenceGhgIntensity = parseFloat(body.referenceGhgIntensity);
    }

    if (body.complianceBalance !== undefined) {
      if (isNaN(parseFloat(body.complianceBalance))) {
        return NextResponse.json(
          { 
            error: 'Compliance balance must be a valid number',
            code: 'INVALID_COMPLIANCE_BALANCE' 
          },
          { status: 400 }
        );
      }
      updateData.complianceBalance = parseFloat(body.complianceBalance);
    }

    if (body.year !== undefined) {
      if (isNaN(parseInt(body.year))) {
        return NextResponse.json(
          { 
            error: 'Year must be a valid integer',
            code: 'INVALID_YEAR' 
          },
          { status: 400 }
        );
      }
      updateData.year = parseInt(body.year);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid fields provided for update',
          code: 'NO_UPDATE_FIELDS' 
        },
        { status: 400 }
      );
    }

    const updated = await db.update(routes)
      .set(updateData)
      .where(eq(routes.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if route exists
    const existingRoute = await db.select()
      .from(routes)
      .where(eq(routes.id, parseInt(id)))
      .limit(1);

    if (existingRoute.length === 0) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    const deleted = await db.delete(routes)
      .where(eq(routes.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Route deleted successfully',
        deletedRoute: deleted[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}