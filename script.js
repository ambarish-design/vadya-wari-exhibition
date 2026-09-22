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

const cabinetData = {
  tanpura: { number: '01', meta: 'STRING · RESONANCE', name: 'Tanpura', copy: 'Its steady voice creates the ground from which other sounds can rise. Listen for the way one note holds a whole room.' },
  bansuri: { number: '02', meta: 'BAMBOO · BREATH', name: 'Bansuri', copy: 'A column of breath finds its way through bamboo. Sound begins long before the note arrives.' },
  pakhawaj: { number: '03', meta: 'SKIN · PULSE', name: 'Pakhawaj', copy: 'A hand meets a stretched surface and a pulse takes shape—deep, bright and carried through the body.' },
  ghatam: { number: '04', meta: 'CLAY · RHYTHM', name: 'Ghatam', copy: 'A clay vessel becomes an instrument when touch discovers the many voices held inside one form.' }
};

const drawers = document.querySelectorAll('.drawer');
const objectCard = document.querySelector('.object-card');
const objectListen = document.querySelector('.object-listen');
let activeExhibit = 'tanpura';
let audioContext;

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

function strike(context, start, frequency = 150) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, start);
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
  } else if (activeExhibit === 'pakhawaj') {
    strike(audioContext, now); strike(audioContext, now + .32); strike(audioContext, now + .56);
  } else {
    strike(audioContext, now, 240); strike(audioContext, now + .28, 190); strike(audioContext, now + .54, 280);
  }
}

drawers.forEach((drawer) => drawer.addEventListener('click', () => {
  activeExhibit = drawer.dataset.drawer;
  const exhibit = cabinetData[activeExhibit];
  drawers.forEach((item) => { item.classList.toggle('active', item === drawer); item.setAttribute('aria-selected', item === drawer); });
  objectCard.dataset.object = activeExhibit;
  objectCard.querySelector('.object-number').textContent = exhibit.number;
  objectCard.querySelector('.object-meta').textContent = exhibit.meta;
  objectCard.querySelector('h3').textContent = exhibit.name;
  objectCard.querySelector('.object-copy > p:not(.object-meta)').textContent = exhibit.copy;
}));

objectListen.addEventListener('click', () => {
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  audioContext.resume();
  playPhrase();
  objectListen.innerHTML = '<span aria-hidden="true">✓</span> Sound study played';
  window.setTimeout(() => { objectListen.innerHTML = '<span aria-hidden="true">▶</span> Hear a sound study'; }, 1700);
});
