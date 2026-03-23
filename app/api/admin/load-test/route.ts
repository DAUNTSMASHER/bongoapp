import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { totalViews, storyDuration, selectedCountry, targetUrl, headless, concurrency, adsPerBot, jobDuration } = await req.json();

    const scriptPath = path.join(process.cwd(), 'scripts', 'load-test-ga.ts');
    
    // Trigger the script in the background
    const env = {
      ...process.env,
      TOTAL_VIEWS: String(totalViews || 50),
      STORY_DURATION: String(storyDuration || 10000),
      SELECTED_COUNTRY: selectedCountry || '',
      TARGET_URL: targetUrl || 'https://www.bongochoti.com/',
      HEADLESS: headless === false ? 'false' : 'true',
      CONCURRENCY: String(concurrency || 10),
      ADS_PER_BOT: String(adsPerBot || 1),
      JOB_DURATION: String((jobDuration || 0) * 60000), // convert minutes to ms
    };

    console.log(`[Admin] Starting load test from API:`, { totalViews, selectedCountry });

    const child = spawn('npx', ['tsx', scriptPath], {
      env,
      detached: true,
      stdio: 'ignore', // Running in background
    });

    child.unref();

    return NextResponse.json({ 
      success: true, 
      message: 'Load test started in the background.' 
    });
  } catch (error) {
    console.error('[Admin API] Load test error:', error);
    return NextResponse.json({ success: false, error: 'Failed to start load test.' }, { status: 500 });
  }
}
