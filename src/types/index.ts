export interface Route {
  id: number;
  routeName: string;
  vesselName: string;
  distanceNm: number;
  fuelConsumedMt: number;
  ghgIntensity: number;
  referenceGhgIntensity: number;
  complianceBalance: number;
  year: number;
  createdAt: string;
}

export interface BankingRecord {
  id: number;
  vesselName: string;
  year: number;
  bankedCb: number;
  appliedCb: number;
  remainingCb: number;
  createdAt: string;
}

export interface Pool {
  id: number;
  poolName: string;
  createdAt: string;
}

export interface PoolMember {
  id: number;
  poolId: number;
  vesselName: string;
  contributionCb: number;
  createdAt: string;
}
