import * as fs from 'fs';
import * as path from 'path';

async function fetchStats() {
    console.log('📊 FETCHING OFFICIAL ADSTERRA STATS...');
    
    // 1. Load API Key
    const envPath = path.join(__dirname, '..', '.env.local');
    const env = fs.readFileSync(envPath, 'utf8');
    const apiKey = env.match(/ADSTERRA_API_KEY=([^\n\r]+)/)?.[1]?.trim();

    if (!apiKey) {
        console.error('❌ ADSTERRA_API_KEY not found in .env.local');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const url = `https://api3.adsterratools.com/publisher/stats.json?start_date=${today}&finish_date=${today}`;

    try {
        const response = await fetch(url, {
            headers: { 'X-API-Key': apiKey }
        });

        if (!response.ok) {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            return;
        }

        const data: any = await response.json();
        const stats = data.items || [];
        
        let totalImp = 0;
        let totalRev = 0;

        stats.forEach((item: any) => {
            totalImp += parseInt(item.impressions || 0);
            totalRev += parseFloat(item.revenue || 0);
        });

        console.log('\n-----------------------------------------------');
        console.log(`📅 DATE: ${today}`);
        console.log(`📈 OFFICIAL IMPRESSIONS: ${totalImp}`);
        console.log(`💰 OFFICIAL REVENUE: $${totalRev.toFixed(4)}`);
        console.log('-----------------------------------------------\n');

        if (totalRev > 0) {
            console.log('✅ VERIFIED: Revenue is actively generating.');
        } else if (totalImp > 0) {
            console.log('⚠️ VERIFIED: Impressions are tracking, but revenue is $0.00 (Pending sync).');
        } else {
            console.warn('⚠️ WARNING: No impressions found in Adsterra for today yet.');
        }

    } catch (e: any) {
        console.error('❌ Fetch failed:', e.message);
    }
}

fetchStats();
