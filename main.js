// 依照牧騰生技網頁的對照表（1~15歲），將每個整年對應的人類年齡列出
const table = {
  small: [15, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76], // 小型犬 (1..15)
  medium: [15, 24, 28, 32, 36, 42, 47, 56, 56, 60, 65, 69, 74, 78, 83], // 中型犬
  large: [15, 24, 28, 32, 36, 45, 50, 55, 61, 66, 72, 77, 82, 88, 93], // 大型犬
};

const birthKey = "petBirth";
const typeKey = "petType";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function humanEquivalent(dogAgeYears, sizeKey) {
  // dogAgeYears: 浮點數歲數
  // 若小於1，線性內插 0->1: 我們假設出生到1歲等於表中1歲對應（但會線性處理）
  const arr = table[sizeKey];
  if (dogAgeYears <= 0) {
    return 0;
  }

  // 若大於等於 15，則以最後一年增幅延伸
  const maxIndex = arr.length; // 15
  if (dogAgeYears >= maxIndex) {
    // 以最後一年增量為基準延伸
    const last = arr[maxIndex - 1];
    const prev = arr[maxIndex - 2];
    const lastIncrement = last - prev; // e.g., 76-72 = 4
    const extraYears = dogAgeYears - maxIndex;
    return +(last + extraYears * lastIncrement).toFixed(1);
  }

  // dogAgeYears 在 (0,15) 之間，對整數年進行線性內插
  const low = Math.floor(dogAgeYears);
  const high = Math.ceil(dogAgeYears);
  // 若正好整年，直接回傳表格值
  if (low === high) {
    // 表格 index 0 對應 1 歲 => arr[0] 是 1 歲
    const idx = clamp(low, 1, arr.length) - 1;
    return +arr[idx].toFixed(1);
  }

  // 例如 2.6 歲 -> 介於 2 與 3 之間
  const fraction = dogAgeYears - low;

  // 取得 low 年對應的值（若 low === 0，假設為 0）
  const lowVal = low === 0 ? 0 : arr[clamp(low, 1, arr.length) - 1];
  const highVal = arr[clamp(high, 1, arr.length) - 1];

  const interp = lowVal + (highVal - lowVal) * fraction;
  return +interp.toFixed(1);
}

function calcDogAge(birthDate) {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = (now - birthDate) / msPerDay; // 以日數差計算
  const years = diffDays / 365.2425; // 考慮閏年的平均
  return +years.toFixed(1);
}

document.getElementById("calc-btn").addEventListener("click", () => {
  Calculate();
});

function Calculate() {
  const birthInput = document.getElementById("birth").value;
  const size = document.getElementById("size").value;
  const resultEl = document.getElementById("result");

  if (!birthInput) {
    resultEl.innerHTML = '<span style="color:#c00">請選擇出生日期。</span>';
    return;
  }

  const birth = new Date(birthInput + "T00:00:00");
  const now = new Date();
  if (birth > now) {
    resultEl.innerHTML = '<span style="color:#c00">出生日期不能在未來。</span>';
    return;
  }

  const dogYears = calcDogAge(birth);
  const humanYears = humanEquivalent(dogYears, size);

  //把文字存進 localStorage
  localStorage.setItem(birthKey, birthInput);
  localStorage.setItem(typeKey, size);

  resultEl.innerHTML =
    `狗狗實際（精確）年齡: <strong>${dogYears} 歲</strong><br>` +
    `換算成人類年齡（依體型 ${
      size === "small" ? "小型犬" : size === "medium" ? "中型犬" : "大型犬"
    } 的對照表）: <strong>${humanYears} 歲</strong>`;
}

// 第一次進來頁面時，先試著把舊資料拿出來
const savedBirth = localStorage.getItem(birthKey);
const savedType = localStorage.getItem(typeKey);
if (savedBirth !== null && savedBirth !== "null") {
  document.getElementById("birth").value = savedBirth;
  document.getElementById("size").value = savedType;
  Calculate();
}
