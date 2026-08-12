const cartModal = document.getElementById("cart-success-modal");
const addedItemNameEl = cartModal?.querySelector("#added-product-name");
const addedItemImgEl = cartModal?.querySelector("#added-product-image");
const continueShoppingBtn = document.getElementById("continue-shopping-btn");



function toggleCartModal(openIt, itemName, itemImageUrl) {
    if (!cartModal) {
        return;
    }

    if (openIt) {
        cartModal.classList.remove("hidden");
        cartModal.classList.remove("opacity-0");
        cartModal.classList.add("opacity-100");
        addedItemNameEl.textContent = itemName;
        addedItemImgEl.src = itemImageUrl;
        return;
    }

    cartModal.classList.add("hidden");
    cartModal.classList.add("opacity-0");
    cartModal.classList.remove("opacity-100");
    addedItemNameEl.textContent = "";
    addedItemImgEl.src = "";
}

continueShoppingBtn.addEventListener("click", () => {
    toggleCartModal(false);
})
