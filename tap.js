let fingerprint;
let token;
let cartID;
let isProcessing = false;

//SOCKETS********************************************************

let socket = io("http://127.0.0.1:3000", {
  forceNew: true,
  reconnection: false,
  autoConnect: false,
  timeout: 5000,
});

socket.on("newConnect", (data) => {
  console.log(data);
  socket.open();
  console.log("New Server Connection", socket.id);
})

socket.on("disconnect", () => {
  console.log("Client socket disconnected");
  socket.open();
})

socket.on("encryptedFingerPrint", (data) => {
  fingerprint = data
  console.log("Fingerprint Encoded", fingerprint);
})

socket.on("error", (error) => {
  alert(error)
  console.log(error);
  //Include https:// otherwise appends URL onto current webpages url //DEPRECATED AFTER REDESIGN OF LOGIN PROCESS
  //window.open("login.html", "_blank")
  resetElements();
})

socket.on("cartID", (data) => {
  cartID = data;
  console.log("CARTID", cartID);
})

socket.on("util", (data) => {
  console.log(data);
})

socket.on("response", (data) => {
  console.log(data);
  resetElements()
})

//CART FUNCTIONS*********************************************************

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

  //TAP BUTTON FILTERING
  if (target.className.match("tap_btn")) {

    //TOKEN CHECK / Retailer login Check
    if (!token) {
      await retailLogin()
    }

    //DELETE FUNCTION FILTERING
    if (isProcessing && target.classList.contains("inCart")) {
      target.disabled = true;
      target.style.backgroundColor = "yellow";
      setTimeout(() => {
        deleteCart(target);
      }, 750);
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
        token: token,
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
          console.log("Order Complete", response.data.response) //Stripe Reference
          localStorage.setItem("tap_user_token", response.data.response.token)
          alert(`Order Status: ${response.data.response.order}`)
          //receipt(response.data)
        })
        .catch(err => console.log(err))
    }, 750);

  }//END OF IF
}//END OF FUNCTION

//AMENDING CART
async function amendCart(target) {
  target.style.backgroundColor = "green";
  target.classList.add("inCart")
  console.log("TARGET", target.classList);

  await axios.put("http://127.0.0.1:3000/api/v1/cart", {
    fingerprint: fingerprint,
    token: token,
    cartID: cartID,
    products: [
      {
        productID: 573901,
        quantity: 2
      }
    ]
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
async function deleteCart(target) {

  if (!cartID) {
    console.log("No Cart ID so cant delete");
    return
  }
  await axios.delete("http://127.0.0.1:3000/api/v1/cart", {
    data: {
      cartID: cartID
    }
  })
    .then(response => {
      cartID = "";
    })
    .catch(err => {
      console.log(err);
    })
}

//LOGIN FUNCTIONS***********************************************

//New User Registering
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
      console.log("Registration Response:", response.data.message),
        token = response.data.token;
      localStorage.setItem("tap_user_token", token)
    })
    .catch(err => console.log(err))

}

//Existing User Login on the main TAP website AND retailer website
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

//Retail Login - loggin in during a shopping session/from a retailers website
async function retailLogin() {
  let email = prompt("Please enter your email");
  let password = prompt("Please enter your password");

  if (email == null || email == "" || password == null || password == "") {
    alert("Please enter login details");
  } else {
    login(email, password)
  }

}

//UTIL FUNCTIONS****************************************

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

function initFingerprintJS() {
  const fpPromise = FingerprintJS.load()
  fpPromise
    .then(fp => fp.get())
    .then(result => {
      socket.emit("encryptFingerPrint", result.visitorId)
    })
}

async function reconnectSocket() {
  socket.open();
  console.log("New Server Connection", socket.id);
}

function checkToken() {
  token = localStorage.getItem("tap_user_token");
}

//Generating the Buttons Dynamically 
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
      console.log(result);

      console.log(document.querySelector(`.${result}`).childNodes);

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
    initFingerprintJS();
    generateButtons();
  } catch (error) {
    alert(error)
  }

})



//ARCHIVE*****************
//COOKIE
function setCookie(token) {
  document.cookie = `WhyteGoodMan=${token}; SameSite=none; Secure; max-age=86400; Domain=127.0.0.1:3000; Path=/;`
}

function getToken() {
  return document.cookie.match("WhyteGoodMan").input.split("=")[1]
}

//function archive
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