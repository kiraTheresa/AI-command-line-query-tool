const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const HISTORY_FILE = path.join(__dirname, 'history.json');
const API_KEY = process.env.API_KEY;

// 初始化历史记录文件
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

// 中间件
app.use(cors());
app.use(express.json());

// 读取历史记录
const readHistory = () => {
  const data = fs.readFileSync(HISTORY_FILE, 'utf8');
  return JSON.parse(data);
};

// 写入历史记录
const writeHistory = (history) => {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
};

// 生成唯一 ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 调用 Deepseek API
const callDeepseekApi = async (prompt) => {
  const url = 'https://api.deepseek.com/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a command line helper. Please provide only the command line as the answer, no explanations, no comments, no markdown code blocks. If multiple commands are needed, separate them with newlines. If the question is not clear, you can provide multiple commands with brief comments.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });
  
  if (!response.ok) {
    throw new Error(`Deepseek API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content.trim();
};

// API 路由

// 查询命令
app.post('/api/query', async (req, res) => {
  const { question, environment } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }
  
  try {
    // 构建提示词
    let prompt = question;
    if (environment) {
      prompt += `\nEnvironment: ${environment}`;
    }
    
    // 调用 AI API
    const answer = await callDeepseekApi(prompt);
    
    // 保存到历史记录
    const history = readHistory();
    const newRecord = {
      id: generateId(),
      question,
      environment: environment || '',
      answer,
      timestamp: new Date().toISOString()
    };
    history.push(newRecord);
    writeHistory(history);
    
    // 返回结果
    res.json(newRecord);
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Failed to get command. Please try again.' });
  }
});

// 获取历史记录
app.get('/api/history', (req, res) => {
  try {
    const history = readHistory();
    res.json(history);
  } catch (error) {
    console.error('Error reading history:', error);
    res.status(500).json({ error: 'Failed to get history.' });
  }
});

// 追加历史记录（可选）
app.post('/api/history', (req, res) => {
  const { question, environment, answer } = req.body;
  
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }
  
  try {
    const history = readHistory();
    const newRecord = {
      id: generateId(),
      question,
      environment: environment || '',
      answer,
      timestamp: new Date().toISOString()
    };
    history.push(newRecord);
    writeHistory(history);
    
    res.json(newRecord);
  } catch (error) {
    console.error('Error writing history:', error);
    res.status(500).json({ error: 'Failed to save history.' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
