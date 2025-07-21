// 📁 server/server.js

console.log("🟢 테스트용 출력"); // 서버 시작 확인용

// ✅ 기본 모듈 불러오기
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// ✅ 소켓 및 게임 로직 불러오기
const { Server } = require('socket.io');
const { init } = require('./game/eventHandlers');
const { registerRoomHandlers } = require('./utils/rooms');

// ✅ 서버 및 앱 초기화
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// ✅ CORS 설정
app.use(cors({ origin: 'http://localhost:5173' }));


// ✅ Socket.IO 서버 생성
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// ✅ 클라이언트 소켓 연결 처리
io.on('connection', (socket) => {
  console.log('✅ 소켓 연결됨:', socket.id);
  registerRoomHandlers(io, socket);
  init(socket, io);

  socket.on('disconnect', () => {
    console.log('❌ 소켓 해제됨:', socket.id);
  });

  socket.on('game end', ({ roomId, nickname }) => {
    io.to(roomId).emit('force exit',{ roomId, nickname })
  });

});


// ✅ 서버 실행
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
