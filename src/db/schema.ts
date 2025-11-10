import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Add FuelEU Maritime compliance tables
export const routes = sqliteTable('routes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  routeName: text('route_name').notNull(),
  vesselName: text('vessel_name').notNull(),
  distanceNm: real('distance_nm').notNull(),
  fuelConsumedMt: real('fuel_consumed_mt').notNull(),
  ghgIntensity: real('ghg_intensity').notNull(),
  referenceGhgIntensity: real('reference_ghg_intensity').notNull(),
  complianceBalance: real('compliance_balance').notNull(),
  year: integer('year').notNull(),
  createdAt: text('created_at').notNull(),
});

export const bankingRecords = sqliteTable('banking_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vesselName: text('vessel_name').notNull(),
  year: integer('year').notNull(),
  bankedCb: real('banked_cb').notNull(),
  appliedCb: real('applied_cb').notNull(),
  remainingCb: real('remaining_cb').notNull(),
  createdAt: text('created_at').notNull(),
});

export const pools = sqliteTable('pools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  poolName: text('pool_name').notNull(),
  createdAt: text('created_at').notNull(),
});

export const poolMembers = sqliteTable('pool_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  poolId: integer('pool_id').references(() => pools.id),
  vesselName: text('vessel_name').notNull(),
  contributionCb: real('contribution_cb').notNull(),
  createdAt: text('created_at').notNull(),
});