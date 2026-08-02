// Firebase Realtime Database — U.E. Rio Jordan
(function () {
  const cfg = {
    apiKey:            "AIzaSyAjcb1i9xSqyvIj3E2axr4jgLAYGJIqGW0",
    authDomain:        "ue-rio-jordan.firebaseapp.com",
    databaseURL:       "https://ue-rio-jordan-default-rtdb.firebaseio.com",
    projectId:         "ue-rio-jordan",
    storageBucket:     "ue-rio-jordan.firebasestorage.app",
    messagingSenderId: "1036455318041",
    appId:             "1:1036455318041:web:c997907a33328159ce9088"
  };
  try {
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    window._fbDB = firebase.database();
  } catch (e) {
    console.warn('[Firebase] No disponible — modo offline:', e.message);
    window._fbDB = null;
  }
})();
