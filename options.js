const qrSizeInput = document.getElementById('qrSize');
const qrSizeValue = document.getElementById('qrSizeValue');
const showFaviconCheckbox = document.getElementById('showFavicon');
const saveButton = document.getElementById('saveButton');

// 加载保存的设置
function loadSettings() {
  chrome.storage.sync.get(['qrSize', 'showFavicon'], (result) => {
    qrSizeInput.value = result.qrSize || 128;
    qrSizeValue.textContent = qrSizeInput.value;
    showFaviconCheckbox.checked = result.showFavicon !== undefined ? result.showFavicon : true;
  });
}

// 更新UI
function updateUI() {
  qrSizeValue.textContent = qrSizeInput.value;
}

// 保存设置
function saveSettings() {
  const qrSize = parseInt(qrSizeInput.value);
  const showFavicon = showFaviconCheckbox.checked;
  
  chrome.storage.sync.set({ qrSize, showFavicon }, () => {
    alert('设置已保存');
  });
}

// 事件监听器
qrSizeInput.addEventListener('input', updateUI);
saveButton.addEventListener('click', saveSettings);

// 初始加载设置
loadSettings();