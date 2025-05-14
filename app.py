from flask import Flask, render_template, send_from_directory, jsonify, request
import os
import shutil

app = Flask(__name__)

# Set custom folders (update these two lines as needed)
media_folder = os.path.expanduser("~/Downloads/test")   
bin_folder = os.path.expanduser("~/Downloads/bin")     


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

if __name__ == '__main__':
    app.run(debug=True)
