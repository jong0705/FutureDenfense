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
const gameLoop = require('./gameLoop');  // ⭐ 여기에 import 해두면 중복 방지됨
const { registerRoomHandlers } = require('./rooms');

// ✅ 서버 및 앱 초기화
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// ✅ CORS 설정 (프론트가 5173 포트를 쓸 경우)
app.use(cors({ origin: 'http://localhost:5173' }));


// ✅ Socket.IO 서버 생성 + CORS 설정
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

  // 🔌 클라이언트 종료 감지
  socket.on('disconnect', () => {
    console.log('❌ 소켓 해제됨:', socket.id);
  });

  socket.on('game end', ({ roomId, nickname }) => {
    io.to(roomId).emit('force exit',{})
  });

  // 🎮 게임 초기 이벤트 바인딩
  gameLoop.init(socket, io);
});


// // ✅ 게임 루프 시작 (방 단위로 실행됨 — 여기선 'lobby' 방)
// gameLoop.startGameLoop(io, 'lobby');

// ✅ 서버 실행
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
