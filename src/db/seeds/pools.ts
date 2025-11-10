import { db } from '@/db';
import { pools } from '@/db/schema';

async function main() {
    const samplePools = [
        {
            poolName: 'European Shipping Alliance',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            poolName: 'Asia-Pacific Maritime Pool',
            createdAt: new Date('2024-02-01').toISOString(),
        }
    ];

    await db.insert(pools).values(samplePools);
    
    console.log('✅ Pools seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});