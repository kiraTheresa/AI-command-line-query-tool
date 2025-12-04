# Command Helper 优化计划

## 优化内容

### 1. 创建Windows一键启动脚本

- 在项目根目录创建 `start.bat` 文件
- 脚本功能：同时启动前端和后端服务
- 实现方式：使用 `start` 命令在不同窗口启动服务

### 2. 前端文字改为中文

- 修改 `frontend/src/App.jsx` 中的所有英文文本
- 包括：
  - 页面标题和描述
  - 输入框标签和占位符
  - 按钮文字
  - 提示信息
  - 历史记录标题

### 3. 优化复制提示

- 替换原来的 `alert()` 提示
- 实现一个美观的浮动提示框
- 功能特点：
  - 自动消失（3秒后）
  - 平滑的显示/隐藏动画
  - 响应式设计
  - 符合整体UI风格

## 实现步骤

### 1. 创建启动脚本

```bash
# start.bat 内容
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
```

### 2. 修改前端文字为中文

在 `App.jsx` 中修改以下内容：

- 页面标题："Command Helper" → "命令助手"
- 描述文字："Get command line solutions for your questions" → "为您的问题获取命令行解决方案"
- 问题输入框："Your Question" → "您的问题"
- 环境输入框："Environment (Optional)" → "环境（可选）"
- 按钮文字："Get Command" → "获取命令"
- 命令标题："Command" → "命令"
- 历史记录标题："History" → "历史记录"
- 空历史提示："No history yet. Ask your first question!" → "暂无历史记录。提出您的第一个问题吧！"

### 3. 实现美观的复制提示

1. 在 `App.jsx` 中添加复制提示的状态管理
2. 实现提示框组件
3. 替换原来的 `alert()` 调用

```jsx
// 添加状态
const [showCopyHint, setShowCopyHint] = useState(false)

// 复制函数
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      setShowCopyHint(true)
      setTimeout(() => setShowCopyHint(false), 3000)
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}

// 提示框组件
{showCopyHint && (
  <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 animate-fadeInOut">
    命令已复制到剪贴板！
  </div>
)}
```

## 预期效果

1. **一键启动**：双击 `start.bat` 即可同时启动前后端服务
2. **全中文界面**：所有用户可见的文字都显示为中文
3. **美观的复制提示**：复制命令时显示平滑的浮动提示，3秒后自动消失

## 依赖说明

无需新增依赖，使用现有技术栈即可实现所有优化。