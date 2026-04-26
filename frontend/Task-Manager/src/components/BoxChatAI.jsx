import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .gcb-bubble {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9999;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .gcb-toggle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6C5FF5, #9B8BFF);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 24px rgba(108,95,245,0.45);
    transition: transform 0.2s, box-shadow 0.2s;
    margin-left: auto;
  }
  .gcb-toggle:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 32px rgba(108,95,245,0.6);
  }

  .gcb-window {
    position: absolute;
    bottom: 68px;
    right: 0;
    width: 360px;
    height: 520px;
    background: #0e0e1a;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    animation: gcb-pop 0.22s cubic-bezier(0.34,1.56,0.64,1);
    transform-origin: bottom right;
  }
  @keyframes gcb-pop {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }

  .gcb-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: #12121f;
  }
  .gcb-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6C5FF5, #9B8BFF);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .gcb-header-text { flex: 1; }
  .gcb-header-title { font-size: 14px; font-weight: 700; color: #EEEDF8; line-height: 1; margin-bottom: 3px; }
  .gcb-header-sub { font-size: 11px; color: #6B6A82; }
  .gcb-online-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #4ECDC4; box-shadow: 0 0 6px #4ECDC4;
  }

  .gcb-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.08) transparent;
  }

  .gcb-msg {
    max-width: 82%;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 13.5px;
    line-height: 1.55;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .gcb-msg.user {
    align-self: flex-end;
    background: linear-gradient(135deg, #6C5FF5, #8B7EF8);
    color: #fff;
    border-bottom-right-radius: 4px;
  }
  .gcb-msg.bot {
    align-self: flex-start;
    background: #1a1a2e;
    color: #DDDCF0;
    border-bottom-left-radius: 4px;
    border: 1px solid rgba(255,255,255,0.06);
  }

  .gcb-typing {
    align-self: flex-start;
    background: #1a1a2e;
    border: 1px solid rgba(255,255,255,0.06);
    padding: 12px 16px;
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    display: flex;
    gap: 5px;
    align-items: center;
  }
  .gcb-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #6C5FF5;
    animation: gcb-bounce 1.2s infinite;
  }
  .gcb-dot:nth-child(2) { animation-delay: 0.2s; }
  .gcb-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes gcb-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-6px); opacity: 1; }
  }

  .gcb-footer {
    padding: 12px 14px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: #12121f;
  }
  .gcb-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 10px 14px;
    color: #EEEDF8;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13.5px;
    resize: none;
    outline: none;
    max-height: 100px;
    min-height: 40px;
    line-height: 1.5;
    transition: border-color 0.2s;
    scrollbar-width: none;
  }
  .gcb-input::placeholder { color: #4a4a62; }
  .gcb-input:focus { border-color: rgba(108,95,245,0.5); }

  .gcb-send {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6C5FF5, #8B7EF8);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s, transform 0.15s;
    flex-shrink: 0;
  }
  .gcb-send:hover { opacity: 0.85; transform: scale(1.05); }
  .gcb-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .gcb-welcome {
    text-align: center;
    padding: 24px 16px 8px;
    color: #4a4a62;
    font-size: 12.5px;
    line-height: 1.6;
  }
  .gcb-welcome strong { color: #6C5FF5; display: block; font-size: 14px; margin-bottom: 4px; }
`;

export default function BoxChatAI() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Ẩn ở landing page
  if (location.pathname === "/") return null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      }));

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "Bạn là trợ lý AI của ứng dụng Task Manager, hỗ trợ người dùng về quản lý dự án, công việc nhóm và MERN stack. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.",
            },
            ...history,
            { role: "user", content: text },
          ],
        }),
      });

      const data = await res.json();
      const botText =
        data?.choices?.[0]?.message?.content ||
        "Xin lỗi, tôi không thể trả lời lúc này.";

      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Lỗi kết nối. Vui lòng thử lại." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="gcb-bubble">
        {open && (
          <div className="gcb-window">
            <div className="gcb-header">
              <div className="gcb-avatar">✦</div>
              <div className="gcb-header-text">
                <div className="gcb-header-title">AI Assistant</div>
                <div className="gcb-header-sub">Powered by Gemini</div>
              </div>
              <div className="gcb-online-dot" />
            </div>

            <div className="gcb-messages">
              {messages.length === 0 && (
                <div className="gcb-welcome">
                  <strong>Xin chào! 👋</strong>
                  Tôi có thể giúp bạn về quản lý dự án, MERN stack hoặc bất kỳ câu hỏi nào khác.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`gcb-msg ${m.role}`}>{m.text}</div>
              ))}
              {loading && (
                <div className="gcb-typing">
                  <div className="gcb-dot" />
                  <div className="gcb-dot" />
                  <div className="gcb-dot" />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="gcb-footer">
              <textarea
                ref={textareaRef}
                className="gcb-input"
                placeholder="Nhập tin nhắn... (Enter để gửi)"
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(e); }}
                onKeyDown={handleKey}
                rows={1}
              />
              <button className="gcb-send" onClick={sendMessage} disabled={loading || !input.trim()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        <button className="gcb-toggle" onClick={() => setOpen((o) => !o)} title="Chat với AI">
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </>
  );
}