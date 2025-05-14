# Media Sorter

A fast and minimal offline tool to help you **declutter** and **sort** your personal photos and videos — all within your browser using Python + HTML/CSS/JS.

No data leaves your device. Perfect for local cleanup!

---

## 🚀 Features

- 🔍 Scrollable thumbnail reel of media files
- 🖼️ Preview image and video files (play/pause supported)
- ✅ "Keep" button marks important files
- 🗑️ "Delete" button moves files to a custom bin folder
- 🧠 Smart scroll-to-center when a file is selected
- 🧱 Fixed layout, responsive design
- 🔐 Local-only — nothing gets uploaded

---

## 📦 Supported Formats

Images: `jpg`, `jpeg`, `png`, `gif`, `bmp`, `webp`, `svg`  
Videos: `mp4`, `mov`, `avi`, `mkv`, `flv`, `webm`

---

## 🛠️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/media-sorter.git
cd media-sorter
```
### 2. Install Python dependencies
Just Python 3 is enough — no external libraries needed!

### 3. Edit paths
Open app.py and set your media_folder and bin_folder to point to local paths like:

```python
media_folder = "D:/MyMedia/ToSort"
bin_folder = "D:/MyMedia/Deleted"
```

### 4. Run the app
```bash
python app.py
```
Then open http://127.0.0.1:5000 in your browser.

### 5. Planned Features:

- Keyboard Shortcuts (coming soon)
    - D = Delete file
    - K = Keep file
    - Up/Down Arrow Keys = Scrolling through the File
- Undo button
    - Undo your last action (Keep/Delete)
- Choose Media Folder via UI
- Filter/Sorting:
    - Decending (Size)
    - Decending (Date)(Newer First)
    - File Type (Photo/Video)
- File Information Tooltip 
    - On Hover Shows:
        - Name of the file
        - Size of the file
        - Date of the file
        - Type of the file
        - Dimensions

# 📂 Folder Structure
```bash
    media-sorter/
    ├── app.py
    ├── templates/
    │   └── index.html
    ├── static/
    │   ├── css/
    │   │   └── style.css
    │   └── js/
    │       └── script.js
    ├── bin/
```
# 👨‍💻 Author
Made by Husain and AI – feel free to ⭐ star or fork the repo!

📃 License
This project is licensed under the MIT License.