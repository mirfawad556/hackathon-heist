import urllib.request
import mimetypes
import os

url = "http://localhost:8000/api/enhance"
file_path = r"c:\Users\hp\OneDrive\Desktop\hackathon heist\frontend\public\realistic_moon.png"

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = bytearray()
body.extend(f"--{boundary}\r\n".encode("utf-8"))
body.extend(b'Content-Disposition: form-data; name="file"; filename="realistic_moon.png"\r\n')
body.extend(b'Content-Type: image/png\r\n\r\n')
with open(file_path, "rb") as f:
    body.extend(f.read())
body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

req = urllib.request.Request(url, data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
try:
    with urllib.request.urlopen(req) as response:
        print(response.status)
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode())
