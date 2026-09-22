const soundContent = {
  string: {
    number: '01', kicker: 'Start with vibration', title: 'A string holds a note, then lets it go.',
    body: 'What changes when it is plucked gently or firmly? What happens when its length changes? Listening becomes a doorway into touch, material and patience.', graphic: 'string-graphic'
  },
  air: {
    number: '02', kicker: 'Follow the breath', title: 'Air turns a hollow space into a voice.',
    body: 'Where does the breath enter, and where does the sound leave? Children can follow a moving column of air with their eyes, ears and imagination.', graphic: 'air-graphic'
  },
  skin: {
    number: '03', kicker: 'Feel the pulse', title: 'A surface answers a hand with rhythm.',
    body: 'How can one hand produce a deep sound and another a bright one? The question makes room for timing, texture and the joy of playing together.', graphic: 'skin-graphic'
  }
};

const optionButtons = document.querySelectorAll('.sound-option');
const soundCard = document.querySelector('.sound-card');

function renderSound(kind) {
  const sound = soundContent[kind];
  const graphics = {
    'string-graphic': '<i></i><i></i><i></i><i></i><i></i>',
    'air-graphic': '<i></i><i></i><i></i>',
    'skin-graphic': '<i></i><i></i><i></i>'
  };
  soundCard.innerHTML = `<span class="sound-number">${sound.number}</span><div><p class="sound-kicker">${sound.kicker}</p><h3>${sound.title}</h3><p>${sound.body}</p></div><div class="sound-graphic ${sound.graphic}" aria-hidden="true">${graphics[sound.graphic]}</div>`;
  optionButtons.forEach((button) => {
    const active = button.dataset.sound === kind;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active);
  });
}

optionButtons.forEach((button) => button.addEventListener('click', () => renderSound(button.dataset.sound)));

document.querySelector('.menu-toggle').addEventListener('click', (event) => {
  const navigation = document.querySelector('#site-nav');
  const open = navigation.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', open);
  event.currentTarget.textContent = open ? 'Close' : 'Menu';
});

document.querySelectorAll('#site-nav a').forEach((link) => link.addEventListener('click', () => {
  document.querySelector('#site-nav').classList.remove('open');
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
  document.querySelector('.menu-toggle').textContent = 'Menu';
}));

document.querySelector('#enquiry-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const lines = [
    `Name: ${data.get('name')}`,
    `Organisation: ${data.get('organisation')}`,
    `Email: ${data.get('email')}`,
    `Location: ${data.get('place')}`,
    `I am contacting you as: ${data.get('host-type')}`,
    '',
    `Notes: ${data.get('note') || 'None provided'}`
  ];
  const subject = encodeURIComponent(`Vādya Wāri enquiry — ${data.get('organisation')}`);
  const body = encodeURIComponent(lines.join('\n'));
  window.location.href = `mailto:hello@baithak.org?subject=${subject}&body=${body}`;
});

const exhibitData = {
  tanpura: { number: '01 / 03', name: 'Tanpura', copy: 'A long, steady resonance that gives other sounds somewhere to rest.' },
  bansuri: { number: '02 / 03', name: 'Bansuri', copy: 'A breath travelling through bamboo, shaped by fingers and attention.' },
  pakhawaj: { number: '03 / 03', name: 'Pakhawaj', copy: 'A pulse with a body: deep, bright and carried by the meeting of hand and skin.' }
};

const room = document.querySelector('.sound-room-stage');
const roomPicks = document.querySelectorAll('.pick');
const playButton = document.querySelector('.stage-play');
let activeExhibit = 'tanpura';
let audioContext;
let audioTimer;
let isPlaying = false;

function stopSound() {
  window.clearInterval(audioTimer);
  isPlaying = false;
  room.classList.remove('playing');
  playButton.setAttribute('aria-pressed', 'false');
  playButton.innerHTML = '<span aria-hidden="true">▶</span> Start listening';
}

function tone(context, frequency, start, duration, type = 'sine', volume = .08) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(.001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .03);
  gain.gain.exponentialRampToValueAtTime(.001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .04);
}

function strike(context, start) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(150, start);
  oscillator.frequency.exponentialRampToValueAtTime(65, start + .23);
  gain.gain.setValueAtTime(.14, start);
  gain.gain.exponentialRampToValueAtTime(.001, start + .38);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start); oscillator.stop(start + .4);
}

function playPhrase() {
  const now = audioContext.currentTime + .02;
  if (activeExhibit === 'tanpura') {
    [130.81, 196, 261.63, 392].forEach((note, index) => tone(audioContext, note, now + index * .16, .8, 'sine', .035));
  } else if (activeExhibit === 'bansuri') {
    [392, 440, 523.25, 440].forEach((note, index) => tone(audioContext, note, now + index * .22, .32, 'sine', .055));
  } else {
    strike(audioContext, now); strike(audioContext, now + .32); strike(audioContext, now + .56);
  }
}

function startSound() {
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  audioContext.resume();
  isPlaying = true;
  room.classList.add('playing');
  playButton.setAttribute('aria-pressed', 'true');
  playButton.innerHTML = '<span aria-hidden="true">■</span> Pause listening';
  playPhrase();
  audioTimer = window.setInterval(playPhrase, activeExhibit === 'pakhawaj' ? 1050 : 1200);
}

playButton.addEventListener('click', () => isPlaying ? stopSound() : startSound());
roomPicks.forEach((pick) => pick.addEventListener('click', () => {
  const wasPlaying = isPlaying;
  stopSound();
  activeExhibit = pick.dataset.exhibit;
  const exhibit = exhibitData[activeExhibit];
  room.dataset.active = activeExhibit;
  document.querySelector('.stage-number').textContent = exhibit.number;
  document.querySelector('#instrument-name').textContent = exhibit.name;
  document.querySelector('#instrument-copy').textContent = exhibit.copy;
  roomPicks.forEach((item) => item.classList.toggle('active', item === pick));
  if (wasPlaying) startSound();
}));

room.querySelector('.stage-instrument').addEventListener('pointermove', (event) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 100;
  const y = ((event.clientY - bounds.top) / bounds.height) * 100;
  room.style.setProperty('--stage-x', `${x}%`);
  room.style.setProperty('--stage-y', `${y}%`);
});
