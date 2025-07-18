console.log("테스트용 출력"); // 맨 위에 추가해서



// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 정적 파일 서빙 (client 폴더)
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../public')));  // ✅ 이거 추가!




// 소켓 연결 처리
io.on('connection', (socket) => {
  console.log('✅ 소켓 연결됨:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ 소켓 해제됨:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
