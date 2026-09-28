const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const mockSession = {
  token: 'mock-jwt-token-investigator-2026',
  user: {
    id: 'usr-investigator',
    username: 'investigator',
    full_name: 'Inspector V. K. Patel',
    email: 'investigator@police.gujarat.gov.in',
    role: 'Investigator',
    badge_number: 'GJ-INV-402',
    department: 'CID Crime & Investigation Lead',
  },
  logged_at: Date.now(),
};

async function run() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  const page = await browser.newPage();

  // 1. Capture Login Screen
  console.log('Capturing: 01_login_portal.png');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.waitForTimeout ? page.waitForTimeout(1500) : new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_login_portal.png') });

  // Authenticate by setting session & cookies
  await page.evaluate((session) => {
    localStorage.setItem('sentinelx_session', JSON.stringify(session));
    document.cookie = `sentinelx_token=${session.token}; path=/; max-age=86400; SameSite=Lax`;
  }, mockSession);

  const pagesToCapture = [
    { name: '02_command_dashboard.png', url: 'http://localhost:3000/dashboard' },
    { name: '03_vehicle_journey_reconstruction.png', url: 'http://localhost:3000/vehicles/GJ01AB1234' },
    { name: '04_live_cctv_grid.png', url: 'http://localhost:3000/live' },
    { name: '05_vms_integration.png', url: 'http://localhost:3000/vms' },
    { name: '06_alerts_and_watchlists.png', url: 'http://localhost:3000/alerts' },
    { name: '07_forensic_investigations.png', url: 'http://localhost:3000/investigations' },
    { name: '08_system_health.png', url: 'http://localhost:3000/system-health' },
    { name: '09_gis_statewide_map.png', url: 'http://localhost:3000/map' },
    { name: '10_audit_logs.png', url: 'http://localhost:3000/audit-logs' },
    { name: '11_rc_challan_vahan.png', url: 'http://localhost:3000/rc-challan' },
  ];

  for (const item of pagesToCapture) {
    console.log(`Navigating to ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(OUTPUT_DIR, item.name) });
      console.log(`Saved: ${item.name}`);
    } catch (e) {
      console.error(`Error capturing ${item.name}:`, e.message);
      // Try fallback screenshot anyway
      try {
        await page.screenshot({ path: path.join(OUTPUT_DIR, item.name) });
      } catch (err) {}
    }
  }

  await browser.close();
  console.log('Finished capturing all screenshots successfully!');
}

run().catch((err) => {
  console.error('Script failure:', err);
  process.exit(1);
});
