import { db } from '@/db';
import { bankingRecords } from '@/db/schema';

async function main() {
    const sampleBankingRecords = [
        {
            vesselName: 'Atlantic Star',
            year: 2024,
            bankedCb: 0,
            appliedCb: 0,
            remainingCb: 12500.5,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            vesselName: 'Pacific Voyager',
            year: 2024,
            bankedCb: 8000.0,
            appliedCb: 3000.0,
            remainingCb: 5000.0,
            createdAt: new Date('2024-02-10').toISOString(),
        },
        {
            vesselName: 'Nordic Explorer',
            year: 2025,
            bankedCb: 5000.0,
            appliedCb: 5000.0,
            remainingCb: 0,
            createdAt: new Date('2025-01-05').toISOString(),
        },
        {
            vesselName: 'Ocean Crown',
            year: 2024,
            bankedCb: 0,
            appliedCb: 0,
            remainingCb: -8500.3,
            createdAt: new Date('2024-03-20').toISOString(),
        },
        {
            vesselName: 'Maritime Pioneer',
            year: 2025,
            bankedCb: 15000.0,
            appliedCb: 2000.0,
            remainingCb: 13000.0,
            createdAt: new Date('2025-01-12').toISOString(),
        },
        {
            vesselName: 'Atlantic Star',
            year: 2025,
            bankedCb: 12500.5,
            appliedCb: 4000.0,
            remainingCb: 8500.5,
            createdAt: new Date('2025-01-20').toISOString(),
        }
    ];

    await db.insert(bankingRecords).values(sampleBankingRecords);
    
    console.log('✅ Banking records seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});