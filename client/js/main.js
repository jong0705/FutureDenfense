const startBtn = document.getElementById('startBtn');
const modalOverlay = document.getElementById('modalOverlay');
const nicknameInput = document.getElementById('nicknameInput');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');

startBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'flex';
  nicknameInput.focus(); // 입력란 자동 포커스
});

confirmBtn.addEventListener('click', submitNickname);
// cancelBtn.addEventListener('click', closeModal);

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
  if (!/^[a-zA-Z]+$/.test(nickname)) {
    alert('닉네임은 영문만 입력해주세요.');
  }

  window.location.href = `game.html?nickname=${encodeURIComponent(nickname)}`;
}