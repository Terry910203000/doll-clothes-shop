/* ============================================================
   娃娃衣商店首頁 — 互動與資料
   純 JavaScript，不需要安裝任何套件，直接開 index.html 就會動。
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     資料：要改商品 / 分類，改這三個陣列就好
     ---------------------------------------------------------- */

  // 左側粉紅選單的分類（HOME 寫死在 HTML，這裡放其餘項目）
  var categories = [
    { label: "Day6 巨星娃衣", href: "#" },
    { label: "SVT 30CM 娃衣", href: "#" },
    { label: "16CM", href: "#" },
    { label: "10CM", href: "#" }
  ];

  // 主打商品輪播。shape 只是還沒放照片時的佔位圖形
  var featured = [
    { name: "本月主打・Day6 應援套組", caption: "限量預購中", shape: "triangle" },
    { name: "新品上架・SVT 30CM 冬季系列", caption: "NEW", shape: "square" },
    { name: "人氣回購・基礎款娃衣", caption: "BEST", shape: "circle" }
  ];

  // 商品網格。有照片時填 image: "images/xxx.jpg"，留 null 則顯示色塊佔位
  var products = [
    { name: "Day6 巨星娃衣・白襯衫套組", price: 680, size: "30CM", image: null },
    { name: "SVT 30CM 娃衣・針織背心", price: 550, size: "30CM", image: null },
    { name: "16CM 娃衣・學院風外套", price: 420, size: "16CM", image: null },
    { name: "10CM 娃衣・毛絨連帽衣", price: 320, size: "10CM", image: null },
    { name: "SVT 30CM 娃衣・格紋短裙", price: 480, size: "30CM", image: null },
    { name: "16CM 娃衣・日常 T 恤三件組", price: 390, size: "16CM", image: null }
  ];

  /* ----------------------------------------------------------
     小工具
     ---------------------------------------------------------- */

  var $ = function (id) { return document.getElementById(id); };

  var twd = new Intl.NumberFormat("zh-TW");

  // 把使用者資料當文字插入，避免品名裡的符號被當成 HTML
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  // 主打商品的佔位圖形
  var shapes = {
    triangle: '<polygon points="50,14 88,86 12,86"/>',
    square: '<rect x="16" y="16" width="68" height="68"/>',
    circle: '<circle cx="50" cy="50" r="34"/>'
  };

  /* ----------------------------------------------------------
     畫面產生
     ---------------------------------------------------------- */

  function renderCategories() {
    var list = $("drawer-list");
    if (!list) return;

    list.innerHTML = categories.map(function (item) {
      return '<li><a class="drawer__link" href="' + escapeHtml(item.href) + '">' +
             escapeHtml(item.label) + "</a></li>";
    }).join("");
  }

  function renderFeatured() {
    var track = $("carousel-track");
    if (!track) return;

    track.innerHTML = featured.map(function (item) {
      var shape = shapes[item.shape] || shapes.circle;
      return '<li class="slide">' +
               '<a class="slide__link" href="#">' +
                 '<div class="slide__media">' +
                   '<svg class="slide__shape" viewBox="0 0 100 100" aria-hidden="true">' + shape + "</svg>" +
                 "</div>" +
                 '<div class="slide__text">' +
                   '<span class="slide__caption">' + escapeHtml(item.caption) + "</span>" +
                   '<span class="slide__name">' + escapeHtml(item.name) + "</span>" +
                 "</div>" +
               "</a>" +
             "</li>";
    }).join("");
  }

  function renderProducts() {
    var grid = $("product-grid");
    if (!grid) return;

    grid.innerHTML = products.map(function (item) {
      var media = item.image
        ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '">'
        : '<span class="card__size">' + escapeHtml(item.size) + "</span>";

      return '<li>' +
               '<article class="card">' +
                 '<a class="card__link" href="#">' +
                   '<div class="card__media">' + media + "</div>" +
                   '<h3 class="card__name">' + escapeHtml(item.name) + "</h3>" +
                   '<p class="card__price">' +
                     '<span class="card__currency">NT$</span>' + twd.format(item.price) +
                   "</p>" +
                 "</a>" +
               "</article>" +
             "</li>";
    }).join("");
  }

  /* ----------------------------------------------------------
     左側分類抽屜
     ---------------------------------------------------------- */

  var drawer = $("drawer");
  var backdrop = $("drawer-backdrop");
  var btnMenu = $("btn-menu");
  var btnDrawerClose = $("btn-drawer-close");

  function openDrawer() {
    closeMember();
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
    drawer.removeAttribute("inert");
    btnMenu.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";  // 鎖住背景捲動
    drawer.focus();
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    drawer.setAttribute("inert", "");
    btnMenu.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    btnMenu.focus();
  }

  function isDrawerOpen() {
    return drawer.classList.contains("is-open");
  }

  /* ----------------------------------------------------------
     會員下拉
     ---------------------------------------------------------- */

  var member = $("member-menu");
  var btnMember = $("btn-member");

  function openMember() {
    member.classList.add("is-open");
    member.removeAttribute("inert");
    btnMember.setAttribute("aria-expanded", "true");
  }

  function closeMember() {
    member.classList.remove("is-open");
    member.setAttribute("inert", "");
    btnMember.setAttribute("aria-expanded", "false");
  }

  function isMemberOpen() {
    return member.classList.contains("is-open");
  }

  /* ----------------------------------------------------------
     綁定事件
     ---------------------------------------------------------- */

  function bindEvents() {
    btnMenu.addEventListener("click", openDrawer);
    btnDrawerClose.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);

    // 抽屜裡點任何連結就關掉
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeDrawer();
    });

    btnMember.addEventListener("click", function () {
      if (isMemberOpen()) closeMember();
      else openMember();
    });

    // 點到下拉與觸發鈕以外的地方就收起來
    document.addEventListener("pointerdown", function (e) {
      if (!isMemberOpen()) return;
      if (member.contains(e.target)) return;
      if (btnMember.contains(e.target)) return;
      closeMember();
    });

    member.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMember();
    });

    // Esc 關閉目前開著的那一個
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (isDrawerOpen()) closeDrawer();
      else if (isMemberOpen()) closeMember();
    });

    // 主打商品左右捲動
    var track = $("carousel-track");
    $("btn-prev").addEventListener("click", function () { scrollTrack(track, -1); });
    $("btn-next").addEventListener("click", function () { scrollTrack(track, 1); });
  }

  function scrollTrack(track, dir) {
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth * 0.7, behavior: "smooth" });
  }

  /* ----------------------------------------------------------
     啟動
     ---------------------------------------------------------- */

  renderCategories();
  renderFeatured();
  renderProducts();
  bindEvents();

  $("year").textContent = new Date().getFullYear();
})();
