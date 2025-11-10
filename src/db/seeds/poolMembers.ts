import { db } from '@/db';
import { poolMembers } from '@/db/schema';

async function main() {
    const samplePoolMembers = [
        {
            poolId: 1,
            vesselName: 'Atlantic Star',
            contributionCb: 8500.0,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            poolId: 1,
            vesselName: 'Nordic Explorer',
            contributionCb: 6200.5,
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            poolId: 1,
            vesselName: 'Ocean Crown',
            contributionCb: -4500.0,
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            poolId: 2,
            vesselName: 'Pacific Voyager',
            contributionCb: 12000.0,
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            poolId: 2,
            vesselName: 'Maritime Pioneer',
            contributionCb: 9500.0,
            createdAt: new Date('2024-01-25').toISOString(),
        }
    ];

    await db.insert(poolMembers).values(samplePoolMembers);
    
    console.log('✅ Pool members seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});