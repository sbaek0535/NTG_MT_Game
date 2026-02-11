/* ===== 게임 데이터 ===== */

const STOCKS = [
  { id: "A 엔터", prices: [20000, 24000, 42000, 20000,18000,30000] },
  { id: "B 엔터", prices: [2000, 15000, 5000, 12000, 20000, 25000] },
  { id: "C IT", prices: [60000, 180000, 150000, 10000, 60000, 65000] },
  { id: "D 항공", prices: [50000, 40000, 56000, 56000, 68000, 50000] },
  { id: "E 바이오", prices: [10000, 20000, 35000, 35000, 100000, 150000] },
  { id: "F 식품", prices: [30000, 25000, 40000, 52000, 40000, 180000] },
  { id: "G 뷰티", prices: [100000,120000, 80000, 90000, 140000, 200000] },
  { id: "H 화학", prices: [40000, 40000, 47000, 44000,120000, 120000] },
  { id: "I 스포츠", prices: [30000, 25000, 170000, 80000, 85000, 120000] },
];

const PASSWORDS = [
  ["더가까이", "선교단"],
  ["2026", "SPRING"],
  ["MT", "백성현"],
  ["파주", "0915"],
  ["NTG", "누가일등일까"],
];

/* ===== 상태 ===== */

let state = {
  name: "",
  round: 0,          
  cash: 500000,
  holdings: {},
};

const app = document.getElementById("app");

/* ===== 유틸 ===== */

const format = (n) => n.toLocaleString("ko-KR") + "₩";

/* ===== LocalStorage ===== */

function saveState() {
  localStorage.setItem("gameState", JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem("gameState");
  if (saved) {
    state = JSON.parse(saved);
  }
}

/* ===== 총자산 계산 ===== */

function calcTotal() {
  let total = state.cash;
  STOCKS.forEach(s => {
    total += (state.holdings[s.id] || 0) * s.prices[state.round];
  });
  return total;
}

function calcResultTotal() {
  let total = state.cash;
  STOCKS.forEach(s => {
    total += (state.holdings[s.id] || 0) * s.prices[state.round + 1];
  });
  return total;
}

/* ===== 헤더 ===== */

function renderHeader(totalFn = calcTotal, showMoney = true) {
  return `
    <div class="header">
      <div class="name">${state.name}</div>
      ${showMoney ? `<div class="money">총자산: ${format(totalFn())}</div>` : ``}
    </div>
  `;
}

/* ===== 시작 화면 ===== */

function renderStart() {
  app.innerHTML = `
    <div class="container">
      <input id="nameInput" placeholder="팀 이름 입력" value="${state.name}" />
      <button class="primary" onclick="startGame()">시작</button>
    </div>
  `;
}

/* ===== 락 화면 ===== */

function renderPassword(type) {
  const roundNum = state.round + 1;
  const title = type === "start"
    ? `${roundNum}라운드`
    : `${roundNum}라운드 투자 결과`;

  const guide =
    type === "start"
      ? `게임 진행 후 비밀번호를 통해<br/>투자를 진행하실수 있으십니다`
      : `게임 진행 후 비밀번호를 통해<br/>투자를 결과를 확인할수 있습니다`;

  app.innerHTML = `
    ${type === "start" ? renderHeader(calcTotal, true) : renderHeader(calcTotal, false)}
    <div class="container">
      <div style="font-size:24px;font-weight:700;margin-bottom:4px;">${title}</div>
      <img src="lock.png" class="lock" />
      <div style="font-size:16px;font-weight:500;margin:10px 0 16px;color:#333;">
        ${guide}
      </div>
      <input id="pw" placeholder="비밀번호 입력" />
      <button onclick="checkPassword('${type}')">확인</button>
    </div>
  `;
}

/* ===== 투자 화면 ===== */

function renderTrade() {
  const list = STOCKS.map(s => {
    const qty = state.holdings[s.id] || 0;
    const price = s.prices[state.round];

    return `
      <div class="stock">
        <div class="stock-title">
          <div>${s.id} (${format(price)})</div>
          <div class="controls">
            <button onclick="changeQty('${s.id}', -1)">-</button>
            <span>${qty}</span>
            <button onclick="changeQty('${s.id}', 1)">+</button>
          </div>
        </div>
        ${qty > 0 ? `<div class="invest-amount">투자금액: ${format(qty * price)}</div>` : ""}
      </div>
    `;
  }).join("");

  app.innerHTML = `
    ${renderHeader()}
    <div class="container">
      <div class="center-box">${list}</div>

      <div class="trade-footer">
        <div class="cash"><b>보유 현금: ${format(state.cash)}</b></div>
        <button class="primary" onclick="confirmPurchase()">매수 확정 ▶</button>
      </div>
    </div>
  `;
}

/* ===== confirm + 매수 확정 ===== */

function confirmPurchase() {
  if (confirm(`매수를 확정하시겠습니까?\n보유 현금: ${format(state.cash)}`)) {
    saveState();
    renderPassword('result');
  }
}

/* ===== 결과 화면 ===== */

function renderResult() {
  const rows = STOCKS.map(s => {
    const qty = state.holdings[s.id] || 0;
    if (!qty) return "";

    const before = s.prices[state.round] * qty;
    const after = s.prices[state.round + 1] * qty;

    const color =
      after > before ? "#e74c3c" :
      after < before ? "#3498db" :
      "#565656";

    return `
      <div style="display:grid;grid-template-columns: 1.2fr 0.8fr 1fr 1fr;padding:10px 0;font-size:16px;font-weight:500;color:#565656;">
        <div>${s.id}</div>
        <div>${qty}주</div>
        <div>${format(before)}</div>
        <div style="color:${color};font-weight:600;">${format(after)}</div>
      </div>
    `;
  }).join("");

  const headerRow = `
    <div style="display:grid;grid-template-columns: 1.2fr 0.8fr 1fr 1fr;font-weight:700;font-size:17px;color:#000;border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:6px;">
      <div>주식명</div>
      <div>구매수</div>
      <div>변동전</div>
      <div>변동후</div>
    </div>
  `;

  const isLast = state.round === 4;

  app.innerHTML = `
    ${renderHeader(calcResultTotal)}
    <div class="container">
      <div class="center-box">
        ${headerRow}
        ${rows || "<p>보유 주식 없음</p>"}
      </div>
      <button onclick="${isLast ? "endGame()" : "nextRound()"}">
        ${isLast ? "게임 종료" : "다음 라운드"}
      </button>
    </div>
  `;
}

/* ===== 로직 ===== */

function changeQty(id, delta) {
  const stock = STOCKS.find(s => s.id === id);
  const price = stock.prices[state.round];
  const curr = state.holdings[id] || 0;

  if (delta === 1 && state.cash >= price) {
    state.holdings[id] = curr + 1;
    state.cash -= price;
  }
  if (delta === -1 && curr > 0) {
    state.holdings[id] = curr - 1;
    state.cash += price;
  }

  saveState();
  renderTrade();
}

function checkPassword(type) {
  const pw = document.getElementById("pw").value;
  const correct = type === "start" ? PASSWORDS[state.round][0] : PASSWORDS[state.round][1];

  if (pw === correct) {
    type === "start" ? renderTrade() : renderResult();
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
}

function startGame() {
  state.name = document.getElementById("nameInput").value || "PLAYER";
  saveState();
  renderPassword("start");
}

function nextRound() {
  state.round++;
  saveState();
  renderPassword("start");
}

function endGame() {
  localStorage.removeItem("gameState"); // 게임 종료 후 초기화
  location.reload();
}

/* ===== 새로고침 시 상태 복원 ===== */
loadState();
renderStart();

/* ===== 줌 방지 기능 ===== */

// 모바일 이미 적용: meta viewport (index.html 확인)

// 데스크톱: Ctrl+휠 / Ctrl+단축키 줌 방지
window.addEventListener('keydown', function(e) {
  if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=')) {
    e.preventDefault();
  }
});

window.addEventListener('wheel', function(e) {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });
