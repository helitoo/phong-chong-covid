//
export function roundTo(number, n) {
  const factor = Math.pow(10, n);
  return Math.round(number * factor) / factor;
}

//
export function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

//

export function updateTime(startTime, timeReplacement) {
  const secondPassed = roundTo((Date.now() - startTime) / 1000 / 60, 2);
  timeReplacement.textContent = secondPassed;
}

//
export function callToast(message, type = "success") {
  const container = document.getElementById("toast-container");

  // Xác định màu/icon theo loại
  const toastConfig = {
    success: {
      color:
        "text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200",
      svg: `<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>`,
    },
    danger: {
      color: "text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200",
      svg: `<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>`,
    },
    warning: {
      color:
        "text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200",
      svg: `<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>`,
    },
  };

  const { color, svg } = toastConfig[type] || toastConfig.success;

  // Tạo phần tử toast
  const toast = document.createElement("div");
  toast.className =
    "flex items-center w-full max-w-xs p-4 mb-2 text-gray-500 bg-white rounded-lg shadow-xl dark:text-gray-400 dark:bg-gray-800 animate-fadeIn mx-auto";

  toast.innerHTML = `
    <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 ${color} rounded-lg">
      <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">${svg}</svg>
    </div>
    <div class="ms-3 text-sm font-normal">${message}</div>
    <button class="ms-auto text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8">
      <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
      </svg>
    </button>
  `;

  // Nút đóng
  toast.querySelector("button").addEventListener("click", () => {
    toast.remove();
  });

  // Thêm vào màn hình
  container.appendChild(toast);

  // Tự động ẩn sau 4 giây
  setTimeout(() => {
    toast.classList.add("animate-fadeOut");
    setTimeout(() => toast.remove(), 1000);
  }, 3700);
}

//
export function drawChart(data, canvasId, chartInstance) {
  const canvas = document.getElementById(canvasId);

  // Hủy chart cũ nếu tồn tại
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Tạo chart mới
  return new Chart(canvas, {
    type: "line",
    data: {
      datasets: data.map((series) => ({
        label: series.label,
        data: series.data,
        borderColor: series.color,
        tension: 0.1,
        fill: false,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "Thời gian",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Điểm",
          },
        },
      },
    },
  });
}
