
console.log(window.url);


document.querySelector("button").addEventListener("click",async ()=>{
const url = "http://localhost:3000/api/v1/categories/client";
const body = JSON.stringify({data:"hello from client side"})
await fetch(url,{method:'POST','Content-Type':'application/json'},body).then(response=>response.json()).then(
    data=>console.log(data)).catch(err=>console.log(err))
})


