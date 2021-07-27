document.cookie = "WhyteGoodMan=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM5NGJkNzFiLWQ5YTEtNGZlOC05NTRhLTQ1YWQ4MzdmZmQ4NSIsImlhdCI6MTYyNzMxODM2OX0.o9pua8PTeM2OBcy366q-Aulf_fSLlCZEKJfA1mhh7K0"
console.log(document.cookie);
const socket = io("http://localhost:3000");
const cartSocket = io("http://localhost:3000/api/v1/cart")
let cartID;

//simulating logging and cookie being loaded into browser
document.querySelector("#cookie").addEventListener("click", async () => {
    let url = "http://localhost:3000/api/v1/users/60f85a5ecf06402d10247601";
        
    await fetch(url)
    .then(response=>response.json())
    .then(data=>console.log(data))
    .catch(err=>console.log(err))
})

document.querySelector("#cart").addEventListener("click", async () => {

    const url = "http://localhost:3000/api/v1/cart";
    //const url = "http://localhost:2000/";
    let data = {
        fingerprint: "de4b27d8beca3167f9ec694d76aa5a35",
        products: [
            {
                productID: 573901,
                quantity: 2
            },
            {
                productID: 573901,
                quantity: 2
            },
            {
                productID: 573901,
                quantity: 2
            }
        ]
    }
    data = JSON.stringify(data);
    let form = new FormData(data);
    console.log("FORM",form);

    await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/x-www-form-urlencoded',
            'Content-Type': 'application/x-www-form-urlencoded',
            "referrer":"localHost", 
            },
        body: form})
        //.then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.log(err))

})




