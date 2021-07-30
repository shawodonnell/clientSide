const socket = io("http://127.0.0.1:3000");

//SOCKET EVENT LISTENERS
socket.on("connect", () => {
    console.log("New Server Connection", socket.id);
  })
  
  socket.on("failedUserAuth", (data) => {
    alert(data)
    //Include https:// otherwise appends URL onto current webpages url
    window.open("https://www.google.com", "_blank")
  })

  
  socket.on("retailerError", (data) => {
    alert(data);
  })

  socket.on("customerAuthError", (data) => {
    alert(data);
    window.open("https://www.google.com", "_blank")
  })

  socket.on("orderComplete", (data) => {
    console.log("order Completed", data);
    isProcessing = false;
    Array.from(document.querySelectorAll(".inCart")).map((btn)=>{
      btn.style.backgroundColor = "red";
      btn.classList.remove("initialPurchase")
      btn.classList.remove("inCart")
    })      
  })

  socket.on("timerStarted", (data) => {
    console.log("timer started", data);
  })

  socket.on("deletingCart", (data) => {
    console.log("deleting cart...", data);
  })

  socket.on("timerStopped", (data) => {
    console.log("timer:", data);
  })

  socket.on("cartDeleted", (data) => {
    console.log("Deleted...", data);
    Array.from(document.querySelectorAll(".inCart")).map((btn)=>{
      btn.style.backgroundColor = "red";
      btn.classList.remove("inCart")
    })  
  })

  socket.on("deleteError", (data) => {
    console.log("ERROR...", data);
  })

  socket.on("disconnectWS", (data) => {
    console.log("Disconnecting...", data);
    socket.disconnect();
    socket = null
    socket = io("http://127.0.0.1:3000");
    socket.connect();
  })



  socket.on("cartAmended", (data) => {
    console.log("Order Amended...", data);
  })

  socket.on("cartAmendEror", (data) => {
    console.log("Order Error...", data);
  })

  socket.on("newCart", (data) => {
    console.log("new cart...", data);
  })

  socket.on("timerStopped", (data) => {
    console.log("timer:", data);
  })

  socket.on("orderComplete", (data) => {
    console.log("order Completed", data);
  })

  socket.on("responseIncoming", (data) => {
    console.log("Response...", data);
  })

