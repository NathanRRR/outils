const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

document.getElementById('split-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const salary1 = parseFloat(document.getElementById('salary1').value);
  const salary2 = parseFloat(document.getElementById('salary2').value);
  const expenses = parseFloat(document.getElementById('expenses').value);

  if (!(salary1 >= 0) || !(salary2 >= 0) || !(expenses >= 0)) {
    return;
  }

  const totalIncome = salary1 + salary2;
  const rest = totalIncome - expenses;
  const individualRest = rest / 2;
  const share1 = salary1 - individualRest;
  const share2 = salary2 - individualRest;

  document.getElementById('total-income').textContent = eurFormatter.format(totalIncome);
  document.getElementById('total-expenses').textContent = eurFormatter.format(expenses);
  document.getElementById('total-rest').textContent = eurFormatter.format(rest);
  document.getElementById('individual-rest').textContent = eurFormatter.format(individualRest);

  document.getElementById('row-salary-1').textContent = eurFormatter.format(salary1);
  document.getElementById('row-salary-2').textContent = eurFormatter.format(salary2);
  document.getElementById('row-individual-rest-1').textContent = eurFormatter.format(individualRest);
  document.getElementById('row-individual-rest-2').textContent = eurFormatter.format(individualRest);

  const share1Cell = document.getElementById('row-share-1');
  const share2Cell = document.getElementById('row-share-2');
  share1Cell.textContent = eurFormatter.format(share1);
  share2Cell.textContent = eurFormatter.format(share2);
  share1Cell.classList.toggle('text-danger', share1 < 0);
  share2Cell.classList.toggle('text-danger', share2 < 0);

  document.getElementById('row-check-1').textContent = eurFormatter.format(salary1 - share1);
  document.getElementById('row-check-2').textContent = eurFormatter.format(salary2 - share2);

  document.getElementById('negative-note').classList.toggle('d-none', share1 >= 0 && share2 >= 0);
  document.getElementById('result').classList.remove('d-none');
});
