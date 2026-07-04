async function checkLogs() {
  try {
    const res = await fetch('https://kitkarttest.vercel.app/api/shiprocket/view-logs');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Logs:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
checkLogs();
