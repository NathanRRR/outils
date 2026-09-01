const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const pctFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

// Barème progressif 2026 (revenus 2025), par part fiscale. Tranches indexées de 0,9 %
// par rapport au barème 2025 (loi de finances pour 2026, loi n° 2026-103 du 19.2.2026).
// "max" = plafond de la tranche, "rate" = taux appliqué à la portion de revenu dans cette tranche.
const BRACKETS = [
  { max: 11600, rate: 0 },
  { max: 29579, rate: 0.11 },
  { max: 84577, rate: 0.30 },
  { max: 181917, rate: 0.41 },
  { max: Infinity, rate: 0.45 },
];

// Calcule l'impôt "par part" pour un quotient familial donné (revenu / nombre de parts),
// en appliquant le barème tranche par tranche (seule la portion du revenu qui dépasse
// une tranche est taxée au taux supérieur, pas la totalité du revenu).
function computeTaxPerPart(quotient) {
  let tax = 0;
  let prevMax = 0;
  const details = []; // détail par tranche, pour affichage dans le tableau

  for (const bracket of BRACKETS) {
    if (quotient <= prevMax) {
      break; // le quotient ne dépasse pas la tranche précédente, rien à taxer de plus
    }
    const taxable = Math.min(quotient, bracket.max) - prevMax; // portion du revenu dans cette tranche
    const taxInBracket = taxable * bracket.rate;
    tax += taxInBracket;
    details.push({ from: prevMax, to: Math.min(quotient, bracket.max), rate: bracket.rate, taxable, tax: taxInBracket });
    prevMax = bracket.max;
  }

  return { tax, details };
}

document.getElementById('tax-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const income = parseFloat(document.getElementById('income').value);
  const parts = parseFloat(document.getElementById('parts').value);

  if (!(income >= 0) || !(parts >= 1)) {
    return;
  }

  // Principe du quotient familial : on calcule l'impôt sur une seule "part" (revenu
  // divisé par le nombre de parts), puis on remultiplie par le nombre de parts.
  // Ça atténue la progressivité du barème pour les foyers avec plusieurs parts.
  const quotient = income / parts;
  const { tax: taxPerPart, details } = computeTaxPerPart(quotient);
  const totalTax = taxPerPart * parts;
  const averageRate = income > 0 ? (totalTax / income) * 100 : 0;
  // Le taux marginal est celui de la dernière tranche atteinte (le taux qui s'appliquerait
  // à un euro de revenu supplémentaire), pas le taux moyen réellement payé.
  const marginalRate = details.length > 0 ? details[details.length - 1].rate * 100 : 0;

  document.getElementById('total-tax').textContent = eurFormatter.format(totalTax);
  document.getElementById('average-rate').textContent = `${pctFormatter.format(averageRate)} %`;
  document.getElementById('marginal-rate').textContent = `${pctFormatter.format(marginalRate)} %`;
  document.getElementById('tax-formula').textContent =
    `${eurFormatter.format(taxPerPart)} × ${pctFormatter.format(parts)} = ${eurFormatter.format(totalTax)}`;

  // Reconstruit le tableau de détail par tranche à chaque calcul.
  const rows = document.getElementById('bracket-rows');
  rows.innerHTML = '';
  details.forEach((d) => {
    const tr = document.createElement('tr');
    const toLabel = d.to === Infinity ? 'et plus' : eurFormatter.format(d.to);
    tr.innerHTML = `
      <td class="text-start">${eurFormatter.format(d.from)} &ndash; ${toLabel}</td>
      <td>${pctFormatter.format(d.rate * 100)} %</td>
      <td>${eurFormatter.format(d.taxable)}</td>
      <td>${eurFormatter.format(d.tax)}</td>
    `;
    rows.appendChild(tr);
  });

  document.getElementById('result').classList.remove('d-none');
});
