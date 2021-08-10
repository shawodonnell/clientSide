let fingerprint = "";
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
  socket.open();
  console.log("New Server Connection", socket.id);
})

socket.on("disconnect", () => {
  console.log("DISCONNECTING...........");
  socket.open();
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
})

socket.on("deleteError", (data) => {
  console.log("ERROR...", data);
  // resetElements();
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
  console.log("EVENT",e);
  console.log("TARGET",target);

  //TAP BUTTON FILTERING
  if (target.className.match("tap_btn")) {
    //DELETE FUNCTION FILTERING
    if (isProcessing && target.classList.contains("inCart")) {
      target.disabled = true; 
      target.style.backgroundColor = "yellow";
      setTimeout(() => {
        deleteCart(target);       
      }, 1500);
      return      
    }
    //AMEND FUNCTION FILTERING
    if (isProcessing && !target.classList.contains("initialPurchase")) { 
      target.disabled = true;
      setTimeout(() => {
        target.disabled = false;
        amendCart(target); 
      }, 1500);      
      return 
    }

    //PURCHASE ITEMS / START NEW CART
    isProcessing = true;
    target.style.backgroundColor = "black"
    target.classList.add("inCart")
    target.classList.add("initialPurchase")
    target.disabled = true;

    setTimeout(async () => {
    target.disabled = false;
    target.style.backgroundColor = "green"
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
        console.log("Order Complete", response.data) //Stripe Reference
        receipt(response.data)
      })
      .catch(err => console.log(err))//END OF AXIOS
    }, 1500);    
     
  }//END OF IF
}//END OF FUNCTION

//AMENDING CART
async function amendCart(target) {
  target.style.backgroundColor = "green";
  target.classList.add("inCart")
  console.log(target.classList);

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
  await axios.delete("http://127.0.0.1:3000/api/v1/cart", {
    data: {
      cartID: cartID,
      userID: userID,
    }
  })
    .then(response => {
      cartID = "";
      //resetElements();
    })
    .catch(err => {
      console.log(err);
    })
    resetElements(); 
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
    btn.disabled = false;
    isProcessing = false;
  })
}

function receipt(data) {
  const div = document.querySelector(".receipt");
  receiptData = { name: data.name, date: data.dataOrdered, items: data.items.toString(), price: data.price }
  div.innerHTML = receiptData
}

async function sleep(ms) {
  console.log("starting sleep...");
  return setTimeout(() => {
    
  }, ms);
}

//Fingerprint Function
function initFingerprintJS() {
  const fpPromise = FingerprintJS.load()

  fpPromise
    .then(fp => fp.get())
    .then(result => {
      fingerprint = result.visitorId
      console.log("FingerPrint",fingerprint)
    })
}

//PAGE EVENT LISTENERS
//simulating logging and cookie being loaded into browser*********************************
document.querySelector("#cookie").addEventListener("click", async () => {
  let url = `http://127.0.0.1:3000/api/v1/users/${userID}`;

  await axios.get(url, { withCredentials: true }).then(response => console.log(response))
})

window.addEventListener("load", reconnectSocket)

