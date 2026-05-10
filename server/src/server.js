require('dotenv').config();
const app = require('./app');
const connectDatabase = require('./config/database');
const startHealthCheckCron = require('./utils/healthCheck');
const { User, Project, ProjectMember, Task } = require('./models');

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    await Promise.all([User.init(), Project.init(), ProjectMember.init(), Task.init()]);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      startHealthCheckCron();
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
