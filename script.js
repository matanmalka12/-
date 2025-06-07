/*****************************
 *  דייט לא-שגרתי – script.js *
 * גרסה מתוקנת ומלאה         *
 *****************************/
/*════════════════════════════
  משתנים גלובליים
════════════════════════════*/
let playerNames = [],
    scores      = [0,0],
    turn        = 0,
    skipUsed    = [false,false],
    selectedMood= 'mixed',
    cardsToPlay = [],
    played      = [],
    timerInt    = null,
    autoDrawInt = null;

const $ = id => document.getElementById(id);
const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);

function setMood(mood, btn){
  selectedMood = mood;
  document.querySelectorAll('.mood-btn')
          .forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function enterGame() {
  $('landingScreen').style.display = 'none';
  $('startScreen').style.display = 'block';
}

function startGame() {
  showLoadingAnimation();
  setTimeout(() => {
    $('startScreen').style.display  = 'none';
    $('gameScreen').style.display   = 'block';
    $('summaryScreen').style.display = 'none';
    animateGameScreen();

    playerNames = [
      $('player1Name').value || 'שחקן 1',
      $('player2Name').value || 'שחקן 2'
    ];
    const maxNum = parseInt($('numCards').value) || 10;

    const pool = selectedMood === 'all'
      ? cards
      : cards.filter(c => c.mood === selectedMood);

    const num = Math.min(maxNum, pool.length);
    cardsToPlay = shuffle(pool).slice(0, num);

    scores = [0, 0];
    turn = 0;
    skipUsed = [false, false];
    played = [];
    clearTimer();
    clearInterval(autoDrawInt);

    updateTurn();
    updateScore();
    updateCardIndex();
    updateCardsRemaining();
    $('cardsRemaining').style.display = 'block';
    drawCard();
    $('drawBtn').disabled = true;
  }, 800);
}

function showLoadingAnimation() {
  const btn = $('startGameBtn');
  btn.innerText = '🔄 טוען...';
  btn.disabled = true;
}

function animateGameScreen() {
  ['turnDisplay', 'scoreBoard', 'cardArea', 'actions'].forEach(id => {
    const el = $(id);
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
      el.style.transition = 'all 0.5s ease';
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }, 100);
  });
}

function drawCard() {
  if (!cardsToPlay.length) return endGame();

  const card = cardsToPlay.shift();
  played.push(card);
  scores[turn] += card.level || 1;
  updateScore();
  updateCardIndex();
  updateCardsRemaining();
  $('cardsRemaining').style.display = 'block';
  $('cardsRemaining').classList.add('loaded');

  const cardArea = $('cardArea');
  cardArea.className = 'card-lvl-' + (card.level || 1);
  cardArea.innerHTML = `
    <div class="card-level-icon">⭐️ רמה ${card.level}</div>
    <div class="card-text">${card.text}</div>
  `;
  cardArea.onclick = () => cardArea.classList.toggle('zoom');

  $('drawBtn').style.display = 'none';
  $('completeBtn').style.display = card.timer ? 'none' : 'inline-block';
  $('skipBtn').disabled = skipUsed[turn];

  if (card.timer) startTimer(30);

  clearInterval(autoDrawInt);
  autoDrawInt = setInterval(() => {
    if (cardsToPlay.length > 0) drawCard();
    else clearInterval(autoDrawInt);
  }, 30000);
}

function completeTask() {
  clearTimer();
  switchTurn();
}

function skipCard() {
  if (skipUsed[turn]) return alert('כבר השתמשת בדילוג!');
  skipUsed[turn] = true;
  scores[turn]--;
  updateScore();
  switchTurn();
}
function switchTurn() {
  turn = 1 - turn;
  updateTurn();
  resetCardArea();
  updateCardsRemaining(); // ← הוסף כאן
  $('drawBtn').disabled = false;
  if (!cardsToPlay.length) endGame();
}

function updateTurn() {
  $('turnDisplay').innerHTML = `תור של: <b>${playerNames[turn]}</b>`;
}

function updateScore() {
  $('scoreBoard').innerText =
    `${playerNames[0]}: ${scores[0]} | ${playerNames[1]}: ${scores[1]}`;
}

function resetCardArea() {
  $('cardArea').innerText = '';
  $('cardArea').className = '';
  $('completeBtn').style.display = 'none';
  $('drawBtn').style.display = 'inline-block';
}

function startTimer(sec) {
  $('timer').style.display = 'block';
  $('timer').classList.add('loaded');
  $('timer').innerText = '⏳ ' + sec;
  clearInterval(timerInt);
  $('completeBtn').style.display = 'inline-block';

  timerInt = setInterval(() => {
    sec--;
    $('timer').innerText = '⏳ ' + sec;
    if (sec <= 0) {
      clearTimer();
      alert('הזמן אזל!');
      switchTurn();
    }
  }, 1000);
}

function clearTimer() {
  if (timerInt) clearInterval(timerInt);
  timerInt = null;
  $('timer').classList.remove('loaded');
  $('timer').style.display = 'none';
  $('timer').innerText = '';
}

function endGame() {
  clearInterval(autoDrawInt);
  $('gameScreen').style.display = 'none';
  $('summaryScreen').style.display = 'block';

  let txt = `סה"כ קלפים: ${played.length}\n`;
  played.forEach(c => {
    const moodIcon = {
      fun: '💛', romantic: '💗', sexual: '🔥', mixed: '💚'
    }[c.mood] || '🎴';
    txt += `${moodIcon} ${c.text} (רמה ${c.level})\n`;
  });
  $('finalResults').innerText = txt;
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const lines = $('finalResults').innerText.split('\n');
  let y = 40;
  doc.setFontSize(12);
  lines.forEach(l => {
    if (y > 780) { doc.addPage(); y = 40; }
    if (l.trim()) doc.text(l, 40, y);
    y += 16;
  });
  doc.save('UnusualDate_Summary.pdf');
}

function copySummaryToClipboard() {
  navigator.clipboard.writeText($('finalResults').innerText).then(() => {
    alert('📋 הסיכום הועתק!');
  });
}

function toggleCardIndex() {
  const panel = $('cardIndexPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function updateCardIndex() {
  const container = $('cardIndexList');
  container.innerHTML = '';
  const all = [...played, ...cardsToPlay];
  all.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card-index-item' + (played.includes(card) ? ' card-played' : '');
    div.textContent = card.text;
    container.appendChild(div);
  });
}
function updateCardsRemaining() {
  const el = document.getElementById('cardsRemaining');
  if (el) {
    if (cardsToPlay.length > 0) {
      el.innerText = `קלפים נשארו: ${cardsToPlay.length}`;
      el.classList.add('loaded');
    } else {
      el.innerText = '';
      el.classList.remove('loaded');
    }
    console.log('✅ עדכון קלפים נשארו:', cardsToPlay.length);
  } else {
    console.warn('⚠️ אלמנט cardsRemaining לא נמצא');
  }
}