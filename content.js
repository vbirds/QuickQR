// 引入qrcode.js库
// 注意：您需要在manifest.json中添加qrcode.js作为web_accessible_resources

let qrCodeElement = null;
let qrSize = 128;
let showFavicon = true;

function createQRCode(url, favicon) {
  if (qrCodeElement) {
    qrCodeElement.remove();
  }

  const container = document.createElement('div');
  container.className = 'qr-code-container';
  
  const qrCodeDiv = document.createElement('div');
  qrCodeDiv.className = 'qr-code';
  container.appendChild(qrCodeDiv);

  const qrCode = new QRCode(qrCodeDiv, {
    text: url,
    width: qrSize,
    height: qrSize,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  
  if (showFavicon && favicon) {
    const faviconImg = document.createElement('img');
    faviconImg.src = favicon;
    faviconImg.className = 'favicon';
    container.appendChild(faviconImg);
  }
  
  // 添加保存按钮
  const saveButton = document.createElement('button');
  saveButton.textContent = '保存二维码';
  saveButton.className = 'save-button';
  saveButton.addEventListener('click', () => saveQRCodeWithFavicon(qrCodeDiv, favicon));
  container.appendChild(saveButton);

  document.body.appendChild(container);
  qrCodeElement = container;
}

function saveQRCodeWithFavicon(qrCodeDiv, favicon) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const qrCodeImg = qrCodeDiv.querySelector('img');

  canvas.width = qrSize;
  canvas.height = qrSize;

  // 绘制二维码
  ctx.drawImage(qrCodeImg, 0, 0, qrSize, qrSize);

  // 如果有favicon，绘制favicon
  if (showFavicon && favicon) {
    const faviconImg = new Image();
    faviconImg.crossOrigin = 'Anonymous';
    faviconImg.onload = () => {
      const faviconSize = qrSize * 0.2;
      const x = (qrSize - faviconSize) / 2;
      const y = (qrSize - faviconSize) / 2;
      ctx.drawImage(faviconImg, x, y, faviconSize, faviconSize);

      // 保存图片
      const link = document.createElement('a');
      link.download = 'qrcode_with_favicon.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    faviconImg.src = favicon;
  } else {
    // 如果没有favicon，直接保存二维码
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

function toggleQRCode() {
  if (qrCodeElement) {
    qrCodeElement.remove();
    qrCodeElement = null;
  } else {
    const url = window.location.href;
    const favicon = document.querySelector('link[rel*="icon"]')?.href || '';
    createQRCode(url, favicon);
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleQRCode") {
    toggleQRCode();
    sendResponse({success: true});
  }
  return true;
});

// 从存储中加载设置
function loadSettings() {
  chrome.storage.sync.get(['qrSize', 'showFavicon'], (result) => {
    qrSize = result.qrSize || 128;
    showFavicon = result.showFavicon !== undefined ? result.showFavicon : true;
  });
}

// 初始加载设置
loadSettings();

// 监听设置变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.qrSize) {
      qrSize = changes.qrSize.newValue;
    }
    if (changes.showFavicon) {
      showFavicon = changes.showFavicon.newValue;
    }
    // 如果二维码已经显示，则更新它
    if (qrCodeElement) {
      qrCodeElement.remove();
      const url = window.location.href;
      const favicon = document.querySelector('link[rel*="icon"]')?.href || '';
      createQRCode(url, favicon);
    }
  }
});
