const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const WebSocket = require('ws'); // ✅ مكتبة WebSocket

dotenv.config({ path: 'config.env' });

const app = require('./app');

// 🟡 1. أنشئ سيرفر HTTP عادي
const server = http.createServer(app);

// 🟡 2. أنشئ WebSocket Server على نفس السيرفر
const wss = new WebSocket.Server({ server, path: '/notifications' }); // ⬅️ مهم: نفس الـ path الذي يستخدمه الفرونت

// 🟡 3. خزن الاتصالات المفتوحة
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('🟢 New WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('🔴 WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('message', (message) => {
    console.log('📩 Received from client:', message.toString());
  });
});

// 🟡 4. دالة لبث إشعارات لجميع العملاء المتصلين
function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// 🟡 5. اجعلها متوفرة عالمياً (يمكن استخدامها في ملفات أخرى مثل cron)
global.broadcastWS = broadcast;

// 🟡 6. الاتصال بـ MongoDB
mongoose.connect(process.env.LOCAL_DATABASE).then(() => {
  console.log('Connected To Database Success...🚀');
  require('./middlewares/agenda');  // مهمتك الخاصة بالكرون
});

// 🟡 7. تشغيل السيرفر
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Starting At Port ${PORT}...✨`);
});

// 🟡 8. التعامل مع الأخطاء غير المعالجة
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Error ${err.name}| ${err.message}`);
  server.close(() => {
    console.log('Shutting Down...');
    process.exit(1);
  });
});
