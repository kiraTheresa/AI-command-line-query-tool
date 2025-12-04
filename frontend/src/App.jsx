import { useState, useEffect } from 'react'

function App() {
  const [question, setQuestion] = useState('')
  const [environment, setEnvironment] = useState('Ubuntu 22.04, bash')
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCopyHint, setShowCopyHint] = useState(false)

  // 获取历史记录
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/history')
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error('获取历史记录失败:', error)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // 查询命令
  const handleQuery = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, environment }),
      })
      const data = await response.json()
      setCommand(data.answer)
      fetchHistory() // 更新历史记录
    } catch (error) {
      console.error('查询命令失败:', error)
      setCommand('错误：获取命令失败，请重试。')
    } finally {
      setIsLoading(false)
    }
  }

  // 复制命令
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setShowCopyHint(true)
        setTimeout(() => setShowCopyHint(false), 3000)
      })
      .catch(err => {
        console.error('复制文本失败:', err)
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* 复制成功提示 */}
      {showCopyHint && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform translate-y-0 opacity-100">
          命令已复制到剪贴板！
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">命令助手</h1>
          <p className="text-gray-400">为您的问题获取命令行解决方案</p>
        </header>

        {/* 输入区域 */}
        <section className="mb-12 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
          <form onSubmit={handleQuery} className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-2">
                您的问题
              </label>
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例如：如何删除所有Docker容器？"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label htmlFor="environment" className="block text-sm font-medium text-gray-300 mb-2">
                环境（默认：Ubuntu 22.04, bash）
              </label>
              <input
                type="text"
                id="environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="例如：Windows 10, PowerShell 或 macOS, zsh"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  处理中...
                </>
              ) : (
                '获取命令'
              )}
            </button>
          </form>
        </section>

        {/* 命令显示区域 */}
        {command && (
          <section className="mb-12 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-blue-400">命令</h2>
              <button
                onClick={() => copyToClipboard(command)}
                className="bg-gray-700 hover:bg-gray-600 text-sm font-medium px-3 py-1 rounded-lg transition-colors duration-200"
              >
                复制
              </button>
            </div>
            <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-gray-300 font-mono text-sm whitespace-pre-wrap">
              {command}
            </pre>
          </section>
        )}

        {/* 历史记录区域 */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">历史记录</h2>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-8">暂无历史记录。提出您的第一个问题吧！</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {history.map((item) => (
                <div key={item.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-200">{item.question}</p>
                      {item.environment && (
                        <p className="text-xs text-gray-400 mt-1">{item.environment}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-start">
                    <pre className="bg-gray-900 rounded-lg p-3 overflow-x-auto text-gray-300 font-mono text-xs whitespace-pre-wrap flex-1 mr-2">
                      {item.answer}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(item.answer)}
                      className="bg-gray-600 hover:bg-gray-500 text-xs font-medium px-2 py-1 rounded-lg transition-colors duration-200 shrink-0"
                    >
                      复制
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default App