document.addEventListener("DOMContentLoaded", function () {

    const products = [
        {
            id: 1,
            name: "Brembo Ön Fren Balatası",
            price: 1450,
            image: "https://images.unsplash.com/photo-1619767886558-efdc7cfc8c90"
        },
        {
            id: 2,
            name: "Bosch Akü 72Ah",
            price: 3200,
            image: "https://images.unsplash.com/photo-1605559424843-9e4c228d8e3b"
        },
        {
            id: 3,
            name: "Hava Filtresi Seti",
            price: 650,
            image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f"
        },
        {
            id: 4,
            name: "Yağ Filtresi",
            price: 280,
            image: "https://images.unsplash.com/photo-1619767886359-d6f1c6c9e7f2"
        },
        {
            id: 5,
            name: "LED Xenon Far Ampulü",
            price: 900,
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70"
        },
        {
            id: 6,
            name: "Spor Direksiyon Simidi",
            price: 2100,
            image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c"
        }
    ];

    const productList = document.getElementById("product-list");

    products.forEach(product => {

        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.price} TL</p>
            <button onclick="addToCart(${product.id})">Sepete Ekle</button>
        `;

        productList.appendChild(productCard);
    });

});

function addToCart(id) {
    alert("Ürün sepete eklendi! Ürün ID: " + id);
}
