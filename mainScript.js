import {
  randInt,
  roundTo,
  updateTime,
  drawChart,
  callToast,
} from "./helper.js";
import { provinceData, otherData, otherDFData, dataHistory } from "./model.js";
import { addEventListeners } from "./eventListeners.js";

//
function setUpData() {
  for (const province of provinceData) {
    province.numCase = randInt(1, 2);
    province.numHealth -= province.numCase;
  }

  otherData.globalVaccinePrice = Math.max(
    roundTo(50 / otherData.numGlobalVaccine, 0),
    1
  );
}

//
function getSumByAtt(attribute) {
  let temp = 0;

  for (const province of provinceData) temp += province[attribute];

  return temp;
}

//
function updateSumData() {
  otherData.numHealth = getSumByAtt("numHealth");
  otherData.numCase = getSumByAtt("numCase");
  otherData.numDeath = getSumByAtt("numDeath");
}

//
function renderStatistics() {
  for (const province of provinceData) {
    document.getElementById(
      `${province.provinceId}-numCase-replacement`
    ).textContent = province.numCase;

    document.getElementById(
      `${province.provinceId}-population-replacement`
    ).textContent = province.numHealth + province.numCase + province.numDeath;
  }

  for (const att in otherData)
    document.getElementById(`${att}-replacement`).innerText = otherData[att];
}

//
let totalChart = null;
let localChart = null;

function updateChart() {
  // Thêm dữ liệu mới vào lịch sử - lấy timestamp từ element
  const currentTime = parseFloat(
    document.getElementById("time-replacement").innerText
  );
  dataHistory.timestamps.push(currentTime);

  // Đẩy dữ liệu hiện tại từ otherData vào lịch sử
  dataHistory.cash.push(otherData.cash);
  dataHistory.credit.push(otherData.credit);
  dataHistory.science.push(otherData.science);
  dataHistory.social.push(otherData.social);
  dataHistory.numLocalVaccine.push(otherData.numLocalVaccine);
  dataHistory.numHealth.push(otherData.numHealth);
  dataHistory.numCase.push(otherData.numCase);
  dataHistory.numDeath.push(otherData.numDeath);

  // Giới hạn số lượng điểm dữ liệu (ví dụ: 30 điểm gần nhất)
  // const maxDataPoints = 30;
  // if (dataHistory.timestamps.length > maxDataPoints) {
  //   dataHistory.timestamps.shift();
  //   dataHistory.cash.shift();
  //   dataHistory.credit.shift();
  //   dataHistory.science.shift();
  //   dataHistory.social.shift();
  //   dataHistory.numLocalVaccine.shift();
  //   dataHistory.numHealth.shift();
  //   dataHistory.numCase.shift();
  //   dataHistory.numDeath.shift();
  // }

  const totalData = [
    {
      label: "Ngân sách",
      data: dataHistory.cash.map((value, index) => ({
        x: dataHistory.timestamps[index],
        y: value,
      })),
      color: "oklch(69.6% 0.17 162.48)",
    },
    {
      label: "Số vaccine hiện có",
      data: dataHistory.numLocalVaccine.map((value, index) => ({
        x: dataHistory.timestamps[index],
        y: value,
      })),
      color: "oklch(71.5% 0.143 215.221)",
    },
    {
      label: "Điểm uy tín",
      data: dataHistory.credit.map((value, index) => ({
        x: dataHistory.timestamps[index],
        y: value,
      })),
      color: "oklch(76.9% 0.188 70.08)",
    },
    {
      label: "Điểm khoa học",
      data: dataHistory.science.map((value, index) => ({
        x: dataHistory.timestamps[index],
        y: value,
      })),
      color: "oklch(66.7% 0.295 322.15)",
    },
    {
      label: "Điểm xã hội",
      data: dataHistory.social.map((value, index) => ({
        x: dataHistory.timestamps[index],
        y: value,
      })),
      color: "oklch(68.1% 0.162 75.834)",
    },
  ];

  const localData = [
    {
      label: "Số dân khỏe mạnh",
      data: dataHistory.numHealth.map((value, index) => ({
        x: dataHistory.timestamps[index],
        y: value,
      })),
      color: "oklch(68.5% 0.169 237.323)",
    },
    {
      label: "Số ca nhiễm",
      data: dataHistory.numCase.map((value, index) => ({
        x: dataHistory.timestamps[index],
        y: value,
      })),
      color: "oklch(63.7% 0.237 25.331)",
    },
    {
      label: "Số tử vong",
      data: dataHistory.numDeath.map((value, index) => ({
        x: dataHistory.timestamps[index],
        y: value,
      })),
      color: "oklch(55.4% 0.046 257.417)",
    },
  ];

  totalChart = drawChart(totalData, "total-chart", totalChart);
  localChart = drawChart(localData, "local-chart", localChart);
}

//
function startCounttime(onStop) {
  const startTime = Date.now();
  const timeReplacement = document.getElementById("time-replacement");
  let stopped = false;

  function tick() {
    if (stopped) return;
    updateTime(startTime, timeReplacement);
    setTimeout(tick, 1000);
  }

  updateTime(startTime, timeReplacement);
  tick();

  return function stopCounttime() {
    stopped = true;
    if (onStop) onStop();
  };
}

//
const viewportWidth = window.innerWidth;

function updateTurn(stopTimer) {
  let turnTime =
    ((otherData.numHealth + otherData.credit) / 200) *
      (viewportWidth >= 768 ? 20 : 30) +
    randInt(0, 2);

  if (turnTime < 1 || otherData.numHealth <= 5 || otherData.credit <= 5) {
    callToast("Bạn đã THẤT BẠI!", "danger");
    stopTimer();
    return;
  }

  if (otherData.numCase == 0) {
    callToast("CHIẾN THẮNG");
    stopTimer();
    return;
  }

  // Process global vaccine
  otherData.numGlobalVaccine += Math.floor(17 - turnTime);
  otherData.globalVaccinePrice = Math.max(
    Math.floor((viewportWidth >= 768 ? 20 : 30) / otherData.numGlobalVaccine),
    3
  );

  // Process province

  for (const province of provinceData) {
    // Xác định số ca nhiễm mới (newCases)
    const newCases = Math.max(
      0,
      Math.floor(
        ((((3.25 - province.lockdownLevel) / 3) * 30 +
          ((100 - otherData.credit) / 100) * 30 +
          (province.numHealth / 100) * 40) /
          100) *
          province.numHealth +
          Math.random() * 2
      )
    );

    // Cập nhật dân khỏe mạnh -> bị nhiễm
    province.numHealth -= newCases;
    province.numCase += newCases;

    // Số tử vong trong số ca nhiễm
    const newDeaths = Math.floor(
      ((200 - province.numHealth - otherData.science) / 300) * province.numCase
    );

    province.numDeath += newDeaths;
    province.numCase -= newDeaths;

    // Constraint
    if (province.numHealth < 0) province.numHealth = 0;
    if (province.numCase < 0) province.numCase = 0;
    if (province.numDeath < 0) province.numDeath = 0;

    // Reset
    province.numLocalVaccine = 0;
  }

  updateSumData();

  otherData.credit += Math.floor(
    (otherData.numHealth + otherData.social - 100) / 10
  );

  renderStatistics();

  updateChart();

  callToast("Dữ liệu đã thay đổi!", "warning");

  setTimeout(() => updateTurn(stopTimer), turnTime * 1000);
}

//
document.addEventListener("DOMContentLoaded", () => {
  const stopTimer = startCounttime();
  setUpData();
  updateSumData();
  renderStatistics();
  addEventListeners();
  updateChart();
  setTimeout(
    () => updateTurn(stopTimer),
    (viewportWidth >= 768 ? 20 : 25) * 1000
  );
});
