@echo off

:: 启动后端服务
echo 正在启动后端服务...
start "Backend Server" cmd /k "cd backend && npm run dev"

:: 等待2秒
ping 127.0.0.1 -n 3 > nul

:: 启动前端服务
echo 正在启动前端服务...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo 服务启动完成！
echo 前端地址：http://localhost:5173
echo 后端地址：http://localhost:3001
echo 按任意键退出...
pause > nul
