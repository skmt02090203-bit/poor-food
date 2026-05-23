const initialMenus = [

  {
    name: "卵かけご飯",
    price: 150,
    image: "egg.jpg",
    ingredients:["卵","米"]
  },
  {
    name: "もやし炒め",
    price: 100,
    image: "moyashi.jpg",
    ingredients:["もやし"]
  },
  {
    name: "カレー",
    price: 400,
    image: "curry.jpg",
    ingredients:["じゃがいも","にんじん"]
  }

];

const menus = [];

let favorites = [];

let notificationTimeout = null;
let fridgeItems =

  JSON.parse(
    localStorage.getItem("fridgeItems")
  ) || [];

let shoppingList =

  JSON.parse(
    localStorage.getItem("shoppingList")
  ) || [];



function suggestMenu() {

  

  let budget =
    document.getElementById("budget").value;

  let ingredientInput =
  document.getElementById("ingredient").value;

  let ingredients =
  ingredientInput
  .split(" ")
  .filter(item => item !== "")

  let result =
    document.getElementById("result");

  let availableMenus =
  menus.filter(menu => {

    return (
      (!budget || menu.price <= budget) &&
      ingredients.every(ingredient =>
        menu.ingredients.includes(ingredient)
      )
    );

  });

const sortSelect = document.getElementById("sortSelect");

const sortType = sortSelect ? sortSelect.value : "new";

if (sortType === "cheap") {

  availableMenus.sort((a, b) => {
    return a.price - b.price;
  });

}

if (sortType === "like") {

  availableMenus.sort((a, b) => {
    return (b.likes || 0) - (a.likes || 0);
  });

}
  
    

  result.innerHTML = "";
  if (availableMenus.length === 0) {
    result.innerHTML = `
      <p>
        条件に合うメニューがありません
      </p>
    `;

    return;
  }

  availableMenus.forEach(menu => {

  const userId = window.auth?.currentUser?.uid || null;

  const isLiked = menu.likedUsers?.includes(userId);


    const isFavorite =
    favorites.includes(menu.name);

  result.innerHTML += `

    <div class="menu-card">

      <img
        src="${menu.image}"
        class="menu-image"
      >

      <h3>${menu.name}</h3>

      <p>${menu.price}円</p>

      <p class="like-count">
  ❤️ ${menu.likes || 0}
</p>


<button
  onclick="likeMenu('${menu.name}')"
  class="like-btn ${isLiked ? 'liked' : ''}"
  
>
  ${isLiked ? "いいね済み ❤️" : "いいね ❤️"}
</button>

      <button
        class="favorite-btn ${isFavorite ? "active" : ""}"
        onclick="toggleFavorite('${menu.name}')"
      >
        ❤️
      </button>

    </div>

  `;
});

}

async function saveFavorite(menuName) {

  const user = window.auth.currentUser;

  if (!user) {

    alert("ログインしてください");

    return;

  }

  try {
    const q = window.query(

  window.collection(window.db, "favorites"),

  window.where("uid", "==", user.uid),

  window.where("food", "==", menuName)

);

const snapshot =
  await window.getDocs(q);

if (!snapshot.empty) {

  alert("既に保存済みです");

  return;

}
    await window.addDoc(

      window.collection(
        window.db,
        "favorites"
      ),

      {
        uid: user.uid,
        food: menuName,
        createdAt: new Date()
      }

    );

    alert(menuName + " を保存しました");

    window.loadFavorites();

  } catch (error) {

    console.error(error);

    alert("保存失敗");

  }

}



function showFavorite() {

  let favorites =
    JSON.parse(
      localStorage.getItem("favoriteMenus")
    ) || [];

  let favorite =
    document.getElementById("favorite");

  favorite.innerHTML = "";

  favorites.forEach(menu => {

    favorite.innerHTML += `
      <div>

        <p>${menu}</p>

        <button onclick="removeFavorite('${menu}')">
          削除
        </button>

      </div>
    `;

  });

}

function removeFavorite(menuName) {

  let favorites =
    JSON.parse(
      localStorage.getItem("favoriteMenus")
    ) || [];

  // 削除
  favorites = favorites.filter(
    favorite => favorite !== menuName
  );

  // 保存し直す
  localStorage.setItem(
    "favoriteMenus",
    JSON.stringify(favorites)
  );

  // 表示更新
  showFavorite();
}

async function removeFirestoreFavorite(id) {

   try {

    await window.deleteDoc(

      window.doc(
        window.db,
        "favorites",
        id
      )

    );

    

    alert("削除しました");

    window.loadFavorites();

  } catch (error) {

    console.error(error);

  }


}

window.menus = menus;

async function toggleFavorite(menuName) {

  if (favorites.includes(menuName)) {

    favorites =
      favorites.filter(name => name !== menuName);

  } else {

    favorites.push(menuName);

    await saveFavorite(menuName);

  }

  suggestMenu();
}

window.suggestMenu = suggestMenu;
window.menus = menus;
window.favorites = favorites;
window.removeFirestoreFavorite =
  removeFirestoreFavorite;
window.toggleDarkMode =
  toggleDarkMode;

function toggleDarkMode() {

  document.body.classList.toggle("dark");

}

async function loadPostedMenus() {

  const querySnapshot = await getDocs(collection(db, "menus"));

  querySnapshot.forEach((doc) => {

    const menu = doc.data();

    menus.push({
      name: menu.name,
      price: menu.price,
      image: menu.image,
      ingredients: menu.ingredients || []
    });

  });

  renderMenus();
}

function showRandomMenu() {

  const randomMenu =

    menus[
      Math.floor(
        Math.random() * menus.length
      )
    ];

  const randomResult =
    document.getElementById("random-result");

  randomResult.innerHTML = `

    <div class="menu-card">

      <img
        src="${randomMenu.image}"
        class="menu-image"
      >

      <h2>
        今日のおすすめ
      </h2>

      <h3>${randomMenu.name}</h3>

      <p class="post-user">

  👤
  ${randomMenu.userEmail || "公式メニュー"}

</p>

      <p>${randomMenu.price}円</p>

    </div>

  `;
}

window.showRandomMenu =
  showRandomMenu;

function addFridgeItem() {

  const input =
    document.getElementById("fridge-input");

  const item = input.value;

  if (!item) return;

  fridgeItems.push(item);

  localStorage.setItem(
  "fridgeItems",
  JSON.stringify(fridgeItems)
);

  input.value = "";

  showFridgeItems();
}

function showFridgeItems() {

  const fridgeList =
    document.getElementById("fridge-list");

  fridgeList.innerHTML = "";

  fridgeItems.forEach(item => {

    fridgeList.innerHTML += `

      <div class="fridge-item">

        ${item}

          <button
      onclick="removeFridgeItem('${item}')"
      class="delete-btn"
    >
      ❌
    </button>

      </div>

    `;

  });

}

window.addFridgeItem =
  addFridgeItem;

function suggestFromFridge() {

  const result =
    document.getElementById("result");

  result.innerHTML = "";

  const matchedMenus = menus.filter(menu => {

    return menu.ingredients.every(ingredient =>

      fridgeItems.includes(ingredient)

    );

  });

  if (matchedMenus.length === 0) {

    result.innerHTML = `
      <p>
        作れる料理がありません
      </p>
    `;

    return;
  }
  const almostMenus = menus.filter(menu => {

  const missingIngredients =

    menu.ingredients.filter(

      ingredient =>

        !fridgeItems.includes(ingredient)

    );

  return (
    missingIngredients.length > 0 &&
    missingIngredients.length <= 2
  );

});

  matchedMenus.forEach(menu => {

    result.innerHTML += `

      <div class="menu-card">

        <img
          src="${menu.image}"
          class="menu-image"
        >

        <h3>${menu.name}</h3>

        <p>${menu.price}円</p>

      </div>

    `;

  });

  result.innerHTML += `
  <h2>
    🛒 あと少しで作れる料理
  </h2>
`;

almostMenus.forEach(menu => {

  const missingIngredients =

    menu.ingredients.filter(

      ingredient =>

        !fridgeItems.includes(ingredient)

    );

  result.innerHTML += `

    <div class="menu-card">

      <img
        src="${menu.image}"
        class="menu-image"
      >

      <h3>${menu.name}</h3>

      <p>
        あと必要:
        ${missingIngredients.join("、")}
      </p>

      <button
  onclick="addToShoppingList('${missingIngredients[0]}')"
>
  🛒 買い物リスト追加
</button>

    </div>

  `;

});

}

window.suggestFromFridge =
  suggestFromFridge;

function removeFridgeItem(itemName) {

  fridgeItems =
    fridgeItems.filter(
      item => item !== itemName
    );

    localStorage.setItem(
  "fridgeItems",
  JSON.stringify(fridgeItems)
);

  showFridgeItems();

}

window.removeFridgeItem =
  removeFridgeItem;

showFridgeItems();

function showShoppingList() {

  const shopping =
    document.getElementById("shopping-list");

  shopping.innerHTML = "";

  shoppingList.forEach(item => {

    shopping.innerHTML += `

      <div class="shopping-item">

        ${item}

        <button
          onclick="removeShoppingItem('${item}')"
          class="delete-btn"
        >
          ❌
        </button>

      </div>

    `;

  });

}

function addToShoppingList(item) {

  if (shoppingList.includes(item)) {

    return;

  }

  shoppingList.push(item);

  localStorage.setItem(
    "shoppingList",
    JSON.stringify(shoppingList)
  );

  showShoppingList();

}

function removeShoppingItem(itemName) {

  shoppingList =
    shoppingList.filter(
      item => item !== itemName
    );

  localStorage.setItem(
    "shoppingList",
    JSON.stringify(shoppingList)
  );

  showShoppingList();

}

window.addToShoppingList =
  addToShoppingList;

window.removeShoppingItem =
  removeShoppingItem;

showShoppingList();



async function addMenu() {

  const name =
    document.getElementById(
      "new-menu-name"
    ).value;

  const price =
    document.getElementById(
      "new-menu-price"
    ).value;

  const image =
    document.getElementById(
      "new-menu-image"
    ).value;

  const ingredients =
    document.getElementById(
      "new-menu-ingredients"
    )
    .value
    .split(" ");

  if (
    !name ||
    !price ||
    !image ||
    ingredients.length === 0
  ) {

    alert("全部入力してください");

    return;
  }

  try {

    await window.addDoc(

      window.collection(
        window.db,
        "menus"
      ),

      {
        
  name,
  price: Number(price),
  image,
  ingredients,

  likes: 0,
  likedUsers: [],

  userEmail:
    window.auth.currentUser.email,

  uid:
    window.auth.currentUser.uid
}
      

    );

    alert("Firestoreに保存成功！");

    loadMenus();

  } catch (error) {

    console.error(error);

    alert("保存失敗");

  }
}

async function loadMenus() {

  const querySnapshot =

    await window.getDocs(

      window.collection(
        window.db,
        "menus"
      )

    );

  menus.length = 0;

  querySnapshot.forEach(doc => {
    menus.push({
      id: doc.id,   // ←これ追加（超重要）
      ...doc.data()
    });
  });

}

window.loadMenus = loadMenus;



async function likeMenu(menuName) {

  const user = window.auth.currentUser;

  if (!user) {
    alert("ログインしてください");
    return;
  }

  const snapshot =
    await window.getDocs(
      window.collection(window.db, "menus")
    );

  for (const docItem of snapshot.docs) {

    const data = docItem.data();

    if (data.name !== menuName) continue;

    let likedUsers = data.likedUsers || [];

    const alreadyLiked = likedUsers.includes(user.uid);

   if (alreadyLiked) {

  // 💔 解除（これが正しい）
  likedUsers = likedUsers.filter(id => id !== user.uid);

  await window.updateDoc(
    window.doc(window.db, "menus", docItem.id),
    {
      likes: Math.max((data.likes || 0) - 1, 0),
      likedUsers
    }
  );

} else {

  // ❤️ 追加
  likedUsers.push(user.uid);

  await window.updateDoc(
    window.doc(window.db, "menus", docItem.id),
    {
      likes: (data.likes || 0) + 1,
      likedUsers
    }
  );

  showHeart(
    window.innerWidth / 2,
    window.innerHeight / 2
  );
}
    break; // ⭐ここ超重要（1件だけ処理）
  }

  await loadMenus();
  suggestMenu();
}
window.likeMenu = likeMenu;

function showHeart(x, y) {
  const heart = document.createElement("div");
  heart.classList.add("heart");
  heart.innerText = "❤️";

  heart.style.left = x + "px";
  heart.style.top = y + "px";

  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 1000);
}

function sortByLikes() {

  menus.sort((a, b) => {

    return (b.likes || 0) - (a.likes || 0);

  });

  suggestMenu();

}
window.sortByLikes = sortByLikes;

async function saveInitialMenus() {

  try {

    const snapshot =
      await window.getDocs(

        window.collection(
          window.db,
          "menus"
        )

      );

    const firestoreMenus = [];

    snapshot.forEach(doc => {

      firestoreMenus.push(
        doc.data().name
      );

    });

    for (const menu of initialMenus) {

      if (
        !firestoreMenus.includes(menu.name)
      ) {

        await window.addDoc(

          window.collection(
            window.db,
            "menus"
          ),

          {
  name: menu.name,
  price: menu.price,
  image: menu.image,
  ingredients: menu.ingredients,

  likes: 0,
  likedUsers: [], // ←これ必須！！

  userEmail: "公式メニュー"
}
        );

        console.log(
          menu.name + " 保存成功"
        );

      }

    }

    console.log(
      "初期メニュー保存完了"
    );

  } catch (error) {

    console.error(
      "保存エラー:",
      error
    );

  }

}

const sortSelect = document.getElementById("sortSelect");

if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    suggestMenu();
  });
}




if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => {
        console.log("Service Worker登録成功");
      })
      .catch((error) => {
        console.log("Service Worker登録失敗", error);
      });
  });
}

// 作れる料理を表示
function showSuggestedMenus() {

  const suggestedContainer =
    document.getElementById("suggested-menus");

  suggestedContainer.innerHTML = "";

  // 冷蔵庫の食材取得
  const fridgeItems =
    JSON.parse(localStorage.getItem("fridgeItems")) || [];

  // 一致したメニュー
  const matchedMenus = menus.filter(menu => {

    // ingredientsが無い場合対策
    if (!menu.ingredients) return false;

    return menu.ingredients.every(ingredient =>
      fridgeItems.includes(ingredient)
    );
  });

  // 表示
  matchedMenus.forEach(menu => {

    const card = document.createElement("div");

    card.className = "menu-card";

    card.innerHTML = `
      <h3>${menu.name}</h3>
      <img src="${menu.image}" width="150">
      <p>${menu.price}円</p>
    `;

    suggestedContainer.appendChild(card);
  });

  // 何もない場合
  if (matchedMenus.length === 0) {

    suggestedContainer.innerHTML =
      "<p>作れる料理がありません</p>";
  }
}


const notifyBtn =
  document.getElementById("notifyBtn");

// 保存状態確認
let notificationEnabled =

  localStorage.getItem(
    "notificationEnabled"
  ) === "true";

// ボタン表示更新
function updateNotifyButton() {

  if (!notifyBtn) return;

  notifyBtn.textContent =

    notificationEnabled
      ? "通知ON中 🔔"
      : "通知OFF";

}

updateNotifyButton();

// ボタンクリック
if (notifyBtn) {

  notifyBtn.addEventListener("click", async () => {

    // OFF → ON
    if (!notificationEnabled) {

      const permission =

        await Notification.requestPermission();

      if (permission === "granted") {

        notificationEnabled = true;

        localStorage.setItem(
          "notificationEnabled",
          "true"
        );

        updateNotifyButton();

        alert("通知がONになりました！");

        // テスト通知
        notificationTimeout = setTimeout(() => {

  // OFFなら通知しない
  if (!notificationEnabled) return;

  navigator.serviceWorker.ready.then(registration => {

    registration.showNotification(
      "節約メニューアプリ",
      {
        body:
          "通知機能が有効になりました！",
        icon: "icon-192.png"
      }
    );

  });

}, 3000);
        

      }

    } else {

      // ON → OFF
      notificationEnabled = false;

      localStorage.setItem(
        "notificationEnabled",
        "false"
      );

      if (notificationTimeout) {

  clearTimeout(notificationTimeout);

}

      updateNotifyButton();

      alert("通知をOFFにしました");

    }

  });

}

function showRanking() {

  console.log(menus);

  const ranking =
    document.getElementById("ranking");

  ranking.innerHTML = "";

  // いいね順ソート
  const sortedMenus = [...menus].sort((a, b) => {

    return (b.likes || 0) - (a.likes || 0);

  });

  sortedMenus.forEach((menu, index) => {

    ranking.innerHTML += `

      <div class="menu-card">

        <h2>
          ${index + 1}位 👑
        </h2>

        <img
          src="${menu.image}"
          class="menu-image"
        >

        <h3>${menu.name}</h3>

        <p>${menu.price}円</p>

        <p>
          ❤️ ${menu.likes || 0}
        </p>

      </div>

    `;

  });

}

window.showRanking = showRanking;

function searchMenu() {

  const keyword =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();

  const result =
    document.getElementById("result");

  result.innerHTML = "";

  // 名前検索
  const filteredMenus = menus.filter(menu => {

    return menu.name
      .toLowerCase()
      .includes(keyword);

  });

  // 0件
  if (filteredMenus.length === 0) {

    result.innerHTML = `
      <p>
        メニューが見つかりません
      </p>
    `;

    return;

  }

  // 表示
  filteredMenus.forEach(menu => {

    result.innerHTML += `

      <div class="menu-card">

        <img
          src="${menu.image}"
          class="menu-image"
        >

        <h3>${menu.name}</h3>

        <p>${menu.price}円</p>

        <p>
          ❤️ ${menu.likes || 0}
        </p>

      </div>

    `;

  });

}

window.searchMenu = searchMenu;

async function init() {

  await saveInitialMenus();

  await loadMenus();

  suggestMenu();

  showSuggestedMenus();

  loadPostedMenus();

}



init();