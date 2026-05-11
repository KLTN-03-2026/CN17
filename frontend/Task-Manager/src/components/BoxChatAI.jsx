import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Hàm parse nội dung Markdown và lọc dữ liệu JSON ngầm
 */
const parseMarkdown = (text) => {
  // Loại bỏ phần dữ liệu JSON [TASK_DATA] khỏi giao diện chat để người dùng không thấy
  const cleanText = text.replace(/\[TASK_DATA\]:.*$/s, "").trim();
  
  const lines = cleanText.split("\n");
  return lines.map((line, i) => {
    // Xử lý List item
    const isListItem = /^[\*\-]\s+/.test(line) || /^\d+\.\s+/.test(line);
    const content = line.replace(/^[\*\-]\s+/, "").replace(/^\d+\.\s+/, "");

    // Xử lý Bold **text**
    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={j} style={{ color: "#9B8BFF" }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isListItem) {
      return (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
          <span style={{ color: "#6C5FF5", flexShrink: 0, marginTop: "2px" }}>•</span>
          <span>{parts}</span>
        </div>
      );
    }

    if (line.trim() === "") return <div key={i} style={{ height: "8px" }} />;
    return <div key={i} style={{ marginBottom: "4px" }}>{parts}</div>;
  });
};

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
    transition: all 0.2s ease;
    margin-left: auto;
  }
  .gcb-toggle:hover {
    transform: scale(1.08) rotate(5deg);
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
    animation: gcb-pop 0.25s cubic-bezier(0.34,1.56,0.64,1);
    transform-origin: bottom right;
  }
  @keyframes gcb-pop {
    from { opacity: 0; transform: scale(0.8) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .gcb-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: #12121f;
  }
  .gcb-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6C5FF5, #9B8BFF);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: white;
  }
  .gcb-header-text { flex: 1; }
  .gcb-header-title { font-size: 14px; font-weight: 700; color: #EEEDF8; margin-bottom: 2px; }
  .gcb-header-sub { font-size: 11px; color: #6B6A82; }
  .gcb-online-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #4ECDC4; box-shadow: 0 0 8px #4ECDC4;
  }

  .gcb-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }

  .gcb-msg {
    max-width: 85%;
    padding: 12px 14px;
    border-radius: 16px;
    font-size: 13.5px;
    line-height: 1.55;
    word-break: break-word;
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
    padding: 12px 16px;
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    display: flex;
    gap: 4px;
  }
  .gcb-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #6C5FF5;
    animation: gcb-bounce 1.4s infinite;
  }
  .gcb-dot:nth-child(2) { animation-delay: 0.2s; }
  .gcb-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes gcb-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
    40% { transform: translateY(-5px); opacity: 1; }
  }

  .gcb-footer {
    padding: 14px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    gap: 10px;
    align-items: flex-end;
    background: #12121f;
  }
  .gcb-input {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 10px 14px;
    color: #EEEDF8;
    font-family: inherit;
    font-size: 13.5px;
    resize: none;
    outline: none;
    max-height: 100px;
    transition: all 0.2s;
  }
  .gcb-input:focus { border-color: #6C5FF5; background: rgba(255,255,255,0.07); }

  .gcb-send {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6C5FF5, #8B7EF8);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .gcb-send:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
  .gcb-send:disabled { opacity: 0.3; cursor: not-allowed; }

  .gcb-welcome {
    text-align: center;
    padding: 20px 10px;
    color: #6B6A82;
    font-size: 13px;
  }
  .gcb-welcome strong { color: #6C5FF5; display: block; margin-bottom: 5px; font-size: 15px; }
`;

export default function BoxChatAI() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Không hiển thị ở trang Landing Page
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
              content: `Bạn là FormAI - Trợ lý thông minh của hệ thống Task Manager.
              NHIỆM VỤ:
              1. Thu thập thông tin để tạo Task: tiêu đề (title), mô tả . 
              2. Nếu thiếu thông tin, hãy hỏi ngắn gọn từng bước một.
              3. Khi đã có đủ 3 thông tin trên, hãy xác nhận và trả lời dòng cuối cùng ĐÚNG định dạng: [TASK_DATA]: {"title": "...", "priority": "...", "deadline": "..."}
              4. Tuyệt đối không trả lời các câu hỏi ngoài phạm vi quản lý công việc.`
            },
            ...history,
            { role: "user", content: text },
          ],
          temperature: 0.5,
        }),
      });

      const data = await res.json();
      const botText = data?.choices?.[0]?.message?.content || "Tôi đang gặp sự cố kết nối, hãy thử lại nhé.";

      // Logic xử lý ngầm dữ liệu JSON nếu có
      if (botText.includes("[TASK_DATA]:")) {
        const jsonPart = botText.split("[TASK_DATA]:")[1].trim();
        try {
          const taskObj = JSON.parse(jsonPart);
          console.log("FormAI gợi ý dữ liệu Task:", taskObj);
          // Bạn có thể kích hoạt Event hoặc mở Modal tại đây
        } catch (e) {
          console.error("Lỗi parse dữ liệu AI");
        }
      }

      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Lỗi hệ thống. Vui lòng kiểm tra API Key." }]);
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
                <div className="gcb-header-title">FormAI Assistant</div>
                <div className="gcb-header-sub">Sẵn sàng hỗ trợ bạn</div>
              </div>
              <div className="gcb-online-dot" />
            </div>

            <div className="gcb-messages">
              {messages.length === 0 && (
                <div className="gcb-welcome">
                  <strong>Chào mừng bạn!</strong>
                  Tôi có thể giúp bạn tạo task nhanh chóng. Bạn muốn làm gì hôm nay?
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`gcb-msg ${m.role}`}>
                  {m.role === "bot" ? parseMarkdown(m.text) : m.text}
                </div>
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
                placeholder="Nhập yêu cầu... (Ví dụ: Tạo task học React)"
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

        <button className="gcb-toggle" onClick={() => setOpen((o) => !o)} title="FormAI">
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