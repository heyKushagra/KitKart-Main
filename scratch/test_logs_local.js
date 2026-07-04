async function testLocalLog() {
  try {
    const res = await fetch('http://localhost:3000/api/shiprocket/products', {
      headers: { 'X-Api-Key': 'eifpUTzeesakx5cH' }
    });
    console.log('Local Products Status:', res.status);
    
    const resLogs = await fetch('http://localhost:3000/api/shiprocket/view-logs');
    const dataLogs = await resLogs.json();
    console.log('Logs after local call:', JSON.stringify(dataLogs, null, 2));
  } catch (e) {
    console.error(e);
  }
}
testLocalLog();
