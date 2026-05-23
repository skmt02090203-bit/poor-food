// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
  
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Firebase設定
const firebaseConfig = {
 
    apiKey: "AIzaSyDUYsE_VLV8wkQ8HX35HfJ0SHJC9uOc_hI",
    authDomain: "poor-food-c9f8f.firebaseapp.com",
    projectId: "poor-food-c9f8f",
    storageBucket: "poor-food-c9f8f.firebasestorage.app",
    messagingSenderId: "129743011793",
    appId: "1:129743011793:web:91b7e65bd21be60e1a6af0",
    measurementId: "G-DVJCPRDQQD"
};


// Firebase初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// 新規登録
document.getElementById("register-btn").addEventListener("click", () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("登録成功！");
    })
    .catch((error) => {
      alert(error.message);
    });
});

// ログイン
document.getElementById("login-btn").addEventListener("click", () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("ログイン成功！");
    })
    .catch((error) => {
      alert(error.message);
    });
});

// ログアウト
document.getElementById("logout-btn").addEventListener("click", () => {

  signOut(auth)
    .then(() => {
      alert("ログアウトしました");
    });
});

// ログイン状態監視
onAuthStateChanged(auth, (user) => {

  const userInfo = document.getElementById("user-info");

  if (user) {
    userInfo.textContent = `ログイン中: ${user.email}`;
    loadFavorites(); 
      
    } else {
        userInfo.textContent =
      "ログアウト中";

    const favoriteList =
      document.getElementById("favorite-list");

    favoriteList.innerHTML = "";
    
    
        
  }
});







async function loadFavorites() {

  const user = auth.currentUser;

  if (!user) return;

  const favoriteList =
    document.getElementById("favorite-list");

  favoriteList.innerHTML = "";

  const querySnapshot =
    await getDocs(collection(db, "favorites"));

  querySnapshot.forEach((doc) => {

    const data = doc.data();

    if (data.uid === user.uid) {

      const li = document.createElement("li");

      const menuData =
        window.menus.find(
            menu => menu.name === data.food
        );

    if (!menuData) return;



li.innerHTML = `

  <div class="favorite-card">

    <img src="${menuData.image}">

    <div>

      <h3>${data.food}</h3>

      <p>${menuData.price}円</p>

      <button onclick="removeFirestoreFavorite('${doc.id}', '${data.food}')">
        削除
      </button>

    </div>

  </div>

`;

      favoriteList.appendChild(li);

    }

  });

}

window.auth = auth;
window.db = db;
window.addDoc = addDoc;
window.collection = collection;
window.loadFavorites = loadFavorites;
window.deleteDoc = deleteDoc;
window.doc = doc;   
window.query = query;
window.where = where;
window.getDocs = getDocs;
window.updateDoc = updateDoc;
export { db, auth };