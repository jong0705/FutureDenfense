const startBtn = document.getElementById('startBtn');
const modalOverlay = document.getElementById('modalOverlay');
const nicknameInput = document.getElementById('nicknameInput');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');

startBtn.addEventListener('click', () => {
  modalOverlay.classList.add('active');
  nicknameInput.focus(); // 입력란 자동 포커스
});

confirmBtn.addEventListener('click', submitNickname);
cancelBtn.addEventListener('click', closeModal);

nicknameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    submitNickname();
  }
});

function submitNickname() {
  const nickname = nicknameInput.value.trim(); //nicknameInput의 값을 가져와서 공백 제거
  if (nickname.length < 2 || nickname.length > 12) {
    alert('닉네임은 2~12자 사이로 입력해주세요.');
    return;
  }
  if (!/^[a-zA-Z0-9]+$/.test(nickname)) {
    alert('닉네임은 영문과 숫자만 가능합니다.');
    return;
  }

  modalOverlay.classList.remove('active');
  window.location.href = `joinRoom.html?nickname=${encodeURIComponent(nickname)}`;
}

function closeModal() {
  modalOverlay.classList.remove('active');
}