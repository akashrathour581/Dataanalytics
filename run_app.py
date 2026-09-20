import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
from urllib.request import urlopen
import webbrowser


def main():
    root = Path(__file__).resolve().parent
    venv = root / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    python = str(venv) if venv.exists() else sys.executable
    npm = shutil.which('npm.cmd' if os.name == 'nt' else 'npm')
    if not npm:
        raise SystemExit('Install Node.js, then run npm ci inside frontend.')
    children = []
    try:
        children.append(subprocess.Popen([python, '-m', 'uvicorn', 'server.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload', '--limit-concurrency', '16'], cwd=root))
        children.append(subprocess.Popen([npm, 'run', 'dev', '--', '--host', '127.0.0.1'], cwd=root / 'frontend', shell=False))
        for _ in range(60):
            if any(p.poll() is not None for p in children): raise RuntimeError('A server stopped. Review its output above.')
            try:
                with urlopen('http://127.0.0.1:8000/api/health', timeout=1) as response:
                    if response.status != 200: continue
                with urlopen('http://127.0.0.1:5173', timeout=1): pass
                break
            except OSError: time.sleep(.5)
        else: raise RuntimeError('Servers did not become ready within 30 seconds.')
        print('DataSphere is ready at http://127.0.0.1:5173. Press Ctrl+C to stop.')
        webbrowser.open('http://127.0.0.1:5173')
        while all(p.poll() is None for p in children): time.sleep(1)
    except KeyboardInterrupt: pass
    finally:
        for child in children:
            if child.poll() is not None: continue
            if os.name == 'nt': subprocess.run(['taskkill', '/F', '/T', '/PID', str(child.pid)], capture_output=True)
            else: child.terminate()
        for child in children:
            try: child.wait(timeout=5)
            except subprocess.TimeoutExpired: child.kill()

if __name__ == '__main__': main()
