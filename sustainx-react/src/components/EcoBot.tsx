import { useState, type FormEvent } from 'react'
import { api } from '../api'

type Message = { from: 'you' | 'bot'; text: string; sources?: { source: string; chunk: number }[] }

export default function EcoBot() {
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: "Hi! I'm EcoBot. Ask me a question about the environmental information in my source documents." },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async (event: FormEvent) => {
    event.preventDefault()
    const message = input.trim()
    if (!message || busy) return
    setInput('')
    setMessages(current => [...current, { from: 'you', text: message }])
    setBusy(true)
    try {
      const result = await api.chat(message)
      setMessages(current => [...current, { from: 'bot', text: result.answer, sources: result.sources }])
    } catch {
      setMessages(current => [...current, { from: 'bot', text: 'EcoBot is unavailable. Please check that the backend and its Ollama model are running, then try again.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="box ecobot">
      <h2>🌿 EcoBot</h2>
      <p>Answers are grounded in the environmental source documents and include retrieved references.</p>
      <div className="ecobot-messages" aria-live="polite">
        {messages.map((message, index) => <div key={index} className={`ecobot-message ${message.from}`}>
          {message.text}
          {message.sources?.length ? <div className="ecobot-sources">Sources: {message.sources.map(source => `${source.source}, chunk ${source.chunk}`).join('; ')}</div> : null}
        </div>)}
        {busy && <div className="ecobot-message bot">EcoBot is thinking…</div>}
      </div>
      <form className="ecobot-form" onSubmit={send}>
        <input value={input} onChange={event => setInput(event.target.value)} maxLength={300} placeholder="Ask EcoBot…" aria-label="Message EcoBot" />
        <button type="submit" disabled={busy || !input.trim()}>Send</button>
      </form>
    </div>
  )
}
