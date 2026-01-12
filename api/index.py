from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import tempfile
import os

app = Flask(__name__)
CORS(app)

def extract_pinterest_media(url):
    """Extract media URLs from Pinterest using pinterest-dl command"""
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Run pinterest-dl to extract media URLs without downloading
            result = subprocess.run([
                'pinterest-dl', 
                '--json',  # Get output as JSON
                '--no-download',  # Don't download, just extract URLs
                url
            ], capture_output=True, text=True, cwd=temp_dir)
            
            if result.returncode != 0:
                raise Exception(f"pinterest-dl failed: {result.stderr}")
            
            # Parse the JSON output
            output_lines = result.stdout.strip().split('\n')
            media_urls = []
            
            for line in output_lines:
                if line.strip():
                    try:
                        data = json.loads(line)
                        if 'url' in data:
                            media_urls.append(data['url'])
                    except json.JSONDecodeError:
                        continue
            
            return media_urls
            
    except Exception as e:
        raise Exception(f"Failed to extract media: {str(e)}")

@app.route('/api/pinterest', methods=['POST'])
def handle_pinterest_download():
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'No URL provided'}), 400
            
        # Validate URL format
        if 'pinterest.com' not in url:
            return jsonify({'error': 'Invalid Pinterest URL'}), 400
        
        # Extract media URLs
        media_urls = extract_pinterest_media(url)
        
        return jsonify({
            'success': True,
            'links': media_urls
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(port=8000, debug=True)