const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');       // ⬅️ إضافة
const { Server } = require('socket.io'); // ⬅️ Socket.IO

dotenv.config({ path: 'config.env' });

const app = require('./app');

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", // للسماح لأي فرونت أو Postman
    methods: ["GET", "POST"] } 
});

global.io = io;

const connectedSockets = new Set();

io.on('connection', (socket) => {
  if (!connectedSockets.has(socket.id)) {
    connectedSockets.add(socket.id);
  }

  socket.on('disconnect', () => {
    if (connectedSockets.has(socket.id)) {
      connectedSockets.delete(socket.id);
    }
  });
});




mongoose.connect(process.env.LOCAL_DATABASE).then(() => {
  console.log("Connected To Database Success...🚀");
  require('./middlewares/agenda');  // مهمة الكرون ستعمل هنا
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Starting At Port ${PORT}...✨`);
});

process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Error ${err.name}| ${err.message}`);
  server.close(() => {
    console.log('Shutting Down...');
    process.exit(1);
  });
});
