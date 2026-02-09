import http from 'http';
const PORT = 80;

const server = http.createServer((req, res) => {
  if (req.url === '/ingest' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        const responseHeaders = { 'Content-Type': 'application/json' };
        if (req.headers['x-correlation-id']) {
          responseHeaders['X-Correlation-Id'] = req.headers['x-correlation-id'];
        }
        res.writeHead(400, responseHeaders);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const lastName = data.lastName || '';
      const responseHeaders = { 'Content-Type': 'application/json' };
      if (req.headers['x-correlation-id']) {
        responseHeaders['X-Correlation-Id'] = req.headers['x-correlation-id'];
      }

      if (lastName.includes('Z')) {
        res.writeHead(500, responseHeaders);
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      } else if (lastName.includes('z')) {
        setTimeout(() => {
          res.writeHead(200, responseHeaders);
          res.end(JSON.stringify({ status: 'success' }));
        }, 3000);
      } else {
        const delay = Math.floor(Math.random() * (500 - 150 + 1)) + 150;
        setTimeout(() => {
          res.writeHead(200, responseHeaders);
          res.end(JSON.stringify({ status: 'success' }));
        }, delay);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Dummy ingestion service running on port ${PORT}`);
});
