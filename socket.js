let socket = io("http://127.0.0.1:3000", {
  forceNew: true,
  reconnection: false,
  autoConnect: false
});

//SOCKET EVENT LISTENERS

socket.on("cartID", (data) => {
  cartID = data;
  console.log("CARTID", cartID);
})

socket.on("newConnect", (data) => {
  console.log(data);
  reconnectSocket()
})

socket.on("disconnect", () => {
  console.log("DISCONNECTING...........");
  reconnectSocket()
})

socket.on("failedUserAuth", (data) => {
  alert(data)
  //Include https:// otherwise appends URL onto current webpages url
  window.open("https://www.google.com", "_blank")
  resetElements();
})

socket.on("retailerError", (data) => {
  alert(data);
  resetElements()
})

socket.on("customerAuthError", (data) => {
  alert(data);
  window.open("https://www.google.com", "_blank")
  resetElements()
})

socket.on("orderComplete", (data) => {
  console.log("order Completed", data);
  isProcessing = false;
  resetElements()  
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
  resetElements()
})

socket.on("deleteError", (data) => {
  console.log("ERROR...", data);
  resetElements();
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
  resetElements();
})

socket.on("responseIncoming", (data) => {
  console.log("Response...", data);
})

//SOCKET FUNCTIONS
async function reconnectSocket() {
    socket.open();
    console.log("New Server Connection", socket.id);
  }