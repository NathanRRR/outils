const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
// Base légale française pour un temps plein 35h/semaine : 35 × 52 / 12 = 151,67h/mois.
const LEGAL_HOURS_PER_MONTH = 151.67;

document.getElementById('salary-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const period = document.getElementById('period').value;
  const monthsPerYear = parseInt(document.getElementById('months').value, 10);
  const ratio = parseFloat(document.getElementById('status').value); // ratio net/brut selon le statut choisi
  const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
  const direction = document.querySelector('input[name="direction"]:checked').value;

  if (!(amount >= 0)) {
    return;
  }

  // On ramène toujours le montant saisi à un équivalent mensuel, quelle que soit la période
  // choisie (horaire, mensuel, annuel), pour pouvoir appliquer le même calcul ensuite.
  let monthlyAmount;
  if (period === 'year') {
    // Le nombre de mois de salaire (12, 13, 14...) sert à repasser d'un montant annuel
    // à son équivalent mensuel, pour les salariés payés sur plus de 12 mensualités.
    monthlyAmount = amount / monthsPerYear;
  } else if (period === 'hour') {
    monthlyAmount = amount * LEGAL_HOURS_PER_MONTH;
  } else {
    monthlyAmount = amount;
  }

  // Conversion brut→net ou net→brut selon le sens choisi, via le ratio du statut.
  let resultMonthly;
  let resultLabel;
  let netMonthly; // toujours la valeur "nette", peu importe le sens, pour calculer l'impôt ensuite
  if (direction === 'brut-to-net') {
    resultMonthly = monthlyAmount * ratio;
    resultLabel = 'Salaire net';
    netMonthly = resultMonthly;
  } else {
    resultMonthly = monthlyAmount / ratio;
    resultLabel = 'Salaire brut';
    netMonthly = monthlyAmount;
  }

  document.getElementById('result-label').textContent = resultLabel;
  document.getElementById('result-label-year').textContent = resultLabel;
  document.getElementById('result-month').textContent = eurFormatter.format(resultMonthly);
  document.getElementById('result-year').textContent = eurFormatter.format(resultMonthly * monthsPerYear);

  // Le bloc "net après impôt" n'a de sens que si un taux de prélèvement a été renseigné.
  const afterTaxSection = document.getElementById('result-after-tax');
  if (taxRate > 0) {
    const netAfterTaxMonthly = netMonthly * (1 - taxRate / 100);
    document.getElementById('result-month-after-tax').textContent = eurFormatter.format(netAfterTaxMonthly);
    document.getElementById('result-year-after-tax').textContent = eurFormatter.format(netAfterTaxMonthly * monthsPerYear);
    afterTaxSection.classList.remove('d-none');
  } else {
    afterTaxSection.classList.add('d-none');
  }

  document.getElementById('result').classList.remove('d-none');
});
