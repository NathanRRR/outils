const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

document.getElementById('compound-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const principal = parseFloat(document.getElementById('principal').value);
  const contribution = parseFloat(document.getElementById('contribution').value) || 0;
  const annualRate = parseFloat(document.getElementById('rate').value);
  const years = parseInt(document.getElementById('years').value, 10);

  if (!(principal >= 0) || !(years > 0) || annualRate < 0) {
    return;
  }

  // Capitalisation mensuelle : le taux annuel est réparti sur 12 mois.
  const monthlyRate = annualRate / 100 / 12;
  const numMonths = years * 12;

  // Croissance du capital initial seul : intérêts composés classiques (capital × (1+r)^n).
  const principalGrowth = principal * Math.pow(1 + monthlyRate, numMonths);

  // Croissance des versements mensuels : formule de la valeur acquise d'une suite de
  // versements constants (annuité), chaque versement capitalisant depuis son propre mois.
  // Cas particulier à 0 % : pas de division par zéro, on additionne juste les versements.
  let contributionGrowth;
  if (monthlyRate === 0) {
    contributionGrowth = contribution * numMonths;
  } else {
    contributionGrowth = contribution * ((Math.pow(1 + monthlyRate, numMonths) - 1) / monthlyRate);
  }

  const finalAmount = principalGrowth + contributionGrowth;
  const totalContributed = principal + contribution * numMonths;
  const totalInterest = finalAmount - totalContributed;

  document.getElementById('final-amount').textContent = eurFormatter.format(finalAmount);
  document.getElementById('total-contributed').textContent = eurFormatter.format(totalContributed);
  document.getElementById('total-interest').textContent = eurFormatter.format(totalInterest);
  document.getElementById('result').classList.remove('d-none');
});
