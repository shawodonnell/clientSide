let fingerprint = "de4b27d8beca3167f9ec694d76aa5a35";
let userID = "60f85a5ecf06402d10247601"
let cartID = "";
let isProcessing = false;
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
  Array.from(document.querySelectorAll(".inCart")).map((btn) => {
    btn.style.backgroundColor = "red";
    btn.classList.remove("inCart")
  })
})

socket.on("deleteError", (data) => {
  console.log("ERROR...", data);
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

//EVENT DELEGATION - handling browsers
if (document.body.addEventListener) {
  document.body.addEventListener('click', makePurchase, false);
}
else {
  document.body.attachEvent('onclick', makePurchase);//for IE
}

async function makePurchase(e) {
  e = e || window.event;//The Event itself
  let target = e.target || e.srcElement; //The button itself  

  if (target.className.match("tap_btn")) {
    if (isProcessing && target.classList.contains("inCart")) {deleteCart(target); return }
    if (isProcessing && !target.classList.contains("initialPurchase")) { amendCart(target); return }

    //PURCHASE
    isProcessing = true;
    target.style.backgroundColor = "green"
    target.classList.add("inCart")
    target.classList.add("initialPurchase")

    await axios.post("http://127.0.0.1:3000/api/v1/cart", {
      fingerprint: fingerprint,
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
    }, { withCredentials: true })
      .then(response => {
        console.log("Order Complete", response.data)
        receipt(response.data)
      })
      .catch(err => console.log(err))
  }
}

async function amendCart(target) {
  //AMEND
  console.log("Amend Hit");
  //AMEND
  target.style.backgroundColor = "green";
  target.classList.add("inCart")

  await axios.put("http://127.0.0.1:3000/api/v1/cart", {
    fingerprint: fingerprint,
    cartID: cartID,
    userID: userID,
    products: [
      {
        productID: 573901,
        quantity: 2
      }
    ]
  }, { withCredentials: true })
    .then(response => {
      console.log("Order Complete", response.data)
      document.querySelector("div").innerHTML = response.data;
    })
    .catch(err => console.log(err))
}

async function deleteCart() {
  //DELETE  
  console.log("Delete - HIT from TAP");

  if (!cartID) {
    return
  }

  isProcessing = false;
  await axios.delete("http://127.0.0.1:3000/api/v1/cart", {
    data: {
      cartID: cartID,
      userID: userID,
    }
  })
    .then(response => {
      console.log("DELETE RESPONSE", response)
      cartID = "";
    })
    .catch(err => console.log(err))

}

//FUNCTIONS
function play() {
  var audio = document.getElementById("audio");
  audio.play();
}

async function reconnectSocket() {
  socket.open();
  console.log("New Server Connection", socket.id);
}

function resetElements(){
  Array.from(document.querySelectorAll(".inCart")).map((btn) => {
    btn.style.backgroundColor = "red";
    btn.classList.remove("initialPurchase")
    btn.classList.remove("inCart")
  })
}

function receipt(data){
  const div = document.querySelector(".receipt");
  div.innerHTML(data.name,data.dataOrdered,data.items.toString(),data.price)
  
}

//PAGE EVENT LISTENERS
//simulating logging and cookie being loaded into browser*********************************
document.querySelector("#cookie").addEventListener("click", async () => {
  let url = `http://127.0.0.1:3000/api/v1/users/${userID}`;

  await axios.get(url, { withCredentials: true }).then(response => console.log(response))
})

window.addEventListener("load", reconnectSocket)

