const alertTextEl = document.getElementById('alert-text');
const alertEl = document.getElementById('alert-popup');

function showAlert(alertMessage, durationMs = 4000) {
    alertEl.classList.remove('invisible');
    alertEl.classList.remove('opacity-0');
    alertTextEl.textContent = alertMessage;
    // Süreyi CSS değişkeni olarak ata
    alertTextEl.style.setProperty('--duration', `${durationMs}ms`);

    // Belirtilen süre sonunda kutuyu kaldır/gizle
    setTimeout(() => {
        alertEl.classList.add('invisible');
        alertEl.classList.add('opacity-0');
    }, durationMs);
}

