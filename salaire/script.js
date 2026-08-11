const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const LEGAL_HOURS_PER_MONTH = 151.67;

document.getElementById('salary-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const period = document.getElementById('period').value;
  const monthsPerYear = parseInt(document.getElementById('months').value, 10);
  const ratio = parseFloat(document.getElementById('status').value);
  const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
  const direction = document.querySelector('input[name="direction"]:checked').value;

  if (!(amount >= 0)) {
    return;
  }

  let monthlyAmount;
  if (period === 'year') {
    monthlyAmount = amount / monthsPerYear;
  } else if (period === 'hour') {
    monthlyAmount = amount * LEGAL_HOURS_PER_MONTH;
  } else {
    monthlyAmount = amount;
  }

  let resultMonthly;
  let resultLabel;
  let netMonthly;
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
