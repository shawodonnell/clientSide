//document.cookie = "WhyteGoodMan=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM5NGJkNzFiLWQ5YTEtNGZlOC05NTRhLTQ1YWQ4MzdmZmQ4NSIsImlhdCI6MTYyNzMxODM2OX0.o9pua8PTeM2OBcy366q-Aulf_fSLlCZEKJfA1mhh7K0"
let socket = io("http://127.0.0.1:3000");
let cartID;
let fingerprint = "de4b27d8beca3167f9ec694d76aa5a35";
let userID = "60f85a5ecf06402d10247601"

//SOCKET EVENT LISTENERS
socket.on("connect",()=>{
  console.log("New Server Connection",socket.id);
})

socket.on("failedUserAuth",(data)=>{
  alert(data)
  window.open("www.google.com","_blank")
})

//PAGE EVENT LISTENERS

//simulating logging and cookie being loaded into browser*********************************
document.querySelector("#cookie").addEventListener("click", async () => {
  let url = `http://127.0.0.1:3000/api/v1/users/${userID}`;
      
  await axios.get(url,{withCredentials:true}).then(response=>console.log(response))
})

//NEW CART/PURCHASE********************************************
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
      fingerprint: fingerprint ,
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

//AMENDING A CART**************************************************
document.querySelector("#update").addEventListener("click", async () => {

  socket.on("cartAmended",(data)=>{
    console.log("Order Amended...",data);
  })

  socket.on("cartAmendEror",(data)=>{
    console.log("Order Error...",data);
  })

  socket.on("newCart",(data)=>{
    console.log("new cart...",data);
  })

  socket.on("timerStopped",(data)=>{
    console.log("timer:",data);
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

  await axios.put("http://127.0.0.1:3000/api/v1/cart",{
      fingerprint: fingerprint,
      cartID:cartID,
      userID:userID,
      products: [
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

//DELETING A CART**************************************************
document.querySelector("#delete").addEventListener("click", async () => {

  socket.on("deletingCart",(data)=>{
    console.log("deleting cart...",data);
  })

  socket.on("timerStopped",(data)=>{
    console.log("timer:",data);
  })

  socket.on("cartDeleted",(data)=>{
    console.log("Deleted...",data);
  })

  socket.on("deleteError",(data)=>{
    console.log("ERROR...",data);
  })

  socket.on("disconnectWS",(data)=>{
    console.log("Disconnecting...", data);
    socket.disconnect();
    socket = null
    socket = io("http://127.0.0.1:3000");
    socket.connect();        
  })

  await axios.delete("http://127.0.0.1:3000/api/v1/cart",{
    data:{
      cartID:cartID,
      userID:userID,
    }     
  })
  .then(response=>{
    console.log("DELETE RESPONSE",response)
  })
  .catch(err=>console.log(err))

})

//FUNCTIONS
function play() {
  var audio = document.getElementById("audio");
  audio.play();
}

  // socket.emit("message","Hello from client")
  // socket.on("newMessage",(message)=>{
  //   console.log(message);
  // })





