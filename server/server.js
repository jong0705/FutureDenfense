console.log("테스트용 출력"); // 맨 위에 추가해서

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // ✅ 여기 고침
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(cors({ origin: 'http://localhost:5173' })); // 🔥 express CORS 허용

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // 🔥 socket.io CORS 허용
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  console.log('✅ 소켓 연결됨:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ 소켓 해제됨:', socket.id);
  });

  // 게임 루프 연결
  const gameLoop = require('./gameLoop');
  gameLoop.init(socket, io);
});

server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
