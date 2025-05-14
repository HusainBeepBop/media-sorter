let currentFile = "";

function showPopup(message) {
  const popup = document.getElementById("popup");
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 2000);
}

function loadMedia() {
  fetch('/media-list')
    .then(res => res.json())
    .then(files => {
      const reel = document.getElementById('thumbnailReel');
      reel.innerHTML = '';
      files.forEach(file => {
        const ext = file.split('.').pop().toLowerCase();
        let el;
        if (['mp4', 'mov', 'avi', 'mkv', 'flv', 'webm'].includes(ext)) {
          el = document.createElement('video');
          el.src = `/media/${file}`;
          el.muted = true;
          el.loop = true;
          el.play();
        } else {
          el = document.createElement('img');
          el.src = `/media/${file}`;
        }
        el.onclick = () => showPreview(file, el.tagName);
        el.dataset.filename = file;
        reel.appendChild(el);
      });
    });
}

function showPreview(file, type) {
  currentFile = file;
  const preview = document.getElementById('previewArea');
  preview.innerHTML = '';

  if (type === 'VIDEO') {
    const video = document.createElement('video');
    video.src = `/media/${file}`;
    video.controls = true;
    video.autoplay = true;
    preview.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = `/media/${file}`;
    preview.appendChild(img);
  }

  const allThumbs = document.getElementById('thumbnailReel').children;
  for (let thumb of allThumbs) {
    if (thumb.dataset.filename === file) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'center' });
      break;
    }
  }
}

function deleteFile() {
  if (!currentFile) return alert("No file selected.");
  fetch('/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: currentFile })
  }).then(res => {
    if (res.status === 204) {
      currentFile = '';
      document.getElementById('previewArea').innerHTML = 'Select a file';
      loadMedia();
    } else {
      alert("Failed to delete file.");
    }
  });
}

function markFile() {
  if (!currentFile) return alert("No file selected.");
  fetch('/mark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: currentFile })
  }).then(res => {
    if (res.status === 204) {
      currentFile = '';
      document.getElementById('previewArea').innerHTML = 'Select a file';
      loadMedia();
    } else {
      alert("Failed to mark file.");
    }
  });
}

window.onload = loadMedia;
