// public/js/slider.js

document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('item-payment-boxes');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');

    if (!track || !prevBtn || !nextBtn) return;

    const getScrollAmount = () => {
        const firstItem = track.querySelector('#item-payment-box');
        if (!firstItem) return 300;
        
        const itemWidth = firstItem.offsetWidth;
        const gap = 16; // gap-x-4 = 1rem = 16px
        return itemWidth + gap;
    };

    // ◀ Sola kaydır
    prevBtn.addEventListener('click', () => {
        track.scrollBy({
            left: -getScrollAmount(),
            behavior: 'smooth'
        });
    });

    // ▶ Sağa kaydır
    nextBtn.addEventListener('click', () => {
        track.scrollBy({
            left: getScrollAmount(),
            behavior: 'smooth'
        });
    });

    // 🔄 Buton durumlarını güncelle
    const updateButtonStates = () => {
        const scrollLeft = track.scrollLeft;
        const scrollWidth = track.scrollWidth;
        const clientWidth = track.clientWidth;

        // En solda mı?
        prevBtn.disabled = scrollLeft <= 5;

        // En sağda mı?
        nextBtn.disabled = scrollLeft + clientWidth >= scrollWidth - 5;
    };

    // Scroll olayını dinle
    track.addEventListener('scroll', updateButtonStates);

    // Pencere boyutu değiştiğinde güncelle
    window.addEventListener('resize', updateButtonStates);

    // İlk yüklemede güncelle
    updateButtonStates();

    // 🖱️ Mouse wheel ile yatay kaydırma (opsiyonel)
    track.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            track.scrollBy({
                left: e.deltaY * 2,
                behavior: 'smooth'
            });
        }
    }, { passive: false });
});