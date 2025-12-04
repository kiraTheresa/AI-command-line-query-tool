const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const HISTORY_FILE = path.join(__dirname, 'history.json');
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');
const API_KEY = process.env.API_KEY;

// 初始化历史记录文件
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

// 初始化排行榜文件
if (!fs.existsSync(LEADERBOARD_FILE)) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify([]));
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

// 读取排行榜
const readLeaderboard = () => {
  const data = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
  return JSON.parse(data);
};

// 写入排行榜
const writeLeaderboard = (leaderboard) => {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));
};

// 生成唯一 ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 更新排行榜
const updateLeaderboard = (command) => {
  if (!command || command.trim() === '') return;
  
  const leaderboard = readLeaderboard();
  const existingIndex = leaderboard.findIndex(item => item.command === command);
  
  if (existingIndex >= 0) {
    // 命令已存在，增加使用次数
    leaderboard[existingIndex].usage_count += 1;
  } else {
    // 新命令，添加到排行榜
    leaderboard.push({
      command,
      usage_count: 1
    });
  }
  
  // 按使用次数降序排序
  leaderboard.sort((a, b) => b.usage_count - a.usage_count);
  
  writeLeaderboard(leaderboard);
  return leaderboard;
};

// 调用 Deepseek API
const callDeepseekApi = async (prompt, mode = 'query') => {
  const url = 'https://api.deepseek.com/v1/chat/completions';
  
  // 根据模式调整系统提示词
  let systemPrompt = '';
  if (mode === 'certain') {
    // 确定模式：直接返回命令，简洁明确
    systemPrompt = `You are a command line helper. Please provide only the command line as the answer, no explanations, no comments, no markdown code blocks. If multiple commands are needed, separate them with newlines.`;
  } else {
    // 查询模式：提供更详细的解释和多种选项
    systemPrompt = `You are a command line helper. Please provide only the command line as the answer, no explanations, no comments, no markdown code blocks. If multiple commands are needed, separate them with newlines. If the question is not clear, you can provide multiple commands with brief comments.`;
  }
  
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
          content: systemPrompt
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
  const { question, environment, mode = 'query' } = req.body;
  
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
    const answer = await callDeepseekApi(prompt, mode);
    
    // 更新排行榜
    updateLeaderboard(answer);
    
    // 保存到历史记录
    const history = readHistory();
    const newRecord = {
      id: generateId(),
      question,
      environment: environment || '',
      answer,
      mode,
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
  const { question, environment, answer, mode = 'query' } = req.body;
  
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }
  
  try {
    // 更新排行榜
    updateLeaderboard(answer);
    
    const history = readHistory();
    const newRecord = {
      id: generateId(),
      question,
      environment: environment || '',
      answer,
      mode,
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

// 获取排行榜
app.get('/api/leaderboard', (req, res) => {
  try {
    const leaderboard = readLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Error reading leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard.' });
  }
});

// 增加命令使用次数
app.post('/api/leaderboard/increment', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }
  
  try {
    const leaderboard = updateLeaderboard(command);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    res.status(500).json({ error: 'Failed to update leaderboard.' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
