// Mein Tracker — iOS Home Screen Widget

const SUPABASE_URL = 'https://ylfmmuxcsarmylwmzmby.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZm1tdXhjc2FybXlsd216bWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzI0MzIsImV4cCI6MjEwMjM0ODQzMn0.v41jjNE9qZn9n5g06kLkH3wtGspl6FPVFvej6XG5amU'


const TRACKERS = [
  { table: 'sleep_logs', field: 'hours', label: 'Sleep', unit: 'hrs', color: '#8FA3F3' },
  { table: 'water_logs', field: 'liters', label: 'Water', unit: 'L', color: '#6FCF97' },
  { table: 'study_logs', field: 'hours', label: 'Study', unit: 'hrs', color: '#F2C94C' },
]

const BG_COLOR = new Color('#171717')
const TEXT_COLOR = new Color('#F2F0EB')
const MUTED_COLOR = new Color('#A3A099')
const ACCENT_COLOR = new Color('#D97757')

async function getCredentials() {
  let email = Keychain.contains('mt_email') ? Keychain.get('mt_email') : null
  let password = Keychain.contains('mt_password') ? Keychain.get('mt_password') : null

  if (!email || !password) {
    const alert = new Alert()
    alert.title = 'Mein Tracker Login'
    alert.message = 'Enter your app login once — stored securely on this device only.'
    alert.addTextField('Email')
    alert.addSecureTextField('Password')
    alert.addAction('Save')
    alert.addCancelAction('Cancel')

    const result = await alert.presentAlert()
    if (result === -1) throw new Error('Login cancelled')

    email = alert.textFieldValue(0)
    password = alert.textFieldValue(1)

    Keychain.set('mt_email', email)
    Keychain.set('mt_password', password)
  }

  return { email, password }
}

async function login(email, password) {
  const req = new Request(`${SUPABASE_URL}/auth/v1/token?grant_type=password`)
  req.method = 'POST'
  req.headers = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  }
  req.body = JSON.stringify({ email, password })

  const res = await req.loadJSON()
  if (!res.access_token) {
    throw new Error(res.error_description || 'Login failed — check email/password')
  }
  return res.access_token
}

function monthBounds() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const iso = (d) => d.toISOString().slice(0, 10)
  return { start: iso(start), end: iso(end) }
}

async function fetchLogs(table, field, accessToken) {
  const { start, end } = monthBounds()
  const url =
    `${SUPABASE_URL}/rest/v1/${table}` +
    `?select=${field},log_date` +
    `&log_date=gte.${start}&log_date=lt.${end}` +
    `&order=log_date.desc`

  const req = new Request(url)
  req.headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
  }

  const rows = await req.loadJSON()
  return Array.isArray(rows) ? rows : []
}

// Same streak logic as the web app: consecutive days ending today
// (or yesterday, if today isn't logged yet).
function computeStreak(dateStrings) {
  const dateSet = new Set(dateStrings)
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  const iso = (d) => d.toISOString().slice(0, 10)

  if (!dateSet.has(iso(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (dateSet.has(iso(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

async function fetchAllStats(accessToken) {
  const results = []
  for (const tracker of TRACKERS) {
    const rows = await fetchLogs(tracker.table, tracker.field, accessToken)
    const count = rows.length
    const average = count
      ? rows.reduce((sum, r) => sum + Number(r[tracker.field]), 0) / count
      : 0
    const streak = computeStreak(rows.map((r) => r.log_date))
    results.push({ ...tracker, average, count, streak })
  }
  return results
}

function buildWidget(stats, errorMessage) {
  const widget = new ListWidget()
  widget.backgroundColor = BG_COLOR
  widget.setPadding(14, 16, 14, 16)

  const header = widget.addText('Mein Tracker')
  header.font = Font.semiboldSystemFont(13)
  header.textColor = ACCENT_COLOR
  widget.addSpacer(8)

  if (errorMessage) {
    const errText = widget.addText(errorMessage)
    errText.font = Font.systemFont(11)
    errText.textColor = MUTED_COLOR
    Script.setWidget(widget)
    return
  }

  stats.forEach((s, i) => {
    const row = widget.addStack()
    row.centerAlignContent()

    const dot = row.addText('●')
    dot.font = Font.systemFont(10)
    dot.textColor = new Color(s.color)
    row.addSpacer(6)

    const label = row.addText(s.label)
    label.font = Font.systemFont(13)
    label.textColor = TEXT_COLOR

    row.addSpacer()

    const valueText = s.count === 0 ? '—' : `${s.average.toFixed(1)} ${s.unit}`
    const value = row.addText(valueText)
    value.font = Font.semiboldSystemFont(13)
    value.textColor = TEXT_COLOR

    if (s.streak > 0) {
      row.addSpacer(6)
      const streak = row.addText(`🔥${s.streak}`)
      streak.font = Font.systemFont(11)
      streak.textColor = MUTED_COLOR
    }

    if (i < stats.length - 1) widget.addSpacer(10)
  })

  widget.addSpacer(10)
  const footer = widget.addText('This month · tap to open app')
  footer.font = Font.systemFont(9)
  footer.textColor = MUTED_COLOR

  widget.url = 'https://YOUR-USERNAME.github.io/YOUR-REPO/#/dashboard' // <-- fill in
  widget.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000) // refresh in ~30 min


  Script.setWidget(widget)
}

async function run() {
  try {
    console.log('Step 1: getting credentials...')
    const { email, password } = await getCredentials()
    console.log(`Step 1 done. Email: ${email}`)

    console.log('Step 2: logging in to Supabase...')
    const accessToken = await login(email, password)
    console.log('Step 2 done. Got access token: ' + (accessToken ? 'yes' : 'no'))

    console.log('Step 3: fetching stats...')
    const stats = await fetchAllStats(accessToken)
    console.log('Step 3 done. Stats: ' + JSON.stringify(stats))

    console.log('Step 4: building widget...')
    buildWidget(stats, null)
    console.log('Step 4 done. Widget should now preview below.')
  } catch (err) {
    console.error('FAILED: ' + err.message)
    buildWidget([], `Error: ${err.message}`)
  }
  Script.complete()
}

await run()
