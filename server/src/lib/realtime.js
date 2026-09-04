const clients = new Set();

function addClient(res) {
  clients.add(res);
  res.on('close', () => clients.delete(res));
}

function publishChange() {
  const message = `event: data-change\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`;
  for (const client of clients) {
    try {
      client.write(message);
    } catch {
      clients.delete(client);
    }
  }
}

function sendHeartbeat() {
  for (const client of clients) {
    try {
      client.write(': heartbeat\n\n');
    } catch {
      clients.delete(client);
    }
  }
}

const heartbeat = setInterval(sendHeartbeat, 25000);
heartbeat.unref?.();

module.exports = { addClient, publishChange };