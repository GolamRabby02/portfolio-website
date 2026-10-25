// Mobile navigation
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));


// Keep the navbar highlight matched to the section currently on screen.
const pageSections = document.querySelectorAll('main section[id]');
const headerNavLinks = document.querySelectorAll('#navLinks a');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      headerNavLinks.forEach(link => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', isCurrent);
      });
    }
  });
}, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
pageSections.forEach(section => navObserver.observe(section));

// Update active link immediately when a navigation item is clicked.
headerNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    headerNavLinks.forEach(item => item.classList.remove('active'));
    link.classList.add('active');
  });
});

// Repeating type-and-delete animation
const typingText = document.getElementById('typingText');
const phrases = ['Aspiring Full Stack Developer', 'Creative Web Developer', 'Always Learning'];
let phraseIndex = 0, charIndex = 0, deleting = false;
function typeLoop() {
  const phrase = phrases[phraseIndex];
  typingText.textContent = phrase.substring(0, charIndex);
  if (!deleting && charIndex < phrase.length) {
    charIndex++;
    setTimeout(typeLoop, 85);
  } else if (!deleting) {
    deleting = true;
    setTimeout(typeLoop, 1500);
  } else if (charIndex > 0) {
    charIndex--;
    setTimeout(typeLoop, 38);
  } else {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setTimeout(typeLoop, 350);
  }
}
typeLoop();

// Reveal on scroll
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Current year and back-to-top button
document.getElementById('year').textContent = new Date().getFullYear();
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => backTop.classList.toggle('visible', window.scrollY > 450));
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Working demo calculator
const calcScreen = document.getElementById('calcScreen');
let calcCurrent = '0', calcPrevious = null, calcOperator = null, calcFresh = false;
function renderCalc() { calcScreen.textContent = calcCurrent.length > 12 ? Number(calcCurrent).toPrecision(7) : calcCurrent; }
function calculate(a, op, b) {
  a = Number(a); b = Number(b);
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b === 0 ? NaN : a / b;
  return b;
}
document.querySelectorAll('[data-calc]').forEach(button => button.addEventListener('click', () => {
  const value = button.dataset.calc;
  if (value === 'clear') { calcCurrent = '0'; calcPrevious = null; calcOperator = null; calcFresh = false; }
  else if (value === 'sign') { calcCurrent = String(Number(calcCurrent) * -1); }
  else if (value === 'percent') { calcCurrent = String(Number(calcCurrent) / 100); }
  else if (['+', '-', '*', '/'].includes(value)) { calcPrevious = calcCurrent; calcOperator = value; calcFresh = true; }
  else if (value === '=') {
    if (calcOperator && calcPrevious !== null) {
      const result = calculate(calcPrevious, calcOperator, calcCurrent);
      calcCurrent = Number.isFinite(result) ? String(Number(result.toPrecision(10))) : 'Error';
      calcPrevious = null; calcOperator = null; calcFresh = true;
    }
  } else if (value === '.') {
    if (calcFresh) { calcCurrent = '0.'; calcFresh = false; }
    else if (!calcCurrent.includes('.')) calcCurrent += '.';
  } else {
    if (calcCurrent === '0' || calcFresh || calcCurrent === 'Error') calcCurrent = value;
    else if (calcCurrent.length < 14) calcCurrent += value;
    calcFresh = false;
  }
  renderCalc();
}));

// Demo calendar: selectable dates and time slots, no real booking API.
const monthLabel = document.getElementById('monthLabel');
const calendarDays = document.getElementById('calendarDays');
const selectedDateLabel = document.getElementById('selectedDate');
const timeSlots = document.getElementById('timeSlots');
const bookingNote = document.getElementById('bookingNote');
const bookButton = document.getElementById('bookButton');
let shownMonth = new Date(2026, 9, 1);
let selectedDate = null, selectedTime = null;
const times = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];
function renderCalendar() {
  const year = shownMonth.getFullYear(), month = shownMonth.getMonth();
  monthLabel.textContent = shownMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  calendarDays.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('span');
    calendarDays.appendChild(blank);
  }
  for (let day = 1; day <= count; day++) {
    const btn = document.createElement('button');
    const date = new Date(year, month, day);
    btn.className = 'day';
    btn.textContent = day;
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) btn.classList.add('selected');
    const now = new Date();
    if (date.toDateString() === now.toDateString()) btn.classList.add('today');
    // Only future dates can be selected.
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (date < today) btn.disabled = true;
    btn.addEventListener('click', () => {
      selectedDate = date; selectedTime = null;
      selectedDateLabel.textContent = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      renderCalendar(); renderTimes();
      bookingNote.textContent = 'Demo only — no real booking is sent.';
    });
    calendarDays.appendChild(btn);
  }
}
function renderTimes() {
  timeSlots.innerHTML = '';
  if (!selectedDate) { timeSlots.innerHTML = '<p class="empty-times">Choose a date first.</p>'; return; }
  times.forEach(time => {
    const btn = document.createElement('button');
    btn.className = 'time-slot' + (time === selectedTime ? ' selected' : '');
    btn.textContent = time;
    btn.addEventListener('click', () => { selectedTime = time; renderTimes(); });
    timeSlots.appendChild(btn);
  });
}
document.getElementById('prevMonth').addEventListener('click', () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1); renderCalendar(); });
document.getElementById('nextMonth').addEventListener('click', () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1); renderCalendar(); });
bookButton.addEventListener('click', () => {
  if (!selectedDate || !selectedTime) { bookingNote.textContent = 'Please choose a date and a time first.'; bookingNote.style.color = '#fb7185'; return; }
  bookingNote.style.color = '#6ee7b7';
  bookingNote.textContent = `Demo selection: ${selectedDate.toLocaleDateString()} at ${selectedTime}. No booking was sent.`;
});
renderCalendar(); renderTimes();

// Contact form opens a prefilled email draft; no backend is connected.
document.getElementById('contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = data.get('name'), email = data.get('email'), phone = data.get('phone') || 'Not provided', message = data.get('message');
  const destination = 'golamrabby@example.com'; // Replace with your real email address.
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`);
  document.getElementById('formStatus').textContent = 'Opening your email app with the message details…';
  window.location.href = `mailto:${destination}?subject=${subject}&body=${body}`;
});





/* ===== Custom Animated Cursor ===== */

const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");

if (cursorDot && cursorRing) {
    let mouseX = 0;
    let mouseY = 0;

    let ringX = 0;
    let ringY = 0;

    document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    function animateCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;

        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    const hoverElements = document.querySelectorAll(
        "a, button, input, textarea, select, label, [role='button']"
    );

    hoverElements.forEach((element) => {
        element.addEventListener("mouseenter", () => {
            cursorRing.classList.add("hover");
        });

        element.addEventListener("mouseleave", () => {
            cursorRing.classList.remove("hover");
        });
    });
}
