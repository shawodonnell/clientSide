//document.cookie = "WhyteGoodMan=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM5NGJkNzFiLWQ5YTEtNGZlOC05NTRhLTQ1YWQ4MzdmZmQ4NSIsImlhdCI6MTYyNzMxODM2OX0.o9pua8PTeM2OBcy366q-Aulf_fSLlCZEKJfA1mhh7K0"
let socket = io("http://127.0.0.1:3000");
let cartID;

socket.on("connect",()=>{
  console.log("New Server Connection",socket.id);
})

// socket.on("disconnect",()=>{
//   socket.connect();
//   socket.sendBuffer = [];
//   console.log("Server reconnected",socket.id);
// })

//simulating logging and cookie being loaded into browser
document.querySelector("#cookie").addEventListener("click", async () => {
  let url = "http://127.0.0.1:3000/api/v1/users/60f85a5ecf06402d10247601";
      
  await axios.get(url,{withCredentials:true}).then(response=>console.log(response))
})

//Simluating cart button being hit
document.querySelector("#cart").addEventListener("click", async () => {

  socket.on("cartID",(data)=>{
    cartID = data;
    console.log("CARTID",cartID);
  })

  socket.on("orderProcessing",(data)=>{
    console.log("orderProcessing",data);
  })

  socket.on("timerStarted",(data)=>{
    console.log("timer started",data);
  })

  socket.on("orderComplete",(data)=>{
    console.log("order Completed",data);
  })

  socket.on("responseIncoming",(data)=>{
    console.log("Response...",data);
  })

  socket.on("disconnectWS",(data)=>{
    console.log("Disconnecting...", data);
    socket.disconnect();
    socket = null
    socket = io("http://127.0.0.1:3000");
    socket.connect();        
  })

  await axios.post("http://127.0.0.1:3000/api/v1/cart",{
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
  },{withCredentials: true})
  .then(response=>{
    console.log("Order Complete",response.data)
    document.querySelector("div").innerHTML = response.data;
  })
  .catch(err=>console.log(err))

})




  // socket.emit("message","Hello from client")
  // socket.on("newMessage",(message)=>{
  //   console.log(message);
  // })





