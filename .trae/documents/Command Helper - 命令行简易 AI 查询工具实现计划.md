# Command Helper - 命令行简易 AI 查询工具实现计划

## 项目结构

采用前后端分离架构：

```
command-helper/
├── backend/          # Express 后端
│   ├── package.json
│   ├── server.js
│   └── history.json  # 历史记录文件
└── frontend/         # React 前端
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        └── index.jsx
```

## 技术选型

* **前端**：React 18 + Vite + Tailwind CSS

* **后端**：Node.js + Express

* **AI API**：OpenAI API (需配置 API 密钥)

* **UI 库**：Tailwind CSS (简洁、易用)

## 实现步骤

### 1. 初始化项目

#### 1.1 创建前端项目

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 1.2 创建后端项目

```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv openai
```

### 2. 后端实现

#### 2.1 配置文件

* 创建 `.env` 文件，配置 OpenAI API 密钥

* 设置 CORS 允许前端访问

#### 2.2 核心功能

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const HISTORY_FILE = './history.json';

// 初始化历史记录文件
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

app.use(cors());
app.use(express.json());

// API 路由
app.post('/api/query', async (req, res) => {
  // 处理查询请求
});

app.get('/api/history', (req, res) => {
  // 返回历史记录
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

#### 2.3 AI 调用实现

* 使用 OpenAI API 调用

* 严格控制返回格式：仅纯命令行

#### 2.4 历史记录管理

* 读取 history.json 文件

* 追加新记录到文件

### 3. 前端实现

#### 3.1 配置 Tailwind CSS

* 在 `tailwind.config.js` 中配置内容路径

* 在 `src/index.css` 中引入 Tailwind 指令

#### 3.2 主组件设计

```jsx
// App.jsx
import React, { useState, useEffect } from 'react';

function App() {
  const [question, setQuestion] = useState('');
  const [environment, setEnvironment] = useState('');
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);

  // 查询命令
  const handleQuery = async () => {
    // 调用 API 查询命令
  };

  // 获取历史记录
  useEffect(() => {
    // 加载历史记录
  }, []);

  return (
    <div className="container mx-auto p-4">
      {/* 输入区域 */}
      {/* 命令显示区域 */}
      {/* 历史记录区域 */}
    </div>
  );
}
```

#### 3.3 UI 组件

* 输入表单：包含问题输入框和环境输入框

* 命令显示区域：显示 AI 返回的命令，支持复制

* 历史记录区域：可滚动列表，支持复制命令

### 4. 测试和运行

#### 4.1 启动后端

```bash
cd backend
npm start
```

#### 4.2 启动前端

```bash
cd frontend
npm run dev
```

#### 4.3 访问应用

* 打开浏览器访问 `http://localhost:5173`

* 输入问题和环境，测试命令查询功能

* 查看历史记录功能

## 核心功能要点

1. **AI 提示词设计**：确保返回纯命令行格式
2. **错误处理**：处理 API 调用失败等情况
3. **历史记录管理**：确保 JSON 文件正确读写
4. **命令复制功能**：提供便捷的复制按钮
5. **响应式设计**：适配不同屏幕尺寸

## 依赖说明

### 前端依赖

* react

* react-dom

* vite

* tailwindcss

* postcss

* autoprefixer

### 后端依赖

* express

* cors

* dotenv

* openai

## 注意事项

1. 需要自行配置 OpenAI API 密钥
2. 确保 Node.js 版本 >= 16
3. 历史记录文件会自动创建在后端目录
4. 前端默认端口为 5173，后端默认端口为 3001

<br />

## 预期效果

* 简洁美观的 UI 界面

* 快速响应的命令查询功能

* 完整的历史记录管理

* 便捷的命令复制功能

* 本地可直接运行

该计划优先实现核心功能，确保项目能够快速运行并满足基本需求。

<br />

<br />

<br />

补充：

AI使用Deepseek，并且密钥在项目根目录下创建 .env 文件

```
# 项目根目录下创建 .env 文件
API_KEY=your_api_key_here
DATABASE_URL=your_database_url
```

<br />

<br />

