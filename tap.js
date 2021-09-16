//Global Variable
let fingerprint;
let token;
let cartID;
let isProcessing = false;
let products = [];
let quantity = 1 || document.querySelector("#product_quantity").value;

//SOCKETS********************************************************

let socket = io("http://127.0.0.1:3000", {
  forceNew: true,
  reconnection: false,
  autoConnect: false,
  timeout: 5000,
});

socket.on("newConnect", (data) => {
  socket.open();
  console.log("Socket connection to Server established", socket.id);
})

socket.on("disconnect", () => {
  console.log("Client socket disconnected");
  socket.open();
})

socket.on("encryptedFingerPrint", (data) => {
  fingerprint = data
  console.log("Fingerprint Encrypted...",fingerprint);
})

socket.on("error", (error) => {
  alert(error)
  console.log(error);
  resetElements();
})

socket.on("cartID", (data) => {
  cartID = data;
  console.log("PROCESSING CART ID...", cartID);
})

socket.on("util", (data) => {
  console.log(data);
})

socket.on("response", (data) => {
  console.log(data);
  resetElements()
})

//*****CART SECTION*****
//EVENT DELEGATION - Listens for click/onclick events on the webpage depending on browser, and if triggered then calls the makePurchase function.

if (document.body.addEventListener) {
  document.body.addEventListener('click', makePurchase, false);
}
else {
  document.body.attachEvent('onclick', makePurchase);//for IE
}

//EVENT FILTERING - validation on event and instance variables to determine process to follow
async function makePurchase(e) {
  e = e || window.event;//The Event object
  let target = e.target || e.srcElement; //The triggering element  

  if (target.className.match("tap_btn")) { //if button click was a propagated button then continue...

    if (!token) { //if token has been set - this means that the customer has logged in or the token has been saved by previous session
      await retailLogin()
      return
    }

    //DELETING FUNCTION 
    if (isProcessing && target.classList.contains("inCart")) {
      target.disabled = true;
      target.style.backgroundColor = "yellow";
      setTimeout(() => {
        deleteCart();
      }, 750);
      return
    }
    //AMENDING FUNCTION
    else if (isProcessing && !target.classList.contains("initialPurchase")) {
      target.disabled = true;
      setTimeout(() => {
        target.disabled = false;
        amendCart(target);
      }, 1500);
      return
    }
    //PURCHASING FUNCTION
    else {
      purchaseItems(target)
      return
    }
  }
}

//PURCHASING ITEM / GENERATING CART
async function purchaseItems(target) {
  isProcessing = true;
  target.style.backgroundColor = "black"
  target.style.colour = "white"
  target.classList.add("inCart")
  target.classList.add("initialPurchase")
  target.disabled = true;

  setTimeout(async () => {

    target.disabled = false;
    target.style.backgroundColor = "green"

    product = { productID: target.id, quantity: quantity }
    products.push(product);

    await axios.post("http://127.0.0.1:3000/api/v1/cart", {
      fingerprint: fingerprint,
      token: token,
      products: products
    }, { withCredentials: true })
      .then(response => {
        console.log("Order Complete")
        console.log(response.data);
        localStorage.setItem("tap_user_token", response.data.response.token)
        alert(`Order Status: ${response.data.response.order}`)
        //receipt(response.data)
      })
      .catch(err => console.log(err))
  }, 750);
}

//AMENDING CART
async function amendCart(target) {
  target.style.backgroundColor = "green";
  target.classList.add("inCart")

  product = { productID: target.id, quantity: quantity }
  products.push(product);

  await axios.put("http://127.0.0.1:3000/api/v1/cart", {
    fingerprint: fingerprint,
    token: token,
    cartID: cartID,
    products: products
  }, { withCredentials: true })
    .then(response => {
      console.log("Order Complete", response.data.response)
      token = response.data.response.token;
      alert(`Order Status: ${response.data.response.order}`)
      //receipt(response.data)
    })
    .catch(err => console.log(err))
}

//DELETING CART AND ITEMS FROM DATABASE AND STOPPING CART FROM COMPLETING 
async function deleteCart() {

  if (!cartID) {
    console.log("No Cart ID so cant delete");
    return
  }

  await axios.delete("http://127.0.0.1:3000/api/v1/cart", {
    data: {
      cartID: cartID
    }
  })
    .catch(err => {
      console.log(err);
    })
}

//*****LOGIN FUNCTIONS*****
//REGISTRATION - registering new users on the TAP website
async function registerUser() {
  console.log("Form Submitted");

  const user = {
    firstName: regForm_firstName.value,
    lastName: regForm_lastName.value,
    email: regForm_email.value,
    password: regForm_password.value,
    phone: regForm_phone.value,
    houseNumber: regForm_houseNumber.value,
    houseStreet: regForm_houseStreet.value,
    postCode: regForm_postCode.value,
    city: regForm_city.value,
    country: regForm_country.value,
    fingerprint: fingerprint,
    payments: [
      {
        cardType: regForm_cardType.value,
        cardNumber: regForm_cardNumber.value,
        expMonth: regForm_expMonth.value,
        expYear: regForm_expYear.value,
        cvc: regForm_cvc.value,
        cardBrand: regForm_cardBrand.value,
      }
    ],
    preferences: [
      {
        category: regForm_prefCategory.value,
        subCategory: regForm_prefSubCategory.value,
        size: regForm_prefSize.value,
        colour: regForm_prefColour.value
      }
    ]
  }

  if (!user) {
    alert("Error with User Details")
  }

  await axios.post('http://127.0.0.1:3000/api/v1/users/register', {
    user
  })
    .then((response) => {      
      token = response.data.token;
      alert(`Registration Response: ${response.data.message}`);
      window.location.href = "https://shawodonnell.github.io/clientSide/products.html";
      localStorage.setItem("tap_user_token", token);
    })
    .catch(err => console.log(err))

}

//CENTRAL LOGIN FUNCTION - shared with the main tap website and retailers login
async function login(email, password) {
  console.log("Logging in....");

  await axios.post('http://127.0.0.1:3000/api/v1/users/login', {
    email: email,
    password: password,
    fingerprint: fingerprint
  })
    .then((response) => {
      console.log("Log in Response:", response),
      token = response.data.token;
      localStorage.setItem("tap_user_token", token)
    })
    .catch(err => console.log(err))

}

//PROMPTING LOGIN - from retailers website
async function retailLogin() {
  let email = prompt("Please enter your email");
  let password = prompt("Please enter your password");

  if (email == null || email == "" || password == null || password == "") {
    alert("Please enter login details");
  } else {
    login(email, password)
  }

}

//*****UTIL FUNCTIONS*****
//AUDIO on button click
function play() {
  var audio = document.getElementById("audio");
  audio.play();
}

//RESETTING elements after event process has completed either with success or error
function resetElements() {
  products = [];
  isProcessing = false;
  cartID = "";

  Array.from(document.querySelectorAll(".inCart")).map((btn) => {
    btn.style.backgroundColor = "red";
    btn.classList.remove("initialPurchase")
    btn.classList.remove("inCart")
    btn.disabled = false;
  })
}

//FINGERPRINTING initialistion 
function getFingerprint() {
  const fpPromise = FingerprintJS.load()
  fpPromise
    .then(fp => fp.get())
    .then(result => {
      console.log("Fingerprint Unencrypted...",result.visitorId);
      socket.emit("encryptFingerPrint", result.visitorId)
    })
}

//SOCKET reconnection
async function reconnectSocket() {
  socket.open();
  if(socket.id){
    console.log("Socket connected to Server", socket.id);
  }  
}

//Checking if token exists on local domain 
function checkToken() {
  token = localStorage.getItem("tap_user_token");
}

//Generating the Buttons Dynamically on retailers page
function generateButtons() {

  try {

    let resultsArray = [];
    let resultsParsedArray = []
    let resultsAncestors = []
    let parent;

    toArray(document.evaluate(`//text()[contains(.,\'£\')]`, document.body, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null))
    byLength(resultsArray)
    byAncestor(resultsParsedArray[Math.floor(Math.random() * resultsParsedArray.length)])
    byChildNodes(resultsAncestors);
    insertButtons(parent);

    //GenerateButtons FUNCTIONS
    //Change XPATH to Array
    function toArray(results) {
      let result = results.iterateNext();
      while (result) {
        resultsArray.push(result);
        result = results.iterateNext();
      }
    }

    //FILTER ARRAY by Length - £12.99 = length of 6/ under 10 includes all characters £ and dots, pounds and pence
    async function byLength(resultsArray) {
      resultsArray.forEach(element => {
        if (element.length >= 2 && element.length < 10) {
          resultsParsedArray.push(element)
        }
      });


    }

    //FILTER ARRAY by childNode Length
    async function byAncestor(node, previousCount = 0) {

      let currentCount = node.childNodes.length;

      if (node.localName === 'main' || node.nodeName === "main" || node.localName === 'MAIN' || node.nodeName === "MAIN") {
        return
      }

      if (node.localName !== 'main' || node.nodeName !== "main" || node.localName !== 'MAIN' || node.nodeName !== "MAIN") {

        if (currentCount > previousCount) {
          let className = node.className;
          let nodeName = node.nodeName;
          let count = node.childNodes.length;
          resultsAncestors.push({ className, nodeName, count })
        }
        byAncestor(node.parentElement, currentCount)
      }
    }

    function byChildNodes(resultsAncestors) {
      let count = resultsAncestors[0].count
      let name = "";

      for (let i = 1; i < resultsAncestors.length; i++) {

        if (resultsAncestors[i].count > count) {
          count = resultsAncestors[i].count
          name = resultsAncestors[i].className
        }

      }
      parent = name;
    }

    function insertButtons(result) {

      document.querySelector(`.${result}`).childNodes.forEach((e) => {
        if (!e.nodeName.includes("#")) {
          let button = document.createElement('button')
          button.innerText = "Buy"
          button.id = e.id
          button.classList.add("tap_btn");
          e.appendChild(button);
        }

      })

    }
  } catch (error) {
    console.log(error);
  }
}

//EVENT LISTENERS*****************************************************
window.addEventListener("load", function () {
  try {
    console.log("loading....");
    checkToken();
    reconnectSocket();
    getFingerprint();
    generateButtons();
  } catch (error) {
    alert(error)
  }
})


//ARCHIVE*****************NOT USED
//COOKIE
function setCookie(token) {
  document.cookie = `WhyteGoodMan=${token}; SameSite=none; Secure; max-age=86400; Domain=127.0.0.1:3000; Path=/;`
}

function getToken() {
  return document.cookie.match("WhyteGoodMan").input.split("=")[1]
}

async function sleep(ms) {
  console.log("starting sleep...");
  return setTimeout(() => {

  }, ms);
}


function receipt(data) {
  const div = document.querySelector(".receipt");
  receiptData = { name: data.name, date: data.dataOrdered, items: data.items.toString(), price: data.price }
  div.innerHTML = receiptData
}