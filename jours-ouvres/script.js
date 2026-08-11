const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

// Convertit une valeur de <input type="date"> ("YYYY-MM-DD") en objet Date local.
// On évite volontairement `new Date("YYYY-MM-DD")`, qui interprète la chaîne en UTC et
// peut décaler la date d'un jour selon le fuseau horaire du visiteur.
function parseDateInput(value) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Formate une Date locale en "YYYY-MM-DD", pour servir de clé de comparaison/recherche
// (même remarque que ci-dessus : on n'utilise pas toISOString(), qui convertit en UTC).
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Calcule la date de Pâques pour une année donnée (méthode de Meeus/Jones/Butcher,
// calendrier grégorien). C'est une formule mathématique pure, valable pour n'importe
// quelle année : pas besoin d'API ni de base de données à maintenir.
// Les autres jours fériés mobiles (Ascension, Pentecôte) se déduisent de cette date.
function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Construit la liste des jours fériés français pour une année donnée.
// `territory` permet d'ajouter les jours fériés propres à un territoire (ex. La Réunion),
// en plus du socle commun valable partout en France.
function getFrenchHolidays(year, territory) {
  const easter = getEasterDate(year);
  const holidays = [
    { date: new Date(year, 0, 1), name: "Jour de l'an" },
    { date: addDays(easter, 1), name: 'Lundi de Pâques' }, // Pâques + 1 jour
    { date: new Date(year, 4, 1), name: 'Fête du travail' },
    { date: new Date(year, 4, 8), name: 'Victoire 1945' },
    { date: addDays(easter, 39), name: 'Ascension' }, // Pâques + 39 jours
    { date: addDays(easter, 50), name: 'Lundi de Pentecôte' }, // Pâques + 50 jours
    { date: new Date(year, 6, 14), name: 'Fête nationale' },
    { date: new Date(year, 7, 15), name: 'Assomption' },
    { date: new Date(year, 10, 1), name: 'Toussaint' },
    { date: new Date(year, 10, 11), name: 'Armistice' },
    { date: new Date(year, 11, 25), name: 'Noël' },
  ];

  if (territory === 'reunion') {
    holidays.push({ date: new Date(year, 11, 20), name: "Fête Kaf (abolition de l'esclavage)" });
  }

  return holidays;
}

document.getElementById('days-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const startValue = document.getElementById('start-date').value;
  const endValue = document.getElementById('end-date').value;
  const excludeHolidays = document.getElementById('exclude-holidays').checked;
  const territory = document.getElementById('territory').value;

  if (!startValue || !endValue) {
    return;
  }

  const startDate = parseDateInput(startValue);
  const endDate = parseDateInput(endValue);
  if (startDate > endDate) {
    return;
  }

  // Pré-calcule tous les jours fériés des années couvertes par la période (une période
  // peut chevaucher plusieurs années), dans une Map indexée par date pour un accès rapide.
  const holidaysByDate = new Map();
  for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
    getFrenchHolidays(y, territory).forEach((h) => holidaysByDate.set(toISODate(h.date), h.name));
  }

  let calendarDays = 0;
  let weekendDays = 0;
  let workingDays = 0;
  const holidaysInRange = [];

  // Parcourt chaque jour de la période, du début à la fin inclus, et le classe dans une
  // seule catégorie (week-end en priorité, puis férié, sinon jour ouvré).
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    calendarDays++;
    const dayOfWeek = d.getDay(); // 0 = dimanche, 6 = samedi
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const iso = toISODate(d);
    const holidayName = holidaysByDate.get(iso);

    if (isWeekend) {
      // Un jour férié tombant un week-end est déjà compté ici, pas listé séparément.
      weekendDays++;
    } else if (excludeHolidays && holidayName) {
      holidaysInRange.push({ date: new Date(d), name: holidayName });
    } else {
      workingDays++;
    }
  }

  document.getElementById('calendar-days').textContent = `${calendarDays} j`;
  document.getElementById('weekend-days').textContent = `${weekendDays} j`;
  document.getElementById('working-days').textContent = `${workingDays} j`;

  // Affiche le détail des jours fériés trouvés dans la période (utile pour comprendre
  // d'où vient le décompte), ou masque le bloc s'il n'y en a aucun.
  const holidaysSection = document.getElementById('holidays-section');
  const holidaysList = document.getElementById('holidays-list');
  holidaysList.innerHTML = '';
  if (excludeHolidays && holidaysInRange.length > 0) {
    holidaysInRange.forEach((h) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between';
      li.innerHTML = `<span>${h.name}</span><span class="text-body-secondary">${dateFormatter.format(h.date)}</span>`;
      holidaysList.appendChild(li);
    });
    holidaysSection.classList.remove('d-none');
  } else {
    holidaysSection.classList.add('d-none');
  }

  document.getElementById('result').classList.remove('d-none');
});
