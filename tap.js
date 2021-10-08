//Global Variable
let fingerprint;
let token;
let cartID;
let isProcessing = false;
let products = [];
let quantity = 1 || document.querySelector("#product_quantity").value;

//SOCKETS********************************************************

try {
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
    console.log("Fingerprint Encrypted...", fingerprint);
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
} catch (error) {
  console.log(error);
}


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

    // if (!token) { //if token has been set - this means that the customer has logged in or the token has been saved by previous session
    //   await retailLogin()
    //   return
    // }

    //DELETING FUNCTION 
    if (isProcessing && target.classList.contains("inCart")) {
      target.disabled = true;
      switchColours(target, "tap_btn_red", "tap_btn_yellow")
      setTimeout(() => {
        deleteCart(target);
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
  generateModal(target);

  isProcessing = true;
  target.classList.add("inCart")
  target.classList.add("initialPurchase")
  target.disabled = true;

  setTimeout(async () => {

    target.disabled = false;
    switchColours(target, "tap_btn_yellow", "tap_btn_green")

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
  switchColours(target, "tap_btn_yellow", "tap_btn_green")
  target.classList.add("inCart")
  products = []
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
async function deleteCart(target) {

  if (!cartID) {
    console.log("No Cart ID so cant delete");
    resetElements();
    return
  }

  await axios.delete("http://127.0.0.1:3000/api/v1/cart", {
    data: {
      cartID: cartID
    }
  }).then(() => {
    alert("Purchase Cancelled")
  })
    .catch(err => {
      console.log(err);
    })
}

//*****USER FUNCTIONS*****
//REGISTRATION - registering new users on the TAP website
async function registerUser() {
  console.log("Processing Registration...");

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
    preferences: preferenceArray
    // [
    //   {
    //     category: regForm_prefCategory.value,
    //     subCategory: regForm_prefSubCategory.value,
    //     size: regForm_prefSize.value,
    //     colour: regForm_prefColour.value
    //   }
    // ]
  }

  console.log("USER", user);

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
    btn.classList.remove("tap_btn_blue")
    btn.classList.remove("tap_btn_green")
    btn.classList.remove("tap_btn_yellow")
    btn.classList.add("tap_btn_red")
    btn.classList.remove("initialPurchase")
    btn.classList.remove("inCart")
    btn.disabled = false;
  })
}

//Swapping Button Colours
function switchColours(target, class1, class2) {
  target.classList.remove(class1);
  target.classList.add(class2);
}

//FINGERPRINTING initialistion 
function getFingerprint() {
  const fpPromise = FingerprintJS.load()
  fpPromise
    .then(fp => fp.get())
    .then(result => {
      console.log("Fingerprint Unencrypted...", result.visitorId);
      socket.emit("encryptFingerPrint", result.visitorId)
    })
}

//SOCKET reconnection
async function reconnectSocket() {
  socket.open();
  if (socket.id) {
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

      if (name.includes(" ")) {
        name = name.split(" ")
      }
      parent = name;
    }

    function insertButtons(result) {

      document.querySelector(`.${result}`).childNodes.forEach((e) => {
        if (!e.nodeName.includes("#" || "text")) {
          let button = document.createElement('button')
          button.id = e.id
          button.classList.add("tap_btn_style");
          button.classList.add("tap_btn_red")
          button.title = "TAP BUTTON"
          e.appendChild(button);
        }

      })

    }
  } catch (error) {
    console.log(error);
  }
}

//REGISTER.HTML CODE*************************************************************

footwear = ["", "Shoes", "Sandles", "Trainers", "Boots"];
footwear.name = "footwear";
topwear = ["", "Jumper", "TeeShirt", "Shirt", "Polo"];
topwear.name = "top";
bottomwear = ["", "Trousers", "Jeans", "Joggers"];
bottomwear.name = "bottoms";
miscwear = ["", "Sunglasses", "Headband"];
miscwear.name = "miscwear";
sportswear = ["", "Swimming trunks", "Boxing Gloves"];
sportswear.name = "sportswear";
combined = [footwear, topwear, bottomwear, miscwear, sportswear]
let preferenceArray = [];
let counter = 0;

function addPreference() {
  preference = {
    prefId: counter,
    category: document.querySelector("#regForm_prefCategory").value,
    subCategory: document.querySelector("#regForm_prefSubCategory").value,
    size: document.querySelector("#regForm_prefSize").value,
    colour: document.querySelector("#regForm_prefColour").value
  }
  preferenceArray.push(preference);
  counter++;

  document.querySelector("#regForm_prefCategory").remove()
  document.querySelector("#regForm_prefSubCategory").remove()
  document.querySelector("#regForm_prefSize").remove()
  document.querySelector("#regForm_prefColour").remove()
  document.querySelector(".utils").classList.remove("hidden");
  document.querySelector("#addPeference").value = "Add Another Preference"

  parent = document.querySelector(".prefUtil")
  div = document.createElement("div")
  div.classList.add("preferenceItem")
  div.innerText = `${preference.category} preference added: ${preference.subCategory}, ${preference.colour}, ${preference.size}`

  button = document.createElement("button")
  button.classList.add("preferenceButton")
  button.title = "Delete this preference"
  button.addEventListener("click", (e) => {
    for (let i = 0; i < preferenceArray.length; i++) {
      const element = preferenceArray[i];
      if (element.prefId == e.view.preference.prefId) {
        preferenceArray.splice(i, 1)
      }
    }
    e.target.parentNode.remove()
    console.log("POST FOR", preferenceArray);
  })
  button.innerText = "X"

  div.appendChild(button)
  parent.prepend(div);

  preferenceCategory();

}

function preferenceCheck() {
  try {
    if (preferenceArray.length == 0) {
      preference = {
        category: document.querySelector("#regForm_prefCategory").value,
        subCategory: document.querySelector("#regForm_prefSubCategory").value,
        size: document.querySelector("#regForm_prefSize").value,
        colour: document.querySelector("#regForm_prefColour").value
      }
      preferenceArray.push(preference);
    }
    registerUser();
  } catch (error) {
    alert(error)
  }
}

function toggleDisplay(section) {
  section.classList.remove("hidden")
  section.scrollIntoView(true)
}

function preferenceCategory() {
  parent = document.querySelector("#preferenceInput")
  categorySelect = document.createElement("select")
  categorySelect.id = `regForm_prefCategory`;
  categorySelect.placeholder = "Card, Klarna or Paypal?"
  categoryArray = ["", "Footwear", "Top", "Bottom"]
  for (let i = 0; i < categoryArray.length; i++) {
    categoryOption = document.createElement("option")
    categoryOption.value = categoryArray[i]
    categoryOption.text = categoryArray[i]
    categorySelect.appendChild(categoryOption)
  }
  parent.appendChild(categorySelect)
  categorySelect.addEventListener("change", async (e) => {
    if (document.querySelector("#regForm_prefSubCategory") == null) {
      await preferenceSubCategory(e.target.value)
      await preferenceSize(e.target.value)
    } else {
      parent.removeChild(document.querySelector("#regForm_prefSubCategory"))
      await preferenceSubCategory(e.target.value)
      await preferenceSize(e.target.value)
    }
  })
}

function preferenceSubCategory(selectedCategory) {

  combined.forEach(array => {
    if (selectedCategory.toLowerCase() == array.name) {
      parent = document.querySelector("#preferenceInput")
      categorySelect = document.createElement("select")
      categorySelect.id = "regForm_prefSubCategory";
      categorySelect.placeholder = "Sub-Category"
      for (let i = 0; i < array.length; i++) {
        categoryOption = document.createElement("option")
        categoryOption.value = array[i]
        categoryOption.text = array[i]
        categorySelect.appendChild(categoryOption)
      }
      parent.appendChild(categorySelect)
      categorySelect.addEventListener("change", async (e) => {
        if (document.querySelector("#regForm_prefColour") == null) {
          await preferenceColour(e.target.value)
          return
        } else {
          parent.removeChild(document.querySelector("#regForm_prefColour"))
          await preferenceColour(e.target.value)
          return
        }
      })
    }
  });
}

function preferenceColour() {
  array = ["", "Red", "Green", "Blue"]
  categorySelect = document.createElement("select")
  categorySelect.id = "regForm_prefColour";
  categorySelect.placeholder = "Colour"
  for (let i = 0; i < array.length; i++) {
    categoryOption = document.createElement("option")
    categoryOption.value = array[i]
    categoryOption.text = array[i]
    categorySelect.appendChild(categoryOption)
  }
  parent.appendChild(categorySelect)
  return;
  // categorySelect.addEventListener("change", (e) => {
  //     if (document.querySelector("#regForm_prefSize") == null) {
  //         preferenceSize(e.target.value)
  //     } else {
  //         parent.removeChild(document.querySelector("#regForm_prefSize"))
  //         preferenceSize(e.target.value)
  //     }
  // })
}

function preferenceSize(selectedCategory) {
  footSize = ["", "8", "9", "10", "11", "12"]
  topSize = ["", "XS", "S", "M", "L", "XL", "XXL"]
  let array;

  switch (selectedCategory.toLowerCase()) {
    case "footwear":
      array = footSize
      break;
    case "top":
      array = topSize
      break;
    default:
      break;
  }

  categorySelect = document.createElement("select")
  categorySelect.id = "regForm_prefSize";
  categorySelect.placeholder = "Size"

  for (let i = 0; i < array.length; i++) {
    categoryOption = document.createElement("option")
    categoryOption.value = array[i]
    categoryOption.text = array[i]
    categorySelect.appendChild(categoryOption)
  }
  parent.appendChild(categorySelect)
  categorySelect.addEventListener("change", (e) => {
    document.querySelector(".prefUtil").classList.remove("hidden")
  })
}

function generateModal() {
  parentDiv = document.createElement("div")

  //HEADER
  headerDiv = document.createElement("div")
  logoDiv = document.createElement("div")
  titleDiv = document.createElement("div")
  headerDiv.append(logoDiv, titleDiv)
  headerDiv.classList.add("modalHeader")
  logoDiv.classList.add("logo", "tap_btn_red")
  titleDiv.classList.add("title")
  titleDiv.innerText = "TAP"

  //BODY
  bodyDiv = document.createElement("div")
  p1 = document.createElement("p")
  p2 = document.createElement("p")
  bodyDiv.classList.add("modalBody")
  parentDiv.append(headerDiv, bodyDiv)
  parentDiv.classList.add("dialog")

  //PLACEMENT
  p1.classList.add("modalLine")
  p1.innerText = "Purchase Initiated..."
  bodyDiv.append(p1)
  bodyDiv.append(p2)
  document.body.append(parentDiv)

  //TIMEOUTS
  let timerCounter = 0;
  let timer = setInterval(() => {
    switch (timerCounter) {
      case 0:
        p2.classList.add("modalLine", "p2")
        p1.innerText = "Matching Preferences..."
        p2.innerText = "Size: M  Color: Blue"
        timerCounter++
        break;
      case 1:
        p1.innerText = "5 Minute Timer started"
        p2.innerHTML = "Green Button to Cancel"
        timerCounter++
        break;
      case 2:
        p1.innerText = "Processing Payment..."
        p2.innerText = "Card Ending: 1234"
        timerCounter++
        break;
      case 3:
        p2.remove();
        p1.innerText = "Purchase Completed"
        timerCounter++
        break;
      case 4:
        parentDiv.id = "hidden"
        timerCounter++
        break;
      default:
        timerCounter=0;
        clearInterval(timer)
        break;
    }
  }, 4000);
}

//LOADING FUNCTIONS AND LISTENERS******************************************
function loadService() {
  let cdns = [
    "//cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js",
    "http://127.0.0.1:3000/socket.io/socket.io.js",
    "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.8/sjcl.min.js"
  ]

  for (const cdn of cdns) {
    let script = document.createElement("script")
    script.async = true
    script.src = cdn
    document.body.appendChild(script)

  }
  console.log("scripts inserted");
  setTimeout(() => {
    getFingerprint();
    reconnectSocket();
    generateButtons();
    checkToken();
  }, 1000);

}

//EVENT LISTENERS*****************************************************
window.addEventListener("load", function () {
  try {
    console.log("loading....");
    loadService();
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