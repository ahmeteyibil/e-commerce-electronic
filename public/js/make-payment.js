const makePaymentBtn = document.getElementById("make-payment-btn");
const cardInfosForm = document.getElementById("card-infos-form");

makePaymentBtn.addEventListener("click", async ()=>{
    if (!cardInfosForm.checkValidity()) {
        cardInfosForm.reportValidity();  // Tarayıcının kendi uyarısını göster
        return;
    };
    const formData = new FormData(cardInfosForm);
    const objectData = Object.fromEntries(formData.entries());

    const response = await fetch('/cart/pay', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(objectData)
    })
    const data = await response.json();

    if(data.success){
        showAlert("Ödeme işlemi başarılı", 6000);
    }
    else{
        showAlert("Ödeme başarısız", 6000);
    }
});


