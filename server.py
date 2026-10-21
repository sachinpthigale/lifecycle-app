#!/usr/bin/env python3
"""
LifePath Local Development Server
Lightweight, zero-dependency HTTP server to preview and test LifePath on any browser.
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable caching-friendly dev headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    global PORT
    while PORT < 8100:
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                url = f"http://localhost:{PORT}"
                print("=" * 60)
                print(" 🌟 LifePath: The Human Lifecycle Navigator is RUNNING!")
                print("=" * 60)
                print(f" 👉 Access the app locally: {url}")
                print(f" 📱 Mobile Optimized & Desktop Simulator Ready")
                print(" Press Ctrl+C to stop the server.")
                print("=" * 60)
                
                # Optional: try to open the browser automatically
                if "--open" in sys.argv:
                    webbrowser.open(url)

                httpd.serve_forever()
                break
        except OSError:
            PORT += 1

if __name__ == "__main__":
    run_server()
