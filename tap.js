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

//MAIN CART FUNCTION
async function makePurchase(e) {
  e = e || window.event;//The Event itself
  let target = e.target || e.srcElement; //The button itself  

  if (target.className.match("tap_btn")) {
    if (isProcessing && target.classList.contains("inCart")) {deleteCart(target); return }
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
  }
}

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
      document.querySelector("div").innerHTML = response.data;
    })
    .catch(err => console.log(err))
}

//DELETING CART AND ITEMS FROM DATABASE AND STOPPING CART FROM COMPLETING 
async function deleteCart() {

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

//TAP FUNCTIONS
function play() {
  var audio = document.getElementById("audio");
  audio.play();
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
  receiptData = {name:data.name,date:data.dataOrdered,items:data.items.toString(),price:data.price}
  div.innerHTML = receiptData
}

//PAGE EVENT LISTENERS
//simulating logging and cookie being loaded into browser*********************************
document.querySelector("#cookie").addEventListener("click", async () => {
  let url = `http://127.0.0.1:3000/api/v1/users/${userID}`;

  await axios.get(url, { withCredentials: true }).then(response => console.log(response))
})

window.addEventListener("load", reconnectSocket)

