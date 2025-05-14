let currentFile = "";

function loadMedia() {
  fetch('/media-list')
    .then(res => res.json())
    .then(files => {
      const reel = document.getElementById('thumbnailReel');
      reel.innerHTML = '';
      files.forEach(file => {
        const ext = file.split('.').pop().toLowerCase();
        let el;
        if (['mp4', 'mov', 'avi'].includes(ext)) {
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

  // Scroll to selected
  const allThumbs = document.getElementById('thumbnailReel').children;
  for (let thumb of allThumbs) {
    if (thumb.src.includes(file)) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'center' });
      break;
    }
  }
}

function deleteFile() {
  if (!currentFile) return;
  fetch('/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: currentFile })
  }).then(() => {
    currentFile = '';
    document.getElementById('previewArea').innerHTML = 'Select a file';
    loadMedia();
  });
}

function markFile() {
  if (!currentFile) return;
  fetch('/mark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: currentFile })
  }).then(() => {
    currentFile = '';
    document.getElementById('previewArea').innerHTML = 'Select a file';
    loadMedia();
  });
}

window.onload = loadMedia;