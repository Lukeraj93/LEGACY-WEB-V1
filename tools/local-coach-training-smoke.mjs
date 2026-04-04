import { chromium } from 'playwright-core';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'http://127.0.0.1:8888';
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDAzNTEsImV4cCI6MjA2MjAxNjM1MX0.3sXPSMNSZvNghYv62nyqD8HI4q4-g2-ihZ9oNOqZ8Mo';
const COACH_EMAIL = 'coach.local@legacy.local';
const COACH_PASSWORD = process.env.LOCAL_COACH_PASSWORD || 'LegacyLocal!123';

async function main() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  const consoleMessages = [];
  const pageErrors = [];
  const failedRequests = [];
  const functionResponses = [];

  page.on('console', (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', (err) => pageErrors.push(String(err && err.stack || err)));
  page.on('requestfailed', (req) => {
    failedRequests.push({ url: req.url(), method: req.method(), failure: req.failure() && req.failure().errorText || '' });
  });
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/.netlify/functions/')) {
      functionResponses.push({ url, status: res.status() });
    }
  });

  await page.goto(BASE_URL + '/login/coach.html', { waitUntil: 'domcontentloaded' });
  await page.fill('#coach-login-email', COACH_EMAIL);
  await page.fill('input[name="coachPassword"]', COACH_PASSWORD);
  await Promise.all([
    page.waitForURL('**/coach-dashboard.html', { timeout: 30000, waitUntil: 'domcontentloaded' }),
    page.click('#coach-login-form button[type="submit"]'),
  ]);

  await page.goto(BASE_URL + '/coach-training.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('#coach-program-client option').length > 1, { timeout: 30000 });
  await page.waitForTimeout(1000);

  const initial = await page.evaluate(() => {
    const status = document.querySelector('#coach-programming-status')?.textContent?.trim() || '';
    const clientOptions = Array.from(document.querySelectorAll('#coach-program-client option')).map((opt) => ({
      value: opt.value,
      text: opt.textContent?.trim() || '',
    }));
    const startDate = document.querySelector('#coach-program-start-date')?.value || '';
    const activeStep = document.querySelector('[data-coach-training-step].is-active')?.textContent?.trim() || '';
    const splitDays = document.querySelectorAll('#coach-program-template-days .coach-training-day-card').length;
    return { status, clientOptions, startDate, activeStep, splitDays };
  });

  const clientOption = initial.clientOptions.find((option) => option.value && option.text.trim() !== 'Select client');
  if (!clientOption) {
    throw new Error('Local client option not found. Options: ' + JSON.stringify(initial.clientOptions));
  }

  const uniqueTitle = 'Local Smoke Program ' + Date.now();
  await page.selectOption('#coach-program-client', clientOption.value);
  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('input[name="objective"]', 'Local end-to-end smoke objective');
  await page.fill('input[name="description"]', 'Local smoke test program description');
  await page.fill('input[name="assignmentTitle"]', 'Local Smoke Assignment');

  await page.click('.coach-training-step-panel.is-active [data-coach-training-nav="next"]');
  await page.waitForTimeout(500);
  const splitState = await page.evaluate(() => ({
    activeStep: document.querySelector('[data-coach-training-step].is-active')?.textContent?.trim() || '',
    splitDays: document.querySelectorAll('#coach-program-template-days .coach-training-day-card').length,
    restDays: document.querySelectorAll('#coach-program-template-days .coach-training-day-card--rest').length,
  }));

  await page.click('.coach-training-step-panel.is-active [data-coach-training-nav="next"]');
  await page.waitForTimeout(500);
  const exerciseState = await page.evaluate(() => ({
    activeStep: document.querySelector('[data-coach-training-step].is-active')?.textContent?.trim() || '',
    exerciseDays: document.querySelectorAll('#coach-training-exercise-days .coach-training-day-card').length,
    exerciseRows: document.querySelectorAll('#coach-training-exercise-days .coach-training-exercise-row').length,
  }));

  await page.fill('.coach-training-step-panel.is-active input[data-exercise-field="blockLabel"]', 'A1');
  await page.fill('.coach-training-step-panel.is-active input[data-exercise-field="name"]', 'Goblet Squat');
  await page.fill('.coach-training-step-panel.is-active input[data-exercise-field="sets"]', '4');
  await page.fill('.coach-training-step-panel.is-active input[data-exercise-field="repTarget"]', '8');
  await page.fill('.coach-training-step-panel.is-active input[data-exercise-field="intensity"]', 'RPE 7');

  await page.click('.coach-training-step-panel.is-active [data-coach-training-nav="next"]');
  await page.waitForTimeout(500);
  const generateStateBefore = await page.evaluate(() => ({
    activeStep: document.querySelector('[data-coach-training-step].is-active')?.textContent?.trim() || '',
    feedback: document.querySelector('#coach-training-generate-feedback')?.textContent?.trim() || '',
  }));

  await page.fill('input[name="assignmentObjective"]', 'Build local confidence');
  await page.fill('textarea[name="assignmentNotes"]', 'Smoke run');

  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/save-program-template') && res.status() < 500, { timeout: 30000 }),
    page.waitForResponse((res) => res.url().includes('/assign-client-program') && res.status() < 500, { timeout: 30000 }),
    page.click('#coach-training-generate-program'),
  ]);
  await page.waitForTimeout(1500);

  const generateStateAfter = await page.evaluate(() => ({
    feedback: document.querySelector('#coach-training-generate-feedback')?.textContent?.trim() || '',
    status: document.querySelector('#coach-programming-status')?.textContent?.trim() || '',
  }));

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: COACH_EMAIL,
    password: COACH_PASSWORD,
  });
  if (authError) {
    throw authError;
  }
  const token = authData?.session?.access_token;
  const verifyResponse = await fetch(`${BASE_URL}/.netlify/functions/load-planner-data?refresh=1`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const verifyPayload = await verifyResponse.json();
  const localPlannerPayload = {
    status: verifyResponse.status,
    templates: Array.isArray(verifyPayload?.data?.templates) ? verifyPayload.data.templates.length : 0,
    rosterProfiles: Array.isArray(verifyPayload?.data?.rosterProfiles) ? verifyPayload.data.rosterProfiles.length : 0,
    programAssignments: Array.isArray(verifyPayload?.data?.programAssignments) ? verifyPayload.data.programAssignments.length : 0,
    latestTemplate: Array.isArray(verifyPayload?.data?.templates) ? verifyPayload.data.templates[0]?.title || '' : '',
    latestAssignment: Array.isArray(verifyPayload?.data?.programAssignments) ? verifyPayload.data.programAssignments[0]?.title || '' : '',
  };

  await page.screenshot({ path: '/tmp/local-coach-training-smoke.png', fullPage: true });
  await browser.close();

  console.log(JSON.stringify({
    ok: true,
    initial,
    splitState,
    exerciseState,
    generateStateBefore,
    generateStateAfter,
    localPlannerPayload,
    consoleMessages,
    pageErrors,
    failedRequests,
    functionResponses,
    screenshot: '/tmp/local-coach-training-smoke.png'
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: String(error && error.stack || error) }, null, 2));
  process.exit(1);
});
