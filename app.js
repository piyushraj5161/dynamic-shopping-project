import { getProducts } from "./api.js";

const productContainer =
    document.getElementById("productContainer");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const sortSelect =
    document.getElementById("sortSelect");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const cartContainer = document.getElementById("cartContainer");
const cartTotal = document.getElementById("cartTotal");

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

async function loadProducts() {
    try {
        loading.style.display = "block";
        errorMessage.textContent = "";

        products = await getProducts();

        loadCategories();
        displayProducts(products);
        displayCart();

    } catch (error) {
        errorMessage.textContent =
            "Error loading products. Please try again.";
    } finally {
        loading.style.display = "none";
    }
}

function loadCategories() {
    const categories = [
        ...new Set(products.map(product => product.category))
    ];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function displayProducts(data) {
    productContainer.innerHTML = "";

    if (data.length === 0) {
        productContainer.innerHTML = "<p>No products found.</p>";
        return;
    }

    data.forEach(product => {
        const card = document.createElement("div");
        card.className = "product";

        card.innerHTML = `
            <img src="${product.image}" alt="Product">
            <h3>${product.title}</h3>
            <p>Price: $${product.price}</p>
            <p>⭐ ${product.rating.rate}</p>
            <button class="add-cart">Add to Cart</button>
        `;

        card.querySelector(".add-cart").addEventListener("click", () => {
            addToCart(product.id);
        });

        productContainer.appendChild(card);
    });
}

function filterProducts() {
    let filtered = [...products];

    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const sort = sortSelect.value;

    filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(search)
    );

    if (category !== "all") {
        filtered = filtered.filter(product =>
            product.category === category
        );
    }

    if (sort === "low") {
        filtered.sort((a, b) => a.price - b.price);
    }

    if (sort === "high") {
        filtered.sort((a, b) => b.price - a.price);
    }

    displayProducts(filtered);
}

function addToCart(id) {
    const product = products.find(item => item.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    displayCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    displayCart();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function displayCart() {
    cartContainer.innerHTML = "";

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <p>${item.title}</p>
            <p>Price: $${item.price} × ${item.quantity}</p>
            <button class="remove-cart">Remove</button>
        `;

        div.querySelector(".remove-cart").addEventListener("click", () => {
            removeFromCart(item.id);
        });

        cartContainer.appendChild(div);
    });

    cartTotal.textContent = "Total: $" + total.toFixed(2);
}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
sortSelect.addEventListener("change", filterProducts);

loadProducts();
