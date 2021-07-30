let fingerprint = "de4b27d8beca3167f9ec694d76aa5a35";
let userID = "60f85a5ecf06402d10247601"
let cartID = "";
let isProcessing = false;

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
    if(isProcessing && target.classList.contains("initialPurchase")){deleteCart(target);return}
    if(isProcessing && !target.classList.contains("initialPurchase")){amendCart(target);return}
    
    //PURCHASE
    isProcessing = true;
    target.style.backgroundColor = "green"
    target.classList.add("inCart")
    target.classList.add("initialPurchase")

    socket.on("cartID", (data) => {
      cartID = data;
      console.log("CARTID", cartID);
    })

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
        document.querySelector("div").innerHTML = response.data;
      })
      .catch(err => console.log(err))
  }
}

async function amendCart() {
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

    isProcessing = false;
    await axios.delete("http://127.0.0.1:3000/api/v1/cart", {
      data: {
        cartID: cartID,
        userID: userID,
      }
    })
      .then(response => {
        console.log("DELETE RESPONSE", response)
      })
      .catch(err => console.log(err))

  }


//PAGE EVENT LISTENERS
//simulating logging and cookie being loaded into browser*********************************
document.querySelector("#cookie").addEventListener("click", async () => {
  let url = `http://127.0.0.1:3000/api/v1/users/${userID}`;

  await axios.get(url, { withCredentials: true }).then(response => console.log(response))
})

//FUNCTIONS
function play() {
  var audio = document.getElementById("audio");
  audio.play();
}

