import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
console.log("GROQ KEY:", API_KEY);

const SYSTEM_PROMPT = `
Bạn là AI Todo Checklist Assistant của hệ thống Task Manager.

NHIỆM VỤ DUY NHẤT:
- Chỉ hỗ trợ tạo công việc, phân tích công việc, chia nhỏ công việc thành Todo Checklist.
- Người dùng sẽ nhập tiêu đề và mô tả công việc.
- Bạn phải tạo danh sách checklist rõ ràng, thực tế, dễ thực hiện.

QUY TẮC BẮT BUỘC:

1. Nếu nội dung người dùng KHÔNG liên quan đến:
- công việc
- task
- todo
- checklist
- dự án
- deadline
- học tập
- làm việc
- kế hoạch cá nhân
- quản lý tiến độ

Thì KHÔNG được trả lời nội dung đó.

Chỉ trả lời đúng câu sau:
"Mình chỉ hỗ trợ tạo Todo Checklist cho công việc. Bạn hãy nhập tiêu đề và mô tả công việc cần xử lý nhé."

2. Nếu người dùng nhập công việc:
- Hãy tạo checklist từ 4 đến 8 mục.
- Mỗi mục checklist bắt đầu bằng dấu "-".
- Nội dung ngắn gọn, rõ hành động.
- Có phần Tiêu đề, Mô tả ngắn, Độ ưu tiên, Hạn chót.
- Nếu không có hạn chót, dùng null.
- Nếu không rõ độ ưu tiên, mặc định là "medium".
- Nếu công việc có vẻ quan trọng hoặc gấp, chọn "high".
- Nếu công việc đơn giản, chọn "low".

3. Định dạng trả lời cho người dùng:

**Tiêu đề:** ...
**Mô tả:** ...
**Độ ưu tiên:** low | medium | high
**Hạn chót:** ...

**Todo Checklist:**
- Việc cần làm 1
- Việc cần làm 2
- Việc cần làm 3
- Việc cần làm 4

4. Cuối câu trả lời LUÔN kèm JSON ngầm đúng định dạng:

[TASK_DATA]: {
  "title": "...",
  "description": "...",
  "priority": "low | medium | high",
  "deadline": null,
  "checklist": [
    "Việc cần làm 1",
    "Việc cần làm 2",
    "Việc cần làm 3"
  ]
}

5. JSON phải hợp lệ, không được có dấu phẩy thừa.
6. Không giải thích lan man.
7. Không trả lời câu hỏi ngoài phạm vi Todo Checklist.
`;

const parseMarkdown = (text) => {
  const cleanText = text.replace(/\[TASK_DATA\]:.*$/s, "").trim();
  const lines = cleanText.split("\n");

  return lines.map((line, i) => {
    const isListItem = /^[\*\-]\s+/.test(line) || /^\d+\.\s+/.test(line);
    const content = line.replace(/^[\*\-]\s+/, "").replace(/^\d+\.\s+/, "");

    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return (
          <strong key={j} style={{ color: "#9B8BFF" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (isListItem) {
      return (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "8px",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "4px",
              border: "2px solid #6C5FF5",
              marginTop: "3px",
              flexShrink: 0,
            }}
          />
          <span style={{ color: "#EEEDF8" }}>{parts}</span>
        </div>
      );
    }

    if (line.trim() === "") {
      return <div key={i} style={{ height: "8px" }} />;
    }

    return (
      <div key={i} style={{ marginBottom: "6px", color: "#DDDCF0" }}>
        {parts}
      </div>
    );
  });
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .gcb-bubble {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9999;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .gcb-toggle {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6C5FF5, #9B8BFF);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 30px rgba(108, 95, 245, 0.45);
    transition: all 0.2s ease;
    margin-left: auto;
    color: #fff;
    font-size: 22px;
    font-weight: 800;
  }

  .gcb-toggle:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 12px 36px rgba(108, 95, 245, 0.6);
  }

  .gcb-window {
    position: absolute;
    bottom: 72px;
    right: 0;
    width: 390px;
    height: 560px;
    background: #0e0e1a;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
  }

  .gcb-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: #12121f;
  }

  .gcb-avatar {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    background: linear-gradient(135deg, #6C5FF5, #9B8BFF);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    flex-shrink: 0;
  }

  .gcb-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #7CFFB2;
    margin-top: 2px;
  }

  .gcb-dot {
    width: 7px;
    height: 7px;
    background: #7CFFB2;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(124, 255, 178, 0.8);
  }

  .gcb-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scrollbar-width: none;
  }

  .gcb-messages::-webkit-scrollbar {
    display: none;
  }

  .gcb-msg {
    max-width: 90%;
    padding: 14px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .gcb-msg.user {
    align-self: flex-end;
    background: linear-gradient(135deg, #6C5FF5, #8377ff);
    color: #fff;
    border-bottom-right-radius: 5px;
  }

  .gcb-msg.bot {
    align-self: flex-start;
    background: #1a1a2e;
    color: #DDDCF0;
    border-bottom-left-radius: 5px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .gcb-footer {
    padding: 16px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    gap: 12px;
    background: #12121f;
  }

  .gcb-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 12px 14px;
    color: #EEEDF8;
    outline: none;
    resize: none;
    font-size: 14px;
    font-family: inherit;
    max-height: 90px;
  }

  .gcb-input::placeholder {
    color: #6B6A82;
  }

  .gcb-input:focus {
    border-color: rgba(108,95,245,0.8);
    box-shadow: 0 0 0 3px rgba(108,95,245,0.16);
  }

  .gcb-send {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: #6C5FF5;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .gcb-send:hover:not(:disabled) {
    background: #7C70FF;
    transform: translateY(-1px);
  }

  .gcb-send:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .gcb-empty {
    text-align: center;
    padding: 42px 12px;
    color: #6B6A82;
    font-size: 14px;
    line-height: 1.7;
  }

  .gcb-empty-title {
    color: #9B8BFF;
    display: block;
    margin-bottom: 10px;
    font-weight: 800;
    font-size: 16px;
  }

  .gcb-loading {
    align-self: flex-start;
    padding: 12px 14px;
    color: #9B8BFF;
    background: #1a1a2e;
    border-radius: 16px;
    border-bottom-left-radius: 5px;
    font-size: 14px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  @media (max-width: 480px) {
    .gcb-bubble {
      right: 16px;
      bottom: 16px;
    }

    .gcb-window {
      width: calc(100vw - 32px);
      height: 560px;
      right: 0;
    }
  }
`;

export default function BoxChatAI() {
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  if (location.pathname === "/") return null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const extractTaskData = (botText) => {
    if (!botText.includes("[TASK_DATA]:")) return null;

    try {
      const jsonPart = botText.split("[TASK_DATA]:")[1].trim();
      return JSON.parse(jsonPart);
    } catch (error) {
      console.error("Lỗi parse TASK_DATA:", error);
      return null;
    }
  };

  const handleCreateTask = async (taskObj) => {
    if (!taskObj?.title) return;

    try {
      const response = await fetch("http://localhost:8000/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: taskObj.title,
          description: taskObj.description || "Tạo từ trợ lý AI",
          priority: taskObj.priority || "medium",
          deadline: taskObj.deadline || null,
          checklist: taskObj.checklist || [],
          status: "todo",
        }),
      });

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: ` **Hệ thống xác nhận:** Task "${taskObj.title}" đã được lưu vào Todo Checklist.`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: ` **Thông báo:** AI đã tạo checklist nhưng chưa lưu được vào hệ thống.`,
          },
        ]);
      }
    } catch (error) {
      console.error("Lỗi đồng bộ Task:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: ` **Lỗi kết nối:** Không thể lưu task vào hệ thống. Vui lòng kiểm tra server backend.`,
        },
      ]);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", text };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
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
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            ...history,
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.3,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Groq API error:", data);
        throw new Error(data?.error?.message || "Lỗi API");
      }

      const botText =
        data?.choices?.[0]?.message?.content ||
        "Mình chưa thể phân tích công việc này. Bạn hãy nhập lại tiêu đề và mô tả rõ hơn nhé.";

      setMessages((prev) => [...prev, { role: "bot", text: botText }]);

      const taskObj = extractTaskData(botText);

      if (taskObj) {
        await handleCreateTask(taskObj);
      }
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Lỗi kết nối AI. Vui lòng kiểm tra API key hoặc kết nối mạng.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="gcb-bubble">
        {open && (
          <div className="gcb-window">
            <div className="gcb-header">
              <div className="gcb-avatar">✓</div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    color: "#EEEDF8",
                  }}
                >
                  Todo Checklist AI
                </div>

                <div className="gcb-status">
                  <span className="gcb-dot"></span>
                  Chỉ hỗ trợ tạo checklist công việc
                </div>
              </div>
            </div>

            <div className="gcb-messages">
              {messages.length === 0 && (
                <div className="gcb-empty">
                  <strong className="gcb-empty-title">Chào Tùng!</strong>
                  Nhập tiêu đề và mô tả công việc, mình sẽ tự động chia nhỏ
                  thành Todo Checklist cho bạn.
                  <br />
                  <br />
                  Ví dụ:
                  <br />
                  “Làm giao diện Dashboard - cần thống kê task theo tháng”
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`gcb-msg ${m.role}`}>
                  {m.role === "bot" ? parseMarkdown(m.text) : m.text}
                </div>
              ))}

              {loading && (
                <div className="gcb-loading">Đang phân tích công việc...</div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="gcb-footer">
              <textarea
                className="gcb-input"
                placeholder="Nhập title và mô tả công việc..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
              />

              <button
                className="gcb-send"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                title="Gửi"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <button className="gcb-toggle" onClick={() => setOpen(!open)}>
          {open ? "✕" : "✓"}
        </button>
      </div>
    </>
  );
}