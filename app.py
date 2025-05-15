from flask import Flask, render_template, send_from_directory, jsonify, request
import os
import shutil
from PIL import Image
import datetime

app = Flask(__name__)

# Set custom folders (update these two lines as needed)
media_folder = os.path.expanduser("~/Downloads/test")   
bin_folder = os.path.expanduser("~/Downloads/bin")     

app.config['MEDIA_FOLDER'] = media_folder

os.makedirs(bin_folder, exist_ok=True)

# Allowed file extensions
allowed_extensions = {
    "jpg", "jpeg", "png", "gif", "bmp", "webp", "svg",
    "mp4", "mov", "avi", "mkv", "flv", "webm"
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/media-list')
def media_list():
    files = []
    for file in os.listdir(media_folder):
        if file.split('.')[-1].lower() in allowed_extensions:
            files.append(file)
    return jsonify(files)

@app.route('/media/<path:filename>')
def media_file(filename):
    return send_from_directory(media_folder, filename)

@app.route('/delete', methods=['POST'])
def delete_file():
    data = request.get_json()
    filename = data['filename']
    src = os.path.join(media_folder, filename)
    dst = os.path.join(bin_folder, filename)
    if os.path.exists(src):
        shutil.move(src, dst)
    return '', 204

@app.route('/mark', methods=['POST'])
def mark_file():
    data = request.get_json()
    filename = data['filename']
    filepath = os.path.join(media_folder, filename)
    marked_file = os.path.join(media_folder, f"__KEEP__{filename}")
    if os.path.exists(filepath):
        os.rename(filepath, marked_file)
    return '', 204

@app.route('/metadata/<filename>')
def get_metadata(filename):
    filepath = os.path.join(app.config['MEDIA_FOLDER'], filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404

    # File size in KB
    size_kb = os.path.getsize(filepath) // 1024

    # Date modified
    mod_time = datetime.datetime.fromtimestamp(os.path.getmtime(filepath)).strftime('%Y-%m-%d %H:%M:%S')

    # File type and dimensions
    ext = os.path.splitext(filename)[1].lower()
    file_type = 'Image' if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'] else 'Video'

    dimensions = 'N/A'
    if file_type == 'Image':
        try:
            with Image.open(filepath) as img:
                dimensions = f"{img.width} x {img.height}"
        except:
            pass

    return jsonify({
        'filename': filename,
        'size': f"{size_kb} KB",
        'date': mod_time,
        'type': file_type,
        'dimensions': dimensions
    })

if __name__ == '__main__':
    app.run(debug=True)
