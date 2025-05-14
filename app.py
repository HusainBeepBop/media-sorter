from flask import Flask, render_template, jsonify, request
import os
import shutil

app = Flask(__name__)
MEDIA_FOLDER = 'media'
BIN_FOLDER = os.path.expanduser('~/Downloads/bin')
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.mp4', '.mov', '.avi'}

if not os.path.exists(BIN_FOLDER):
    os.makedirs(BIN_FOLDER)

def list_media_files():
    files = []
    for file in sorted(os.listdir(MEDIA_FOLDER)):
        ext = os.path.splitext(file)[1].lower()
        if ext in ALLOWED_EXTENSIONS:
            files.append(file)
    return files

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/media-list')
def media_list():
    return jsonify(list_media_files())

@app.route('/delete', methods=['POST'])
def delete_file():
    filename = request.json.get('filename')
    source_path = os.path.join(MEDIA_FOLDER, filename)
    target_path = os.path.join(BIN_FOLDER, filename)
    if os.path.exists(source_path):
        shutil.move(source_path, target_path)
        return jsonify({'success': True})
    return jsonify({'success': False})

@app.route('/mark', methods=['POST'])
def mark_file():
    filename = request.json.get('filename')
    path = os.path.join(MEDIA_FOLDER, filename)
    if os.path.exists(path):
        os.remove(path)  # You can customize this behavior
        return jsonify({'success': True})
    return jsonify({'success': False})

if __name__ == '__main__':
    app.run(debug=True)
