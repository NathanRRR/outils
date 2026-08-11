const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

document.getElementById('retirement-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const currentAge = parseInt(document.getElementById('current-age').value, 10);
  const retirementAge = parseInt(document.getElementById('retirement-age').value, 10);
  const capital = parseFloat(document.getElementById('capital').value);
  const contribution = parseFloat(document.getElementById('contribution').value) || 0;
  const annualRate = parseFloat(document.getElementById('rate').value);

  // La durée d'épargne se déduit directement des deux âges saisis.
  const years = retirementAge - currentAge;
  if (!(years > 0) || !(capital >= 0) || annualRate < 0) {
    return;
  }

  const monthlyRate = annualRate / 100 / 12;
  const numMonths = years * 12;

  // Même logique que le calculateur d'intérêts composés : croissance du capital déjà
  // épargné + croissance des versements mensuels réguliers (formule de l'annuité).
  const capitalGrowth = capital * Math.pow(1 + monthlyRate, numMonths);
  let contributionGrowth;
  if (monthlyRate === 0) {
    contributionGrowth = contribution * numMonths;
  } else {
    contributionGrowth = contribution * ((Math.pow(1 + monthlyRate, numMonths) - 1) / monthlyRate);
  }

  const finalAmount = capitalGrowth + contributionGrowth;
  const totalContributed = capital + contribution * numMonths;

  // "Règle des 4 %" : retrait annuel jugé soutenable sur le long terme sans épuiser le
  // capital (hypothèse courante en gestion de patrimoine), ici réparti sur 12 mois.
  const monthlyIncome = (finalAmount * 0.04) / 12;

  document.getElementById('duration').textContent = `${years} ans`;
  document.getElementById('total-contributed').textContent = eurFormatter.format(totalContributed);
  document.getElementById('final-amount').textContent = eurFormatter.format(finalAmount);
  document.getElementById('monthly-income').textContent = eurFormatter.format(monthlyIncome);
  document.getElementById('result').classList.remove('d-none');
});
