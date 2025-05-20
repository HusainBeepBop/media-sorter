let currentFile = "";

let offset = 0;
const limit = 25;
let allLoaded = false;
let loading = false;

// === Utility Functions ===

function showPopup(message, isError = false) {
  const popup = document.getElementById("popup");
  popup.textContent = message;
  popup.style.backgroundColor = isError ? "#b00020" : "#1f1f1f";
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2000);
}

function updateToolkitInfo(filename, size, date, type, dimensions) {
  document.getElementById('toolkit-filename').textContent = filename;
  document.getElementById('toolkit-size').textContent = size;
  document.getElementById('toolkit-date').textContent = date;
  document.getElementById('toolkit-type').textContent = type;
  document.getElementById('toolkit-dimensions').textContent = dimensions;
}

function resetToolkit() {
  updateToolkitInfo('—', '—', '—', '—', '—');
}

// === Loading and Display ===

function loadMedia(initial = false) {
  if (loading || allLoaded) return;
  loading = true;
  fetch(`/media-list?offset=${offset}&limit=${limit}`)
    .then(res => res.json())
    .then(data => {
      const files = data.files;
      const reel = document.getElementById('thumbnailReel');
      if (initial) {
        reel.innerHTML = '';
        offset = 0;
        allLoaded = false;
      }
      files.forEach(file => {
        const ext = file.split('.').pop().toLowerCase();
        let el;
        if (['mp4','mov','avi','mkv','flv','webm'].includes(ext)) {
          el = document.createElement('video');
          el.src = `/media/${file}`;
          el.muted = true;
          el.loop = true;
          el.play();
        } else {
          el = document.createElement('img');
          el.src = `/media/${file}`;
        }
        el.dataset.filename = file;
        el.onclick = () => showPreview(file, el.tagName);
        reel.appendChild(el);
      });
      offset += files.length;
      if (offset >= data.total) {
        allLoaded = true;
      }
      if (initial) {
        resetToolkit();
        document.getElementById('previewArea').innerHTML = 'Select a file';
        currentFile = "";
      }
      loading = false;
    })
    .catch(err => {
      console.error("Failed to load media list:", err);
      loading = false;
    });
}

// === Preview & Metadata ===

function showPreview(file, tag) {
  currentFile = file;

  const preview = document.getElementById('previewArea');
  preview.innerHTML = '';
  if (tag === 'VIDEO') {
    const v = document.createElement('video');
    v.src = `/media/${file}`;
    v.controls = true;
    v.autoplay = true;
    preview.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = `/media/${file}`;
    preview.appendChild(img);
  }

  updateToolkitInfo(file, 'Loading...', 'Loading...', tag === 'VIDEO' ? 'Video' : 'Image', 'Loading...');

  fetch(`/metadata/${file}`)
    .then(res => res.json())
    .then(info => {
      updateToolkitInfo(
        info.filename,
        info.size,
        info.date,
        info.type,
        info.dimensions
      );
    })
    .catch(() => {
      showPopup("⚠️ Could not load metadata", true);
    });

  scrollToSelectedThumbnail(file);
}

function scrollToSelectedThumbnail(filename) {
  const thumbs = document.getElementById('thumbnailReel').children;
  for (let thumb of thumbs) {
    if (thumb.dataset.filename === filename) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'center' });
      break;
    }
  }
}

// === Actions: Delete / Keep / Undo ===

function deleteFile() {
  if (!currentFile) return;
  document.getElementById('previewArea').innerHTML = '';
  fetch('/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ filename: currentFile })
  })
  .then(res => {
    if (res.ok) {
      showPopup("🗑️ File sent to bin");
      currentFile = "";
      resetToolkit();
      offset = 0;
      allLoaded = false;
      loadMedia(true);
    } else {
      showPopup("❌ Failed to delete file", true);
    }
  })
  .catch(() => showPopup("❌ Error deleting file", true));
}

function markFile() {
  if (!currentFile) return;
  document.getElementById('previewArea').innerHTML = '';
  fetch('/mark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ filename: currentFile })
  })
  .then(res => {
    if (res.ok) {
      showPopup("✔️ File marked keep");
      currentFile = "";
      resetToolkit();
      offset = 0;
      allLoaded = false;
      loadMedia(true);
    } else {
      showPopup("❌ Failed to mark file", true);
    }
  })
  .catch(() => showPopup("❌ Error marking file", true));
}

function undoLastAction() {
  fetch('/undo', {
    method: 'POST'
  })
    .then(res => {
      if (res.status === 204) {
        showPopup("↩️ Undo successful");
        currentFile = "";
        document.getElementById('previewArea').innerHTML = 'Select a file';
        resetToolkit();
        offset = 0;
        allLoaded = false;
        loadMedia(true);
      } else {
        res.json().then(data => {
          showPopup(`❌ Undo failed: ${data.error}`, true);
        });
      }
    })
    .catch(() => showPopup("❌ Error performing undo.", true));
}

document.addEventListener('DOMContentLoaded', () => {
  loadMedia(true);
  const reel = document.getElementById('thumbnailReel');
  reel.addEventListener('scroll', function() {
    if (reel.scrollTop + reel.clientHeight >= reel.scrollHeight - 50) {
      loadMedia();
    }
  });
});