const API_URL = "https://fakestoreapi.com/products";

export async function getProducts() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Products load nahi hue");
    }

    return await response.json();
}
