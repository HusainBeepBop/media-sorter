let currentFile = "";

function showPopup(message, isError = false) {
  const popup = document.getElementById("popup");
  popup.textContent = message;
  popup.style.backgroundColor = isError ? "#b00020" : "#1f1f1f"; 
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2000);
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

  updateToolkitInfo({
    filename: file,
    size: 'Loading...',
    date: 'Loading...',
    type: type === 'VIDEO' ? 'Video' : 'Image',
    dimensions: 'Loading...'
  });

  scrollToSelectedThumbnail(file);
}

function scrollToSelectedThumbnail(file) {
  const allThumbs = document.getElementById('thumbnailReel').children;
  for (let thumb of allThumbs) {
    if (thumb.dataset.filename === file) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'center' });
      break;
    }
  }
}

function deleteFile() {
  if (!currentFile) return showPopup("⚠️ No file selected.", true);
  fetch('/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: currentFile })
  })
    .then(res => {
      if (res.status === 204) {
        showPopup("🗑️ File moved to bin");
        currentFile = '';
        document.getElementById('previewArea').innerHTML = 'Select a file';
        updateToolkitInfo({});  // clear
        loadMedia();
      } else {
        showPopup("❌ Failed to delete file.", true);
      }
    })
    .catch(() => showPopup("❌ Error deleting file.", true));
}

function markFile() {
  if (!currentFile) return showPopup("⚠️ No file selected.", true);
  fetch('/mark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: currentFile })
  })
    .then(res => {
      if (res.status === 204) {
        showPopup("✅ File kept");
        currentFile = '';
        document.getElementById('previewArea').innerHTML = 'Select a file';
        updateToolkitInfo({});
        loadMedia();
      } else {
        showPopup("❌ Failed to keep file.", true);
      }
    })
    .catch(() => showPopup("❌ Error keeping file.", true));
}

function updateToolkitInfo(filename, size, date, type, dimensions) {
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('toolkit-filename', filename);
    setText('toolkit-size', size);
    setText('toolkit-date', date);
    setText('toolkit-type', type);
    setText('toolkit-dimensions', dimensions);
}



window.onload = loadMedia;
