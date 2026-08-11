// Formate les montants en euros selon les conventions françaises (ex. "1 234,56 €").
const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

document.getElementById('loan-form').addEventListener('submit', (event) => {
  event.preventDefault(); // empêche le rechargement de la page au submit du formulaire

  const amount = parseFloat(document.getElementById('amount').value);
  const annualRate = parseFloat(document.getElementById('rate').value);
  const years = parseInt(document.getElementById('years').value, 10);

  // Garde-fou : on n'affiche un résultat que si les valeurs saisies sont exploitables.
  if (!(amount > 0) || !(years > 0) || annualRate < 0) {
    return;
  }

  // Taux mensuel = taux annuel réparti sur 12 mois. Durée en nombre de mensualités.
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;

  // Formule des annuités constantes (amortissement à mensualité fixe).
  // Cas particulier à 0 % : pas de division par zéro, on répartit juste le capital.
  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = amount / numPayments;
  } else {
    const factor = Math.pow(1 + monthlyRate, numPayments);
    monthlyPayment = (amount * monthlyRate * factor) / (factor - 1);
  }

  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - amount;

  document.getElementById('monthly-payment').textContent = eurFormatter.format(monthlyPayment);
  document.getElementById('total-interest').textContent = eurFormatter.format(totalInterest);
  document.getElementById('total-paid').textContent = eurFormatter.format(totalPaid);
  document.getElementById('result').classList.remove('d-none');
});
