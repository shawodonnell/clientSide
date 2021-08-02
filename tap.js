let fingerprint = "de4b27d8beca3167f9ec694d76aa5a35";
let userID = "60f85a5ecf06402d10247601"
let cartID = "";
let isProcessing = false;

let socket = io("http://127.0.0.1:3000", {
  forceNew: true,
  reconnection: false,
  autoConnect: false,
  timeout:5000,

});

//CONNECTION TO SERVER - LISTENERS
socket.on("newConnect", (data) => {
  console.log(data);
  reconnectSocket()
})

socket.on("disconnect", () => {
  console.log("DISCONNECTING...........");
  reconnectSocket()
})

//AUTHENICATING RETAILER AND USER - LISTENERS

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

//PURCHASING ITEMS - LISTENERS
socket.on("cartID", (data) => {
  cartID = data;
  console.log("CARTID", cartID);
})

//DELETING CART - LISTENERS

socket.on("deletingCart", (data) => {
  console.log("deleting cart...", data);
})

socket.on("cartDeleted", (data) => {
  console.log("Deleted...", data);
  resetElements()
})

socket.on("deleteError", (data) => {
  console.log("ERROR...", data);
  resetElements();
})

//AMENDING CART - LISTENERS

socket.on("cartAmended", (data) => {
  console.log("Order Amended...", data);
})

socket.on("cartAmendEror", (data) => {
  console.log("Order Error...", data);
})

socket.on("newCart", (data) => {
  console.log("new cart...", data);
})

//GENERAL CART RESPONSES - LISTENERS 

socket.on("orderComplete", (data) => {
  console.log("order Completed...", data);
  isProcessing = false;
  resetElements()  
})

socket.on("timerStarted", (data) => {
  console.log("timer started", data);
})

socket.on("timerStopped", (data) => {
  console.log("timer:", data);
})

socket.on("responseIncoming", (data) => {
  console.log("Response...", data);
})

//SOCKET FUNCTIONS
async function reconnectSocket() {
    socket.open();
    console.log("New Server Connection", socket.id);
  }

//EVENT DELEGATION - handling browsers

  if (document.body.addEventListener) {
    document.body.addEventListener('click', makePurchase, false);
  }
  else {
    document.body.attachEvent('onclick', makePurchase);//for IE
  }


//MAIN CART FUNCTION
async function makePurchase(e) {
  e = e || window.event;//The Event itself
  let target = e.target || e.srcElement; //The button itself  

  if (target.className.match("tap_btn")) {
    if (isProcessing && target.classList.contains("inCart")) { target.disabled = true, deleteCart(target); return }
    if (isProcessing && !target.classList.contains("initialPurchase")) { amendCart(target); return }

    //PURCHASE ITEMS / START NEW CART
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
  }//END OF IF
}//END OF FUNCTION

//AMENDING CART
async function amendCart(target) {
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
      receipt(response.data)
    })
    .catch(err => console.log(err))
}

//DELETING CART AND ITEMS FROM DATABASE AND STOPPING CART FROM COMPLETING 
async function deleteCart(target) {

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
    .catch(err => {
      console.log(err);
    })
  target.disabled = false;
}

//TAP FUNCTIONS
function play() {
  var audio = document.getElementById("audio");
  audio.play();
}

function resetElements() {
  Array.from(document.querySelectorAll(".inCart")).map((btn) => {
    btn.style.backgroundColor = "red";
    btn.classList.remove("initialPurchase")
    btn.classList.remove("inCart")
  })
}

function receipt(data) {
  const div = document.querySelector(".receipt");
  receiptData = { name: data.name, date: data.dataOrdered, items: data.items.toString(), price: data.price }
  div.innerHTML = receiptData
}

//PAGE EVENT LISTENERS
//simulating logging and cookie being loaded into browser*********************************
document.querySelector("#cookie").addEventListener("click", async () => {
  let url = `http://127.0.0.1:3000/api/v1/users/${userID}`;

  await axios.get(url, { withCredentials: true }).then(response => console.log(response))
})

window.addEventListener("load", reconnectSocket)

