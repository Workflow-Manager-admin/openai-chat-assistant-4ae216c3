import React, { useState, useRef, useEffect } from 'react';
import './App.css';

/**
 * Chatbot App using OpenAI API
 * - Modern, minimalistic, light-theme UI
 * - Reads OpenAI API key from process.env.REACT_APP_OPENAI_API_KEY (set this in your .env file)
 */

// Accent colors from requirements
const ACCENT = '#34A853';
const PRIMARY = '#1A73E8';
const SECONDARY = '#F1F3F4';

// PUBLIC_INTERFACE
function App() {
  // State for chat history, input, loading, and error
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatBottomRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // PUBLIC_INTERFACE
  // Handles sending a message and making API call
  async function handleSend(e) {
    e.preventDefault();
    setError('');
    const userMsg = input.trim();
    if (!userMsg) {
      setError('Please enter a message.');
      return;
    }

    setMessages((old) => [...old, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error(
          'OpenAI API key not set. Please add REACT_APP_OPENAI_API_KEY=your-key in your .env file at the project root and restart the server.'
        );
      }

      // Call OpenAI API (chat/completions)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: 'user', content: userMsg }
          ],
          temperature: 0.7
        })
      });
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`API error: ${response.status} ${msg}`);
      }
      const data = await response.json();
      const botContent =
        data.choices?.[0]?.message?.content ??
        'Sorry, there was an unexpected issue with the response.';

      setMessages((old) => [...old, { role: 'assistant', content: botContent }]);
    } catch (err) {
      setMessages((old) => [
        ...old,
        {
          role: 'assistant',
          content:
            err.message ||
            'There was a problem connecting to the chatbot API.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Input change handler
  function handleInputChange(e) {
    if (error) setError('');
    setInput(e.target.value);
  }

  // Allow pressing Enter to send, Shift+Enter for newline
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSend(e);
    }
  }

  // UI: Chat bubble
  function ChatBubble({ role, content }) {
    const isUser = role === 'user';
    return (
      <div
        className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
        style={{
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          background: isUser
            ? PRIMARY
            : ACCENT,
          color: '#fff'
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className="chat-root"
      style={{
        background: SECONDARY,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <header className="chat-header" style={{
        background: '#fff',
        borderBottom: `1px solid ${SECONDARY}`,
        padding: '1.25rem 0.7rem',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '1.25rem',
        color: PRIMARY,
        letterSpacing: 0.1,
        boxShadow: '0 1px 0 0 #ececec'
      }}>
        OpenAI Chatbot
      </header>

      {/* Main chat area */}
      <main
        className="chat-main"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem 0.4rem 1rem 0.4rem',
          maxWidth: 600,
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        aria-label="Chat conversation"
      >
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} role={msg.role} content={msg.content} />
        ))}
        {/* Loading indicator (minimal, modern) */}
        {loading && (
          <div className="chat-bubble chat-bubble-assistant" style={{
            alignSelf: 'flex-start',
            background: ACCENT,
            color: '#fff',
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Loader />
            <span style={{ marginLeft: 8, fontStyle: 'italic', fontSize: 14 }}>
              Thinking...
            </span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </main>

      {/* Input section */}
      <form
        className="chat-input-row"
        onSubmit={handleSend}
        style={{
          background: '#fff',
          borderTop: `1px solid ${SECONDARY}`,
          padding: '0.85rem 0.7rem',
          width: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          maxWidth: 600,
          margin: '0 auto'
        }}
      >
        <textarea
          className="chat-input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message…"
          rows={1}
          disabled={loading}
          style={{
            flex: 1,
            resize: 'none',
            border: `1px solid ${SECONDARY}`,
            borderRadius: 9,
            padding: '0.7em 1em',
            outline: 'none',
            fontSize: 16,
            background: SECONDARY,
            color: '#1a1a1a',
            marginRight: 10,
            minHeight: 40,
            boxSizing: 'border-box'
          }}
          aria-label="Message input"
        />
        <button
          type="submit"
          className="chat-send-btn"
          style={{
            background: input.trim() && !loading ? PRIMARY : SECONDARY,
            color: input.trim() && !loading ? '#fff' : '#B0B0B0',
            border: 'none',
            borderRadius: 8,
            padding: '11px 20px 12px 20px',
            marginLeft: 2,
            fontWeight: 600,
            fontSize: 15,
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            boxShadow: '0 2px 6px 0 rgba(13, 92, 200,0.05)',
            transition: 'background 0.2s'
          }}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          {loading ? (
            <Loader size={18} color={PRIMARY} />
          ) : (
            <span style={{
              fontWeight: 700,
              letterSpacing: 0.2
            }}>Send</span>
          )}
        </button>
      </form>
      {/* Input validation error */}
      {error && (
        <div
          className="chat-error"
          style={{
            color: '#f44336',
            margin: '0.25em auto 1.2em auto',
            maxWidth: 600,
            fontSize: 14
          }}
        >
          {error}
        </div>
      )}

      {/* Usage comment on .env setup for developers */}
      <footer style={{
        fontSize: 11,
        color: '#888',
        textAlign: 'center',
        background: 'transparent',
        margin: '1.5em 0 0.5em 0',
        userSelect: 'text'
      }}>
        {/* 
          To use your OpenAI API key, add the following line to a .env file at the project root:
            REACT_APP_OPENAI_API_KEY=your-openai-api-key
         */}
        <span style={{ display: 'inline-block', opacity: 0.7 }}>
          <code>Set <b>REACT_APP_OPENAI_API_KEY</b> in your <b>.env</b> file to connect to OpenAI.</code>
        </span>
      </footer>
    </div>
  );
}

// Loader spinner for minimal UI
function Loader({ size = 20, color = ACCENT }) {
  return (
    <span
      className="loader"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2.5px solid ${color}`,
        borderTop: `2.5px solid #fff`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        verticalAlign: 'middle'
      }}
      aria-label="Loading"
    />
  );
}

// Spinner CSS animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes spin {
  0%   { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
`;
document.head.appendChild(style);

export default App;
