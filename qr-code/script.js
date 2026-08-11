// Utilise la librairie externe "qrcode-generator" (chargée en CDN dans index.html),
// qui expose une fonction globale `qrcode(typeNumber, errorCorrectionLevel)`.
document.getElementById('qr-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const text = document.getElementById('qr-text').value.trim();
  const errorLevel = document.getElementById('error-level').value;
  const cellSize = parseInt(document.getElementById('cell-size').value, 10);
  const errorMessage = document.getElementById('error-message');
  const result = document.getElementById('result');

  if (text === '') {
    return;
  }

  try {
    // typeNumber = 0 : la librairie choisit automatiquement la plus petite taille de
    // grille QR capable de contenir le texte, selon le niveau de correction d'erreur.
    const qr = qrcode(0, errorLevel);
    qr.addData(text);
    qr.make();

    // createDataURL génère directement une image PNG encodée en base64 (data URL),
    // affichable dans une balise <img> et utilisable telle quelle comme lien de téléchargement.
    const dataUrl = qr.createDataURL(cellSize, 4);
    document.getElementById('qr-image').src = dataUrl;
    document.getElementById('download-link').href = dataUrl;

    errorMessage.classList.add('d-none');
    result.classList.remove('d-none');
  } catch (err) {
    // La librairie lève une erreur si le texte dépasse la capacité maximale d'un QR code
    // (dépend du niveau de correction choisi : plus il est élevé, moins il reste de place).
    errorMessage.textContent = 'Impossible de générer le QR code : le texte est trop long pour le niveau de correction choisi. Essayez un niveau plus bas ou un texte plus court.';
    errorMessage.classList.remove('d-none');
    result.classList.add('d-none');
  }
});
