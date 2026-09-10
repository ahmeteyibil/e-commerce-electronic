function convertToInCartButton(btn) {
    btn.id = "in-cart-btn";
    btn.classList.remove("bg-indigo-600");
    btn.classList.remove("hover:bg-indigo-700");
    btn.classList.add("hover:bg-green-700");
    btn.classList.add("bg-green-600");
    btn.textContent = "Sepette";
}
