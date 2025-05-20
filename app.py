from flask import Flask, render_template, send_from_directory, jsonify, request, session
import os
import shutil
from PIL import Image
import datetime

app = Flask(__name__)
app.secret_key = 'your_super_secret_key_here'  # Replace with a secure random key for production

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
    try:
        offset = int(request.args.get('offset', 0))
        limit = int(request.args.get('limit', 100))
    except ValueError:
        return jsonify({'error': 'Invalid offset or limit'}), 400

    files = []
    for file in os.listdir(media_folder):
        if file.split('.')[-1].lower() in allowed_extensions:
            files.append(file)
    files.sort()  

    paginated_files = files[offset:offset+limit]
    return jsonify({
        'files': paginated_files,
        'total': len(files)
    })

@app.route('/media/<path:filename>')
def media_file(filename):
    return send_from_directory(media_folder, filename)

@app.route('/delete', methods=['POST'])
def delete_file():
    data = request.get_json()
    filename = data.get('filename')
    if not filename:
        return jsonify({'error': 'Filename required'}), 400

    src = os.path.join(media_folder, filename)
    dst = os.path.join(bin_folder, filename)

    if os.path.exists(src):
        shutil.move(src, dst)
        
        session['last_action'] = {
            'type': 'delete',
            'filename': filename
        }
        session.modified = True
        return '', 204
    else:
        return jsonify({'error': 'File not found'}), 404

@app.route('/mark', methods=['POST'])
def mark_file():
    data = request.get_json()
    filename = data.get('filename')
    if not filename:
        return jsonify({'error': 'Filename required'}), 400

    filepath = os.path.join(media_folder, filename)
    marked_file = os.path.join(media_folder, f"__KEEP__{filename}")

    if os.path.exists(filepath):
        os.rename(filepath, marked_file)
        
        session['last_action'] = {
            'type': 'mark',
            'filename': filename
        }
        session.modified = True
        return '', 204
    else:
        return jsonify({'error': 'File not found'}), 404

@app.route('/undo', methods=['POST'])
def undo_last_action():
    last_action = session.get('last_action')
    if not last_action:
        return jsonify({'error': 'No action to undo'}), 400

    action_type = last_action.get('type')
    filename = last_action.get('filename')

    if action_type == 'delete':
        src = os.path.join(bin_folder, filename)
        dst = os.path.join(media_folder, filename)
        if os.path.exists(src):
            shutil.move(src, dst)
            session.pop('last_action', None)
            return '', 204
        else:
            return jsonify({'error': 'File to restore not found in bin'}), 404

    elif action_type == 'mark':
        marked_file = os.path.join(media_folder, f"__KEEP__{filename}")
        original_file = os.path.join(media_folder, filename)
        if os.path.exists(marked_file):
            os.rename(marked_file, original_file)
            session.pop('last_action', None)
            return '', 204
        else:
            return jsonify({'error': 'Marked file not found'}), 404

    else:
        return jsonify({'error': 'Unknown last action type'}), 400

@app.route('/metadata/<filename>')
def get_metadata(filename):
    filepath = os.path.join(app.config['MEDIA_FOLDER'], filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404

    size_kb = os.path.getsize(filepath) // 1024

    mod_time = datetime.datetime.fromtimestamp(os.path.getmtime(filepath)).strftime('%Y-%m-%d %H:%M:%S')

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
