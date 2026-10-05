// 首頁商品網格的假資料佔位
// TODO: 換成真實商品名稱、價格與照片（圖片放 public/products/ 後填 image 欄位）
export const products = [
  { id: "p1", name: "Day6 巨星娃衣・白襯衫套組", price: 680, size: "30CM", image: null },
  { id: "p2", name: "SVT 30CM 娃衣・針織背心", price: 550, size: "30CM", image: null },
  { id: "p3", name: "16CM 娃衣・學院風外套", price: 420, size: "16CM", image: null },
  { id: "p4", name: "10CM 娃衣・毛絨連帽衣", price: 320, size: "10CM", image: null },
  { id: "p5", name: "SVT 30CM 娃衣・格紋短裙", price: 480, size: "30CM", image: null },
  { id: "p6", name: "16CM 娃衣・日常 T 恤三件組", price: 390, size: "16CM", image: null },
];

// 主打商品輪播（對應手繪稿中央「主打商品」橫幅）
// 一次顯示一張，左右箭頭或滑動切換。
// image 填 "/featured/xxx.jpg"（檔案放 public/featured/）；留 null 時顯示 shape 佔位圖形
export const featured = [
  {
    id: "f1",
    name: "本月主打・Day6 應援套組",
    caption: "限量預購中",
    image: null,
    shape: "triangle",
  },
  {
    id: "f2",
    name: "新品上架・SVT 30CM 冬季系列",
    caption: "NEW",
    image: null,
    shape: "square",
  },
  {
    id: "f3",
    name: "人氣回購・基礎款娃衣",
    caption: "BEST",
    image: null,
    shape: "circle",
  },
];
