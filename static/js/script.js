let currentFile = "";

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

function loadMedia() {
  fetch('/media-list')
    .then(res => res.json())
    .then(files => {
      const reel = document.getElementById('thumbnailReel');
      reel.innerHTML = '';
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
      resetToolkit();
      document.getElementById('previewArea').innerHTML = 'Select a file';
      currentFile = "";
    })
    .catch(err => console.error("Failed to load media list:", err));
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
  if (!currentFile) return showPopup("⚠️ No file selected.", true);
  fetch('/delete', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ filename: currentFile })
  })
    .then(res => {
      if (res.status === 204) {
        showPopup("🗑️ File moved to bin");
        currentFile = "";
        document.getElementById('previewArea').innerHTML = 'Select a file';
        resetToolkit();
        loadMedia();  // Refresh list after delete
      } else {
        showPopup("❌ Delete failed.", true);
      }
    })
    .catch(() => showPopup("❌ Error deleting file.", true));
}

function markFile() {
  if (!currentFile) return showPopup("⚠️ No file selected.", true);
  fetch('/mark', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ filename: currentFile })
  })
    .then(res => {
      if (res.status === 204) {
        showPopup("✅ File kept");
        currentFile = "";
        document.getElementById('previewArea').innerHTML = 'Select a file';
        resetToolkit();
        loadMedia();  // Refresh list after keep
      } else {
        showPopup("❌ Keep failed.", true);
      }
    })
    .catch(() => showPopup("❌ Error keeping file.", true));
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
        loadMedia();  // Refresh list after undo
      } else {
        res.json().then(data => {
          showPopup(`❌ Undo failed: ${data.error}`, true);
        });
      }
    })
    .catch(() => showPopup("❌ Error performing undo.", true));
}

window.onload = loadMedia;
