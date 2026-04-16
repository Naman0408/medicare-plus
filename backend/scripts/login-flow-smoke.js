const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const API_BASE = 'http://localhost:5000';
const loginPageUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'pages', 'login.html')).href;

async function ensureHealthy() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
}

async function registerUser({ name, email, password, role, phone, extra = {} }) {
  const payload = { name, email, password, role, phone, ...extra };
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Registration failed for ${email}: ${data.error || res.status}`);
  }
  return data;
}

async function loginThroughUI(page, { email, password, role }) {
  await page.goto(loginPageUrl, { waitUntil: 'domcontentloaded' });

  if (role === 'doctor') {
    await page.click('#loginRoleTabs .role-tab[data-role="doctor"]');
  }

  await page.fill('#loginEmail', email);
  await page.fill('#loginPwd', password);
  await page.click('#loginBtn');

  await page.waitForURL(`**/dashboard-${role}.html`, { timeout: 10000 });

  const storage = await page.evaluate(() => ({
    token: localStorage.getItem('token'),
    userRole: localStorage.getItem('userRole'),
    demoRole: localStorage.getItem('demoRole'),
  }));

  if (!storage.token) {
    throw new Error(`No token stored after ${role} login`);
  }
  if (storage.userRole !== role || storage.demoRole !== role) {
    throw new Error(
      `Role mismatch in localStorage for ${role}. userRole=${storage.userRole}, demoRole=${storage.demoRole}`
    );
  }

  return {
    finalUrl: page.url(),
    tokenStored: true,
    userRole: storage.userRole,
    demoRole: storage.demoRole,
  };
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: 'msedge', headless: true });
  } catch (err) {
    throw new Error(
      `Unable to launch Edge channel for Playwright. Ensure Microsoft Edge is installed. Original error: ${err.message}`
    );
  }
}

(async () => {
  const stamp = Date.now();
  const patient = {
    email: `ui.patient.${stamp}@example.com`,
    password: 'Patient@12345',
    role: 'patient',
    name: 'UI Patient Test',
    phone: '9000000001',
  };
  const doctor = {
    email: `ui.doctor.${stamp}@example.com`,
    password: 'Doctor@12345',
    role: 'doctor',
    name: 'UI Doctor Test',
    phone: '9000000002',
    extra: {
      specialty: 'Cardiology',
      licenseNo: `LIC-${stamp}`,
      experience: 7,
      hospital: 'City Care',
      fee: 600,
    },
  };

  await ensureHealthy();
  await registerUser(patient);
  await registerUser(doctor);

  const browser = await launchBrowser();
  const context = await browser.newContext();

  try {
    const patientPage = await context.newPage();
    const patientResult = await loginThroughUI(patientPage, patient);

    const doctorPage = await context.newPage();
    const doctorResult = await loginThroughUI(doctorPage, doctor);

    console.log('UI_SIGNIN_TEST_RESULT_START');
    console.log(JSON.stringify({
      patient: {
        email: patient.email,
        ...patientResult,
      },
      doctor: {
        email: doctor.email,
        ...doctorResult,
      },
    }, null, 2));
    console.log('UI_SIGNIN_TEST_RESULT_END');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((err) => {
  console.error('UI_SIGNIN_TEST_ERROR');
  console.error(err.stack || err.message);
  process.exit(1);
});
