#!/usr/bin/env python3
"""
Test script for the AI transcription endpoint
"""
import requests
import sys

def test_transcribe_endpoint():
    """Test the /api/transcribe endpoint"""
    
    # API endpoint
    url = "http://localhost:8000/api/transcribe"
    
    # Check if audio file is provided
    if len(sys.argv) < 2:
        print("Usage: python test_transcribe.py <path_to_audio_file>")
        print("Example: python test_transcribe.py test_audio.mp3")
        sys.exit(1)
    
    audio_file_path = sys.argv[1]
    
    try:
        # Open audio file
        with open(audio_file_path, 'rb') as audio_file:
            files = {'audio': audio_file}
            
            print(f"📤 Uploading audio file: {audio_file_path}")
            print("⏳ Transcribing... (this may take a moment)")
            
            # Send POST request
            response = requests.post(url, files=files)
            
            if response.status_code == 200:
                data = response.json()
                
                print("\n✅ Transcription Successful!")
                print(f"🎵 Duration: {data.get('duration', 0):.2f} seconds")
                print(f"🌍 Language: {data.get('language', 'unknown')}")
                print(f"📝 Text: {data.get('text', '')}")
                print(f"\n📊 Word Count: {len(data.get('lyrics', []))}")
                print("\n📜 Lyrics with Timestamps:")
                print("-" * 60)
                
                for i, lyric in enumerate(data.get('lyrics', []), 1):
                    start_sec = lyric['start'] / 1000
                    end_sec = lyric['end'] / 1000
                    print(f"{i:3d}. [{start_sec:6.2f}s - {end_sec:6.2f}s] {lyric['text']}")
                
                print("-" * 60)
                
            else:
                error_data = response.json()
                print(f"\n❌ Error: {error_data.get('error', 'Unknown error')}")
                print(f"Status Code: {response.status_code}")
                
    except FileNotFoundError:
        print(f"❌ Error: Audio file not found: {audio_file_path}")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to API. Make sure Flask server is running.")
        print("   Run: cd api && python index.py")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    test_transcribe_endpoint()
