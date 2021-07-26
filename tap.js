const socket = io("http://localhost:3000");

console.log(window.location.origin);

module.exports = function(io) {
    io.on('connection', function(socket) {
        socket.on('message', function(message) {
            socket.emit('ditConsumer',message.value);
            console.log('from console',message.value);
        });
    });
};

socket.on("message",(data)=>{
    console.log(data);
})
socket.on("catMessage",(data)=>{
    console.log(data);
})

document.querySelector("button").addEventListener("click",async ()=>{
const url = "http://localhost:3000/api/v1/categories/client";
const body = JSON.stringify({data:"hello from client side"})
await fetch(url,{method:'POST','Content-Type':'application/json'},body).then(response=>response.json()).then(
    data=>console.log(data)).catch(err=>console.log(err))

socket.on("catMessage",(data)=>{
        console.log(data);
})
})




