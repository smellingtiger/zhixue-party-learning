"""重启知识服务"""
import subprocess
import time
import socket
import sys
import os

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def stop_server():
    """停止当前运行的知识服务"""
    print("正在停止知识服务...")
    try:
        # 使用taskkill停止所有运行main.py的python进程
        result = subprocess.run(
            ['taskkill', '/F', '/IM', 'python.exe'],
            capture_output=True, text=True
        )
        print(f"已停止进程: {result.stdout}")
        time.sleep(2)
    except Exception as e:
        print(f"停止服务时出错: {e}")

def start_server():
    """启动知识服务"""
    main_py = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'main.py')
    print(f"启动知识服务: {main_py}")
    
    # 使用 subprocess.Popen 在后台启动
    process = subprocess.Popen(
        [sys.executable, main_py],
        cwd=os.path.dirname(main_py),
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    
    print(f"知识服务已启动，PID: {process.pid}")
    
    # 等待服务启动
    for i in range(10):
        time.sleep(1)
        if is_port_in_use(8080):
            print("服务已成功启动！")
            return True
        print(f"等待服务启动... ({i+1}/10)")
    
    print("服务启动超时")
    return False

if __name__ == "__main__":
    if is_port_in_use(8080):
        stop_server()
    
    time.sleep(1)
    start_server()
