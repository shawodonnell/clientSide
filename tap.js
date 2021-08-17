let fingerprint;
let token;
let cartID;
let isProcessing = false;

//BROWSERIFY AND FETCH-INJECT SECTION
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
  (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.fetchInject = factory());
  }(this, function () { 'use strict';
  
    /**
     * Copyright (C) Josh Habdas <jhabdas@protonmail.com> (https://habd.as)
     *
     * This software is provided 'as-is', without any express or implied
     * warranty.  In no event will the authors be held liable for any damages
     * arising from the use of this software.
     *
     * Permission is granted to anyone to use this software for any purpose,
     * including commercial applications, and to alter it and redistribute it
     * freely, subject to the following restrictions:
     *
     * 1. The origin of this software must not be misrepresented; you must not
     *    claim that you wrote the original software. If you use this software
     *    in a product, an acknowledgment in the product documentation would be
     *    appreciated but is not required.
     * 2. Altered source versions must be plainly marked as such, and must not be
     *    misrepresented as being the original software.
     * 3. This notice may not be removed or altered from any source distribution.
     */
  
    const head = (function(i,n,j,e,c,t,s){t=n.createElement(j),s=n.getElementsByTagName(j)[0];t.appendChild(n.createTextNode(e.text));t.onload=c(e);s?s.parentNode.insertBefore(t,s):n.head.appendChild(t);}); // eslint-disable-line
  
    /**
     * Fetch Inject module.
     *
     * @module fetchInject
     * @license Zlib
     * @param {(USVString[]|Request[])} inputs Resources you wish to fetch.
     * @param {Promise} [promise] A promise to await before attempting injection.
     * @throws {Promise<ReferenceError>} Rejects with error when given no arguments.
     * @throws {Promise<TypeError>} Rejects with error on invalid arguments.
     * @throws {Promise<Error>} Whatever `fetch` decides to throw.
     * @throws {SyntaxError} Via DOM upon attempting to parse unexpected tokens.
     * @returns {Promise<Object[]>} A promise which resolves to an `Array` of
     *     Objects containing `Response` `Body` properties used by the module.
     */
    const fetchInject = function (inputs, promise) {
      if (!arguments.length) return Promise.reject(new ReferenceError("Failed to execute 'fetchInject': 1 argument required but only 0 present."))
      if (arguments[0] && arguments[0].constructor !== Array) return Promise.reject(new TypeError("Failed to execute 'fetchInject': argument 1 must be of type 'Array'."))
      if (arguments[1] && arguments[1].constructor !== Promise) return Promise.reject(new TypeError("Failed to execute 'fetchInject': argument 2 must be of type 'Promise'."))
  
      const resources = [];
      const deferreds = promise ? [].concat(promise) : [];
      const thenables = [];
  
      inputs.forEach(input => deferreds.push(
        window.fetch(input).then(res => {
          return [res.clone().text(), res.blob()]
        }).then(promises => {
          return Promise.all(promises).then(resolved => {
            resources.push({ text: resolved[0], blob: resolved[1] });
          })
        })
      ));
  
      return Promise.all(deferreds).then(() => {
        resources.forEach(resource => {
          thenables.push({ then: resolve => {
            resource.blob.type.includes('text/css')
              ? head(window, document, 'style', resource, resolve)
              : head(window, document, 'script', resource, resolve);
          } });
        });
        return Promise.all(thenables)
      })
    };
  
    return fetchInject;
  
  }));
  
  },{}],2:[function(require,module,exports){
  const fetchInject2 = require('fetch-inject')
  
  fetchInject2([
      "https://cdn.jsdelivr.net/npm/socket.io-client@4.1.2/dist/socket.io.min.js",
      "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js",
      "//cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.8/sjcl.min.js",
  ])
  
  
  },{"fetch-inject":1}]},{},[2]);
  
//SOCKETS********************************************************

let socket = io("http://127.0.0.1:3000", {
  forceNew: true,
  reconnection: false,
  autoConnect: false,
  timeout: 5000,
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

//SOCKET ERROR HANDLING

socket.on("failedUserAuth", (data) => {
  alert(data)
  //Include https:// otherwise appends URL onto current webpages url //DEPRECATED AFTER REDESIGN OF LOGIN PROCESS
  //window.open("login.html", "_blank")
  resetElements();
})


socket.on("generalAuthError", (data) => {
  alert(data)
  resetElements();
})

socket.on("retailerError", (data) => {
  alert(data);
  resetElements()
})

socket.on("customerAuthError", (data) => {
  alert(data);
  resetElements()
})

socket.on("cartError", (data) => {
  alert(data);
  resetElements()
})

socket.on("deleteError", (data) => {
  console.log("ERROR...", data);
  resetElements();
})

socket.on("cartAmendEror", (data) => {
  console.log("Order Error...", data);
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


//AMENDING CART - LISTENERS

socket.on("cartAmended", (data) => {
  console.log("Order Amended...", data);
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

socket.on("encryptedFingerPrint", (data)=>{
  fingerprint = data
  console.log("Fingerprint Encoded",fingerprint);
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
    if(!token){
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
        token:token,
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
          localStorage.setItem("tap_user_token",response.data.response.token)
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
  console.log("TARGET",target.classList);

  await axios.put("http://127.0.0.1:3000/api/v1/cart", {
    fingerprint: fingerprint,
    token:token,
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
      localStorage.setItem("tap_user_token",token)      
    })
    .catch(err => console.log(err))

}

//Existing User Login on the main TAP website AND retailer website
async function login(email,password) {
  console.log("Logging in....");
  
  await axios.post('http://127.0.0.1:3000/api/v1/users/login', {
    email: email,
    password: password,
    fingerprint: fingerprint
  })
    .then((response) => {
      console.log("Log in Response:", response), 
      token = response.data.token;
      localStorage.setItem("tap_user_token",token)      
    })
    .catch(err=>console.log(err))

}

//Retail Login - loggin in during a shopping session/from a retailers website
async function retailLogin() {
  let email = prompt("Please enter your email");
  let password = prompt("Please enter your password");

  if (email == null || email == "" || password == null || password == "" ) {
    alert("Please enter login details");
  } else {
    login(email,password)
  }

}

//UTIL FUNCTIONS****************************************

//TAP 
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

function initFingerprintJS() {
  const fpPromise = FingerprintJS.load()
  fpPromise
    .then(fp => fp.get())
    .then(result => {
      console.log("Unencoded FP:",result.visitorId);
      socket.emit("encryptFingerPrint",result.visitorId)
    })
}

async function reconnectSocket() {
  socket.open();
  console.log("New Server Connection", socket.id);
}

function checkToken(){
  token = localStorage.getItem("tap_user_token");
}

//EVENT LISTENERS*****************************************************
window.addEventListener("load", function () {
  try {
    console.log("loading....");
    checkToken();
    console.log("TOKEN",token);
    reconnectSocket();
    initFingerprintJS();
  } catch (error) {
    alert(error)
  }

})



//ARCHIVE*****************
//COOKIE
function setCookie(token){
  document.cookie = `WhyteGoodMan=${token}; SameSite=none; Secure; max-age=86400; Domain=127.0.0.1:3000; Path=/;`
}

function getToken(){
  return document.cookie.match("WhyteGoodMan").input.split("=")[1]
}