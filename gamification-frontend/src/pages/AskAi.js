import React, { useState, useEffect, useRef } from 'react'
import api from './api'
import faqs from '../data/faqs.json'
import '../styles/AskAi.css'

export default function AskAi() {
  const [history, setHistory] = useState([])
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const [fileQuestion, setFileQuestion] = useState('')
  const [chatPrompt, setChatPrompt] = useState('')
  const [uploading, setUploading] = useState(false)
  const [lastFaqIndex, setLastFaqIndex] = useState(null);

  // FAQ state
  const categories = Array.from(new Set(faqs.map(f => f.category)))
  const [selectedCategory, setSelectedCategory] = useState(categories[0])

  const fileInputRef = useRef(null)
  const windowRef = useRef(null)

  // scroll auto
  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.scrollTop = windowRef.current.scrollHeight
    }
  }, [history])

  // fetch files list
  useEffect(() => {
    api.get('/task-files/')
      .then(r => {
        setFiles(r.data)
        if (r.data.length) setSelectedFile(String(r.data[0].id))
      })
      .catch(console.error)
  }, [])

  const handleFaq = (faq, idx) => {
    setLastFaqIndex(idx);
    setHistory(h => [
      ...h,
      { sender: 'user', text: faq.question },
      { sender: 'bot',  text: faq.answer }
    ])
  }

  const handleUpload = async () => {
    const input = fileInputRef.current
    if (!input.files.length) return
    const file = input.files[0]
    const form = new FormData()
    form.append('file', file)
    form.append('task_id', '7')    
    form.append('name', file.name)

    setUploading(true)
    try {
      await api.post('/task-files/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      input.value = ''
      // re-fetch
      const res = await api.get('/task-files/')
      setFiles(res.data)
      setHistory(h => [...h, { sender: 'bot', text: `File "${file.name}" was successfully uploaded!` }])
    } catch {
      setHistory(h => [...h, { sender: 'bot', text: 'Error while uploading file, try again!' }])
    } finally {
      setUploading(false)
    }
  }

  const sendFileQuestion = async () => {
    if (!selectedFile || !fileQuestion.trim()) return
    setHistory(h => [...h, { sender: 'user', text: `File: #${selectedFile}: ${fileQuestion}` }])
    try {
      const res = await api.post('/ask-file/', {
        file_id: parseInt(selectedFile,10),
        question: fileQuestion
      })
      setHistory(h => [...h, { sender: 'bot', text: res.data.answer.trim() }])
    } catch {
      setHistory(h => [...h, { sender: 'bot', text: 'Server error!' }])
    }
    setFileQuestion('')
  }

  const sendChat = async () => {
    if (!chatPrompt.trim()) return
    setHistory(h => [...h, { sender: 'user', text: chatPrompt }])
    try {
      const res = await api.post('/chat/', { prompt: chatPrompt })
      setHistory(h => [...h, { sender: 'bot', text: res.data.answer.trim() }])
    } catch {
      setHistory(h => [...h, { sender: 'bot', text: 'Server error!' }])
    }
    setChatPrompt('')
  }

  return (
    <div className="cb-page">
      <header className="cb-header">
        <h1>Employee AI Assistant</h1>
      </header>

      {/* FAQ Category Selector */}
      <div className="cb-faq-category">
        <label htmlFor="faq-cat">FAQ Category:</label>
        <select
          id="faq-cat"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* FAQ Buttons */}
      <div className="cb-faqs">
        {faqs
          .filter(f => f.category === selectedCategory)
          .map((faq, idx) => (
          <button
            key={idx}
            className={`cb-faq-btn${lastFaqIndex === idx ? ' active' : ''}`}
            onClick={() => handleFaq(faq, idx)}
          >
            {faq.question}
          </button>
        ))}
      </div>

      <section className="cb-panel">
        {/* Upload File */}
        <div className="cb-section">
          <h2>Upload File</h2>
          <div className="cb-inputs">
            <input type="file" ref={fileInputRef} className="cb-input" />
            <button onClick={handleUpload} disabled={uploading} className="cb-btn">
              {uploading ? 'Loading…' : 'Upload'}
            </button>
          </div>
        </div>

        {/* Q&A pe fișiere */}
        <div className="cb-section">
          <h2>Files Q&A</h2>
          <div className="cb-inputs">
            <select
              value={selectedFile}
              onChange={e => setSelectedFile(e.target.value)}
              className="cb-input"
            >
              {files.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name || f.file.split('/').pop()}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Ask about file..."
              value={fileQuestion}
              onChange={e => setFileQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendFileQuestion()}
              className="cb-input"
            />
            <button onClick={sendFileQuestion} className="cb-btn">
              Send
            </button>
          </div>
        </div>

        {/* Chat liber */}
        <div className="cb-section">
          <h2>Ask Anything</h2>
          <div className="cb-inputs">
            <input
              type="text"
              placeholder="Type something..."
              value={chatPrompt}
              onChange={e => setChatPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              className="cb-input"
            />
            <button onClick={sendChat} className="cb-btn">
              Send
            </button>
          </div>
        </div>
      </section>

      {/* Chat Window */}
      <div className="cb-window" ref={windowRef}>
        {history.length === 0 ? (
          <div className="cb-placeholder">
            Start chatting with our Ai Assistant!
          </div>
        ) : (
          history.map((m,i) => (
            <div key={i} className={`cb-message ${m.sender}`}>
              <div className="cb-text">{m.text}</div>
            </div>
        )))}
      </div>
    </div>
  )
}
