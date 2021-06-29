importScripts('https://www.gstatic.com/firebasejs/5.5.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.5.1/firebase-messaging.js');


firebase.initializeApp({
  'messagingSenderId': '119362203635'
});

const messaging = firebase.messaging();
