const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

document.getElementById('salary-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const period = document.getElementById('period').value;
  const ratio = parseFloat(document.getElementById('status').value);
  const direction = document.querySelector('input[name="direction"]:checked').value;

  if (!(amount >= 0)) {
    return;
  }

  const monthlyAmount = period === 'year' ? amount / 12 : amount;

  let resultMonthly;
  let resultLabel;
  if (direction === 'brut-to-net') {
    resultMonthly = monthlyAmount * ratio;
    resultLabel = 'Salaire net';
  } else {
    resultMonthly = monthlyAmount / ratio;
    resultLabel = 'Salaire brut';
  }

  document.getElementById('result-label').textContent = resultLabel;
  document.getElementById('result-label-year').textContent = resultLabel;
  document.getElementById('result-month').textContent = eurFormatter.format(resultMonthly);
  document.getElementById('result-year').textContent = eurFormatter.format(resultMonthly * 12);
  document.getElementById('result').classList.remove('d-none');
});
