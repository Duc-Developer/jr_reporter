const express = require('express');
const path = require('path');
const { getWorkLog } = require('./report_utils.js');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/data', async (req, res) => {
  const results = await getWorkLog();
  res.json(results);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3006;
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  const open = (await import('open')).default;
  open(`http://localhost:${PORT}`, { app: { name: 'chrome' } });
});