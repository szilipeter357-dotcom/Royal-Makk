const board = document.getElementById("board");

const spinBtn = document.getElementById("spin");

const moneyEl = document.getElementById("money");

const winDisplay = document.getElementById("win-display");

const freeSpinsCounter = document.getElementById("free-spins-counter");

const bonusOverlay = document.getElementById("bonus-overlay");

const bonusTitle = document.getElementById("bonus-title");

const bonusText = document.getElementById("bonus-text");

const bonusBtn = document.getElementById("bonus-btn");



const betMinusBtn = document.getElementById("bet-minus");

const betPlusBtn = document.getElementById("bet-plus");

const betAmountEl = document.getElementById("bet-amount");

const speedBtn = document.getElementById("speed-btn");



// Big Win elemek

const bigwinOverlay = document.getElementById("bigwin-overlay");

const bigwinTitle = document.getElementById("bigwin-title");

const bigwinCounter = document.getElementById("bigwin-counter");



const BET_LEVELS = [100, 500, 1000, 5000, 10000, 50000, 100000];

let currentBetIndex = 0;



const SPEED_MODES = [

  { label: "⚡ Sebesség: Normal (1x)", mult: 1.0 },

  { label: "⚡⚡ Sebesség: Gyors (2x)", mult: 0.5 },

  { label: "🚀 Sebesség: TURBO (3x)", mult: 0.25 }

];

let currentSpeedIndex = 0;



const SYMBOLS = [

  { name: "banana", src: "assets/images/banana.png", mult: 0.1 },

  { name: "szilva", src: "assets/images/szilva.png", mult: 0.2 },

  { name: "apple", src: "assets/images/apple.png", mult: 0.3 },

  { name: "melon", src: "assets/images/melon.png", mult: 0.4 },

  { name: "zold", src: "assets/images/zold.png", mult: 0.5 },

  { name: "lila", src: "assets/images/lila.png", mult: 0.8 },

  { name: "heart", src: "assets/images/heart.png", mult: 1.0 }

];



const BOMBS = [

  { name: "bomb_100", src: "assets/images/bomb_100.png", mult: 100 },

  { name: "bomb_1000", src: "assets/images/bomb_1000.png", mult: 1000 }

];



let balance = 1000000;

let currentGrid = [];



let isFreeSpinsMode = false;

let freeSpinsLeft = 0;

let totalBonusWin = 0;



function getSpeedMult() {

  return SPEED_MODES[currentSpeedIndex].mult;

}



if (speedBtn) {

  speedBtn.onclick = () => {

    currentSpeedIndex = (currentSpeedIndex + 1) % SPEED_MODES.length;

    speedBtn.innerText = SPEED_MODES[currentSpeedIndex].label;

    playBetSound(true);

  };

}



// --- AUDIO SZINTETIZÁTOR ---

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();



function playBetSound(isIncrease, isLimit = false) {

  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();

  const gain = audioCtx.createGain();



  if (isLimit) {

    osc.type = 'square';

    osc.frequency.setValueAtTime(180, audioCtx.currentTime);

    osc.frequency.exponentialRampToValueAtTime(90, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    osc.connect(gain);

    gain.connect(audioCtx.destination);

    osc.start();

    osc.stop(audioCtx.currentTime + 0.08);

    return;

  }



  const baseFreq = isIncrease ? 320 + (currentBetIndex * 60) : 680 - (currentBetIndex * 60);

  const targetFreq = isIncrease ? baseFreq + 150 : baseFreq - 150;



  osc.type = 'sine';

  osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);

  osc.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.12);



  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);

  gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);



  osc.connect(gain);

  gain.connect(audioCtx.destination);

  osc.start();

  osc.stop(audioCtx.currentTime + 0.12);

}



function playSpinSound() {

  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();

  const gain = audioCtx.createGain();

  osc.type = 'triangle';

  osc.frequency.setValueAtTime(150, audioCtx.currentTime);

  osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);

  gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  osc.connect(gain);

  gain.connect(audioCtx.destination);

  osc.start();

  osc.stop(audioCtx.currentTime + 0.15);

}



function playPopSound() {

  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();

  const gain = audioCtx.createGain();

  osc.type = 'sine';

  osc.frequency.setValueAtTime(600, audioCtx.currentTime);

  osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.2);

  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);

  gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

  osc.connect(gain);

  gain.connect(audioCtx.destination);

  osc.start();

  osc.stop(audioCtx.currentTime + 0.2);

}



function playBombSound() {

  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();

  const gain = audioCtx.createGain();

  osc.type = 'sawtooth';

  osc.frequency.setValueAtTime(120, audioCtx.currentTime);

  osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);

  gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

  osc.connect(gain);

  gain.connect(audioCtx.destination);

  osc.start();

  osc.stop(audioCtx.currentTime + 0.4);

}



function playScatterFanfare() {

  if (audioCtx.state === 'suspended') audioCtx.resume();

  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];

  notes.forEach((freq, index) => {

    setTimeout(() => {

      const osc = audioCtx.createOscillator();

      const gain = audioCtx.createGain();

      osc.type = 'triangle';

      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);

      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

      osc.connect(gain);

      gain.connect(audioCtx.destination);

      osc.start();

      osc.stop(audioCtx.currentTime + 0.35);

    }, index * (90 * getSpeedMult()));

  });

}



function playWinSound() {

  if (audioCtx.state === 'suspended') audioCtx.resume();

  const notes = [440, 554.37, 659.25, 880];

  notes.forEach((freq, index) => {

    setTimeout(() => {

      const osc = audioCtx.createOscillator();

      const gain = audioCtx.createGain();

      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

      osc.connect(gain);

      gain.connect(audioCtx.destination);

      osc.start();

      osc.stop(audioCtx.currentTime + 0.25);

    }, index * (70 * getSpeedMult()));

  });

}



// --- ÚJ: JACKPOT / BIG WIN GRATULÁLÓ FANFÁR EFFEKT ---

function playJackpotFanfare() {

  if (audioCtx.state === 'suspended') audioCtx.resume();



  // 1. Ünnepélyes rézfúvós stílusú dallam (C-dúr arpeggio akordok)

  const fanfareNotes = [

    { freq: 523.25, delay: 0, duration: 0.15 },     // C5

    { freq: 659.25, delay: 120, duration: 0.15 },   // E5

    { freq: 783.99, delay: 240, duration: 0.15 },   // G5

    { freq: 1046.50, delay: 360, duration: 0.60 },  // C6 (hosszú magas hang)

    { freq: 880.00, delay: 800, duration: 0.18 },   // A5

    { freq: 1046.50, delay: 1000, duration: 0.80 }  // C6 (lezáró nagy hang)

  ];



  fanfareNotes.forEach(note => {

    setTimeout(() => {

      const osc = audioCtx.createOscillator();

      const gain = audioCtx.createGain();



      osc.type = 'triangle'; // Lágy, de fényes hangszín

      osc.frequency.setValueAtTime(note.freq, audioCtx.currentTime);



      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);

      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + note.duration);



      osc.connect(gain);

      gain.connect(audioCtx.destination);



      osc.start();

      osc.stop(audioCtx.currentTime + note.duration);

    }, note.delay);

  });



  // 2. Háttérben gyorsan csilingelő "aranyeső" effektus

  for (let i = 0; i < 15; i++) {

    setTimeout(() => {

      const osc = audioCtx.createOscillator();

      const gain = audioCtx.createGain();



      // Véletlenszerű magas csilingelő frekvenciák

      const randomFreq = 1500 + Math.random() * 2000;



      osc.type = 'sine';

      osc.frequency.setValueAtTime(randomFreq, audioCtx.currentTime);



      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);

      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);



      osc.connect(gain);

      gain.connect(audioCtx.destination);



      osc.start();

      osc.stop(audioCtx.currentTime + 0.15);

    }, i * 120);

  }

}



// --- BIG WIN ANIMÁCIÓ LOGIKA ---

async function showBigWinOverlay(amount, currentBet) {

  const ratio = amount / currentBet;

 

  if (ratio >= 100) {

    bigwinTitle.innerText = "💥 JACKPOT! 💥";

  } else if (ratio >= 50) {

    bigwinTitle.innerText = "🌟 ÓRIÁSI NYEREMÉNY! 🌟";

  } else {

    bigwinTitle.innerText = "🎣 NAGY KAPÁS! 🎣";

  }



  bigwinCounter.innerText = "0 FT";

  bigwinOverlay.classList.add("active");



  // GRATULÁLÓ HANGEFFEKT INDÍTÁSA

  playJackpotFanfare();



  const duration = 2500 * getSpeedMult();

  const startTime = performance.now();



  return new Promise(resolve => {

    function updateCounter(now) {

      const elapsed = now - startTime;

      const progress = Math.min(elapsed / duration, 1);

     

      const currentVal = Math.floor(progress * amount);

      bigwinCounter.innerText = `${currentVal.toLocaleString('hu-HU')} FT`;



      if (progress < 1) {

        requestAnimationFrame(updateCounter);

      } else {

        bigwinCounter.innerText = `${amount.toLocaleString('hu-HU')} FT`;

        setTimeout(() => {

          bigwinOverlay.classList.remove("active");

          setTimeout(resolve, 400);

        }, 1200 * getSpeedMult());

      }

    }

    requestAnimationFrame(updateCounter);

  });

}



// --- TÉT KEZELÉS ---

function updateBetUI() {

  const currentBet = BET_LEVELS[currentBetIndex];

  if (betAmountEl) betAmountEl.innerText = currentBet.toLocaleString('hu-HU');



  if (betMinusBtn) betMinusBtn.disabled = (currentBetIndex === 0);

  if (betPlusBtn) betPlusBtn.disabled = (currentBetIndex === BET_LEVELS.length - 1);

}



if (betMinusBtn) {

  betMinusBtn.onclick = () => {

    if (currentBetIndex > 0) {

      currentBetIndex--;

      updateBetUI();

      playBetSound(false);

    } else {

      playBetSound(false, true);

    }

  };

}



if (betPlusBtn) {

  betPlusBtn.onclick = () => {

    if (currentBetIndex < BET_LEVELS.length - 1) {

      currentBetIndex++;

      updateBetUI();

      playBetSound(true);

    } else {

      playBetSound(true, true);

    }

  };

}



// --- LOGIKA ---



function getRandomSymbol() {

  const chance = Math.random();



  const bombChance = isFreeSpinsMode ? 0.05 : 0.012;

  if (chance < bombChance) {

    const bomb = BOMBS[Math.floor(Math.random() * BOMBS.length)];

    return { name: bomb.name, src: bomb.src, mult: bomb.mult };

  }



  if (!isFreeSpinsMode && chance < bombChance + 0.035) {

    return { name: "scatter", src: "assets/images/scatter.png", mult: 2.5 };

  }



  const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

  return { name: sym.name, src: sym.src, mult: sym.mult };

}



async function spin() {

  const currentBet = BET_LEVELS[currentBetIndex];



  if (!isFreeSpinsMode && balance < currentBet) {

    alert(`Nincs elég egyenleged a pörgetéshez (${currentBet.toLocaleString('hu-HU')} Ft)!`);

    return;

  }



  spinBtn.disabled = true;

  if (betMinusBtn) betMinusBtn.disabled = true;

  if (betPlusBtn) betPlusBtn.disabled = true;



  playSpinSound();



  if (winDisplay) {

    winDisplay.classList.remove("show", "multiplier-pop");

    winDisplay.innerText = "";

  }



  if (!isFreeSpinsMode) {

    balance -= currentBet;

    if (moneyEl) moneyEl.innerText = balance.toLocaleString('hu-HU');

  } else {

    freeSpinsLeft--;

    updateFreeSpinsUI();

  }



  board.innerHTML = "";

  currentGrid = [];



  const speedMult = getSpeedMult();



  for (let i = 0; i < 30; i++) {

    const symbolData = getRandomSymbol();

    const cell = document.createElement("div");

    cell.className = "cell fall";



    const columnIndex = i % 6;

    cell.style.animationDelay = `${columnIndex * 0.04 * speedMult}s`;

    cell.style.animationDuration = `${0.4 * speedMult}s`;



    const img = document.createElement("img");

    img.src = symbolData.src;

    img.alt = symbolData.name;



    cell.appendChild(img);

    board.appendChild(cell);



    currentGrid.push({ data: symbolData, element: cell, imgElement: img });

  }



  await new Promise(resolve => setTimeout(resolve, 450 * getSpeedMult()));



  // Lépcsőzetes nyeremények feldolgozása

  const spinTotalWin = await processCascades();



  // Ha a pörgetés nyereménye legalább a tét 20-szorosa, villanjon fel a Big Win + Hang!

  if (spinTotalWin >= currentBet * 20) {

    await showBigWinOverlay(spinTotalWin, currentBet);

  }



  const scatterItems = currentGrid.filter(item => item.data.name === "scatter");



  if (!isFreeSpinsMode && scatterItems.length >= 4) {

    playScatterFanfare();

    scatterItems.forEach(item => {

      item.element.classList.add("scatter-trigger");

    });



    if (winDisplay) {

      winDisplay.innerText = `🍭 ${scatterItems.length} SCATTER! BÓNUSZ JÁTÉK! 🍭`;

      winDisplay.classList.add("show", "multiplier-pop");

    }



    await new Promise(resolve => setTimeout(resolve, 1200 * getSpeedMult()));



    scatterItems.forEach(item => {

      item.element.classList.remove("scatter-trigger");

    });



    triggerBonusGame();

    return;

  }



  if (isFreeSpinsMode) {

    if (freeSpinsLeft > 0) {

      setTimeout(spin, 1000 * getSpeedMult());

    } else {

      endBonusGame();

    }

  } else {

    spinBtn.disabled = false;

    updateBetUI();

  }

}



async function processCascades() {

  let hasWin = true;

  const currentBet = BET_LEVELS[currentBetIndex];

  let roundTotalWin = 0;



  while (hasWin) {

    const speedMult = getSpeedMult();

    const counts = {};



    currentGrid.forEach(item => {

      const name = item.data.name;

      counts[name] = (counts[name] || 0) + 1;

    });



    const winningNames = [];

    for (const name in counts) {

      if (counts[name] >= 8 && !name.includes("bomb") && name !== "scatter") {

        winningNames.push(name);

      }

    }



    if (winningNames.length > 0) {

      hasWin = true;

      playPopSound();



      let cascadeBaseWin = 0;



      currentGrid.forEach(item => {

        if (winningNames.includes(item.data.name)) {

          cascadeBaseWin += Math.round(currentBet * item.data.mult);

          item.element.classList.remove("fall", "cascade-fall");

          item.element.style.animationDuration = `${0.35 * speedMult}s`;

          item.element.classList.add("pop");

        }

      });



      if (winDisplay) {

        winDisplay.innerText = `Nyeremény: +${cascadeBaseWin.toLocaleString('hu-HU')} Ft`;

        winDisplay.classList.add("show");

      }



      await new Promise(resolve => setTimeout(resolve, 380 * getSpeedMult()));



      let totalMultiplier = 0;

      let finalWin = cascadeBaseWin;



      const bombItems = currentGrid.filter(item => item.data.name.includes("bomb"));

     

      if (bombItems.length > 0) {

        bombItems.forEach(item => {

          item.element.classList.add("bomb-activate");

          totalMultiplier += item.data.mult;

        });



        playBombSound();

        await new Promise(resolve => setTimeout(resolve, 500 * getSpeedMult()));



        finalWin = cascadeBaseWin * totalMultiplier;



        if (winDisplay) {

          winDisplay.innerText = `💥 ${totalMultiplier}x SZORZÓ! 💥 +${finalWin.toLocaleString('hu-HU')} Ft`;

          winDisplay.classList.add("multiplier-pop");

        }



        playWinSound();

        await new Promise(resolve => setTimeout(resolve, 600 * getSpeedMult()));



        bombItems.forEach(item => item.element.classList.remove("bomb-activate"));



      } else {

        playWinSound();

      }



      balance += finalWin;

      roundTotalWin += finalWin;

      if (isFreeSpinsMode) totalBonusWin += finalWin;



      if (moneyEl) moneyEl.innerText = balance.toLocaleString('hu-HU');



      currentGrid.forEach(item => {

        if (winningNames.includes(item.data.name)) {

          const newSymbolData = getRandomSymbol();

          item.data = newSymbolData;

          item.imgElement.src = newSymbolData.src;

          item.imgElement.alt = newSymbolData.name;



          item.element.classList.remove("pop");

          void item.element.offsetWidth;

          item.element.style.animationDuration = `${0.35 * getSpeedMult()}s`;

          item.element.classList.add("cascade-fall");

        }

      });



      await new Promise(resolve => setTimeout(resolve, 350 * getSpeedMult()));

    } else {

      hasWin = false;

    }

  }



  return roundTotalWin;

}



function triggerBonusGame() {

  isFreeSpinsMode = true;

  freeSpinsLeft = 10;

  totalBonusWin = 0;



  bonusTitle.innerText = "BÓNUSZ JÁTÉK!";

  bonusText.innerText = "Kaptál 10 Ingyenes Pörgetést!";

  bonusBtn.innerText = "INDÍTÁS";

  bonusOverlay.classList.add("active");



  bonusBtn.onclick = () => {

    bonusOverlay.classList.remove("active");

    updateFreeSpinsUI();

    spin();

  };

}



function endBonusGame() {

  bonusTitle.innerText = "BÓNUSZ VÉGE!";

  bonusText.innerText = `Összes nyeremény: ${totalBonusWin.toLocaleString('hu-HU')} Ft`;

  bonusBtn.innerText = "KÉSZ";

  bonusOverlay.classList.add("active");



  bonusBtn.onclick = () => {

    bonusOverlay.classList.remove("active");

    isFreeSpinsMode = false;

    freeSpinsCounter.innerText = "";

    spinBtn.disabled = false;

    updateBetUI();

  };

}



function updateFreeSpinsUI() {

  if (freeSpinsCounter) {

    freeSpinsCounter.innerText = `Ingyenes pörgetések: ${freeSpinsLeft} / 10`;

  }

}



if (spinBtn) {

  spinBtn.onclick = spin;

}



if (moneyEl) moneyEl.innerText = balance.toLocaleString('hu-HU');

updateBetUI();

spin(); 

