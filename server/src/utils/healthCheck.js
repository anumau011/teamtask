const cron = require('node-cron');

/**
 * Start a cron job that pings the health endpoint every 5 minutes
 * This keeps the server awake and prevents it from going to sleep
 */
function startHealthCheckCron() {
  // Run every 5 minutes: 0 */5 * * * *
  cron.schedule('0 */5 * * * *', async () => {
    try {
      const http = process.env.NODE_ENV === 'production' ? require('https') : require('http');
      const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;

      http.get(`${serverUrl}/health`, (res) => {
        if (res.statusCode === 200) {
          console.log(`[${new Date().toISOString()}] Health check: Server is awake ✓`);
        }
      }).on('error', (error) => {
        console.error(`[${new Date().toISOString()}] Health check failed:`, error.message);
      });
    } catch (error) {
      console.error('Error in health check cron job:', error);
    }
  });

  console.log('Health check cron job started (runs every 5 minutes)');
}

module.exports = startHealthCheckCron;
