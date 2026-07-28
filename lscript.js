// --- AUDIO SYNTHESIZER ENGINE (Web Audio API) ---
let audioEnabled = true;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function toggleAudio() {
  audioEnabled = !audioEnabled;
  const btnText = document.getElementById('audio-status-text');
  btnText.innerText = audioEnabled ? 'SOUND ON' : 'MUTED';
  document.getElementById('audio-btn').style.opacity = audioEnabled ? '1' : '0.5';
}

function playAudio(type) {
  if (!audioEnabled) return;
  
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'click') {
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) { console.log("Audio not allowed yet"); }
}

// --- EGYENLEG ÉS VIP STRUKTÚRA ---
let balance = localStorage.getItem('casino_balance') ? parseInt(localStorage.getItem('casino_balance')) : 10000;
let xp = localStorage.getItem('casino_xp') ? parseInt(localStorage.getItem('casino_xp')) : 150;

function updateBalanceDisplay() {
  document.getElementById('user-balance').innerText = balance.toLocaleString('hu-HU') + ' Ft';
  updateVIPProgress();
}

function updateVIPProgress() {
  // VIP Szintek: Bronze (0-500), Silver (500-2000), Gold (2000-5000), Diamond (5000+)
  let rank = 'BRONZE I';
  let nextXp = 500;
  let cashback = '2%';

  if (xp >= 5000) { rank = 'DIAMOND VIP'; nextXp = 10000; cashback = '10%'; }
  else if (xp >= 2000) { rank = 'GOLD VIP'; nextXp = 5000; cashback = '6%'; }
  else if (xp >= 500) { rank = 'SILVER VIP'; nextXp = 2000; cashback = '4%'; }

  let pct = Math.min(Math.floor((xp / nextXp) * 100), 100);
  
  document.getElementById('vip-rank-name').innerText = rank;
  document.getElementById('vip-percent-text').innerText = pct + '%';
  document.getElementById('vip-bar-fill').style.width = pct + '%';
  document.getElementById('vip-cashback-text').innerText = cashback;
}

updateBalanceDisplay();

// --- MODALOK KEZELÉSE ---
function openModal(id) {
  playAudio('click');
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function processDeposit(amount) {
  playAudio('win');
  balance += amount;
  xp += Math.floor(amount / 100); // 100 Ft = 1 XP
  localStorage.setItem('casino_balance', balance);
  localStorage.setItem('casino_xp', xp);
  updateBalanceDisplay();
  closeModal('deposit-modal');
  alert(`⚡ Sikeres feltöltés: +${amount.toLocaleString('hu-HU')} Ft! VIP XP jóváírva.`);
}

// --- NAPI SZERENCEKERÉK ENGINE ---
let isSpinning = false;
function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;
  playAudio('click');

  const spinner = document.getElementById('wheel-spinner');
  const btn = document.getElementById('spin-btn');
  btn.disabled = true;

  const randomDeg = 1440 + Math.floor(Math.random() * 360);
  spinner.style.transform = `rotate(${randomDeg}deg)`;

  setTimeout(() => {
    playAudio('win');
    const prizes = [2000, 5000, 10000, 25000];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    balance += prize;
    localStorage.setItem('casino_balance', balance);
    updateBalanceDisplay();
    
    alert(`🎉 GRATULÁLUNK! Nyertél +${prize.toLocaleString('hu-HU')} Ft VIP bónuszt!`);
    closeModal('wheel-modal');
    isSpinning = false;
    btn.disabled = false;
  }, 3500);
}

// --- KAPARÓS SORSJEGY ENGINE ---
const scratchSymbols = ['💎', '🍋', '👑', '7️⃣'];
let scratchBoard = [];
let revealedCount = 0;

function resetScratch() {
  if (balance < 500) return alert('Nincs elég egyenleged! (500 Ft szükséges)');
  balance -= 500;
  updateBalanceDisplay();

  revealedCount = 0;
  scratchBoard = [
    scratchSymbols[Math.floor(Math.random() * scratchSymbols.length)],
    scratchSymbols[Math.floor(Math.random() * scratchSymbols.length)],
    scratchSymbols[Math.floor(Math.random() * scratchSymbols.length)]
  ];

  const cells = document.querySelectorAll('.scratch-cell');
  cells.forEach(c => {
    c.innerText = '❓';
    c.classList.remove('revealed');
  });
}

function revealCell(element, index) {
  if (element.classList.contains('revealed') || scratchBoard.length === 0) return;
  playAudio('click');
  element.innerText = scratchBoard[index];
  element.classList.add('revealed');
  revealedCount++;

  if (revealedCount === 3) {
    if (scratchBoard[0] === scratchBoard[1] && scratchBoard[1] === scratchBoard[2]) {
      playAudio('win');
      balance += 5000;
      updateBalanceDisplay();
      alert('🎉 3 EGYFORMA! Nyertél 5 000 Ft-ot!');
    }
  }
}

// --- ÉLŐ NYERTESEK FEED ---
const names = ['Péter', 'Gábor', 'Bence', 'Dániel', 'Tamás', 'Ádám', 'Zoltán', 'Máté', 'Krisztián'];
const games = ['Makk Slot Extreme', 'Cyber Scratch VIP', 'Neon Roulette'];

function generateWin() {
  const name = names[Math.floor(Math.random() * names.length)];
  const win = (Math.floor(Math.random() * 90) + 10) * 1000;
  const game = games[Math.floor(Math.random() * games.length)];
  
  const ticker = document.getElementById('live-wins-ticker');
  const winTag = document.createElement('div');
  winTag.className = 'win-item';
  winTag.innerHTML = `<span>👤 ${name}</span> nyert <strong class="gold-neon">${win.toLocaleString('hu-HU')} Ft-ot</strong> (${game})`;
  
  ticker.prepend(winTag);
  if (ticker.children.length > 5) ticker.removeChild(ticker.lastChild);
}
setInterval(generateWin, 3200);
generateWin(); generateWin();

// --- JACKPOT & DYNAMIC PLAYERS COUNTER ---
let jackpot = 24891450;
setInterval(() => {
  jackpot += Math.floor(Math.random() * 400) + 80;
  document.getElementById('jackpot-counter').innerText = jackpot.toLocaleString('hu-HU') + ' Ft';
}, 1400);

setInterval(() => {
  let delta = Math.floor(Math.random() * 11) - 5;
  let count = parseInt(document.getElementById('active-players-count').innerText.replace(' ', '')) + delta;
  document.getElementById('active-players-count').innerText = count.toLocaleString('hu-HU');
}, 4000);

// --- SEARCH & FILTER ---
function filterGames(cat, btn) {
  playAudio('click');
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.game-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.category === cat) ? 'flex' : 'none';
  });
}

function searchGame() {
  let query = document.getElementById('search-input').value.toLowerCase();
  document.querySelectorAll('.game-card').forEach(card => {
    card.style.display = card.dataset.name.includes(query) ? 'flex' : 'none';
  });
}

// --- CYBER BLACKJACK LOGIKA ---
let bjBet = 500;
let bjPlayerHand = [];
let bjDealerHand = [];
let bjInGame = false;

const bjSuits = ['♠', '♥', '♦', '♣'];
const bjValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function setBJBet(amount, btnEl) {
  if (bjInGame) return;
  bjBet = amount;
  playAudio('click');
  document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
}

function getRandomCard() {
  const value = bjValues[Math.floor(Math.random() * bjValues.length)];
  const suit = bjSuits[Math.floor(Math.random() * bjSuits.length)];
  const isRed = suit === '♥' || suit === '♦';
  return { value, suit, isRed };
}

function calcBJScore(hand) {
  let score = 0;
  let aces = 0;

  hand.forEach(card => {
    if (['J', 'Q', 'K'].includes(card.value)) {
      score += 10;
    } else if (card.value === 'A') {
      aces += 1;
      score += 11;
    } else {
      score += parseInt(card.value);
    }
  });

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
}

function renderBJHand(containerId, hand, hideSecond = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  hand.forEach((card, index) => {
    if (hideSecond && index === 1) {
      const cardEl = document.createElement('div');
      cardEl.className = 'bj-card-item';
      cardEl.innerText = '❓';
      container.appendChild(cardEl);
      return;
    }

    const cardEl = document.createElement('div');
    cardEl.className = `bj-card-item ${card.isRed ? 'red' : ''}`;
    cardEl.innerText = `${card.value}${card.suit}`;
    container.appendChild(cardEl);
  });
}

function startBJGame() {
  if (balance < bjBet) {
    alert('Nincs elég egyenleged a kiválasztott téthez!');
    return;
  }

  balance -= bjBet;
  updateBalanceDisplay();
  playAudio('click');

  bjPlayerHand = [getRandomCard(), getRandomCard()];
  bjDealerHand = [getRandomCard(), getRandomCard()];
  bjInGame = true;

  document.getElementById('bj-bet-controls').style.display = 'none';
  document.getElementById('bj-action-controls').style.display = 'grid';
  document.getElementById('bj-status-text').innerText = 'Játék folyamatban...';

  renderBJHand('bj-player-cards', bjPlayerHand);
  renderBJHand('bj-dealer-cards', bjDealerHand, true);

  const pScore = calcBJScore(bjPlayerHand);
  document.getElementById('bj-player-score').innerText = pScore;
  document.getElementById('bj-dealer-score').innerText = '?';

  if (pScore === 21) {
    endBJGame('BLACKJACK! 🎉 Nyeremény: ' + (bjBet * 2.5) + ' Ft', bjBet * 2.5);
  }
}

function hitBJ() {
  if (!bjInGame) return;
  playAudio('click');

  bjPlayerHand.push(getRandomCard());
  renderBJHand('bj-player-cards', bjPlayerHand);

  const pScore = calcBJScore(bjPlayerHand);
  document.getElementById('bj-player-score').innerText = pScore;

  if (pScore > 21) {
    endBJGame('BESOMLOTTÁL! (Bust > 21) ❌', 0);
  }
}

function standBJ() {
  if (!bjInGame) return;
  playAudio('click');

  let dScore = calcBJScore(bjDealerHand);

  // Osztó húz 17-ig
  while (dScore < 17) {
    bjDealerHand.push(getRandomCard());
    dScore = calcBJScore(bjDealerHand);
  }

  renderBJHand('bj-dealer-cards', bjDealerHand, false);
  document.getElementById('bj-dealer-score').innerText = dScore;

  const pScore = calcBJScore(bjPlayerHand);

  if (dScore > 21) {
    endBJGame('AZ OSZTÓ BESOMLOTT! 🎉 Nyertél!', bjBet * 2);
  } else if (pScore > dScore) {
    endBJGame('NYERTÉL! 🎉', bjBet * 2);
  } else if (pScore === dScore) {
    endBJGame('DÖNTETLEN (Push)! Tét visszajár.', bjBet);
  } else {
    endBJGame('AZ OSZTÓ NYERT! ❌', 0);
  }
}

function endBJGame(message, winAmount) {
  bjInGame = false;
  if (winAmount > 0) {
    balance += winAmount;
    updateBalanceDisplay();
    playAudio('win');
  }

  document.getElementById('bj-status-text').innerText = message;
  document.getElementById('bj-action-controls').style.display = 'none';

  setTimeout(() => {
    document.getElementById('bj-bet-controls').style.display = 'flex';
  }, 1500);
}

function resetBJ() {
  bjInGame = false;
  document.getElementById('bj-player-cards').innerHTML = '<div class="card-placeholder">🂠</div>';
  document.getElementById('bj-dealer-cards').innerHTML = '<div class="card-placeholder">🂠</div>';
  document.getElementById('bj-player-score').innerText = '0';
  document.getElementById('bj-dealer-score').innerText = '0';
  document.getElementById('bj-status-text').innerText = 'Tegyél tétet az indításhoz!';
  document.getElementById('bj-action-controls').style.display = 'none';
  document.getElementById('bj-bet-controls').style.display = 'flex';
}
