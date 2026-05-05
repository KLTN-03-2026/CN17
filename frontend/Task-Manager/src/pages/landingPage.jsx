import { useState, useEffect } from "react";
import BoxChatAI from "../components/BoxChatAI";

const taskCards = [
  { id: 1, tag: "MongoDB", color: "#4ECDC4", subtitle: "Database Layer", desc: "Lưu trữ dữ liệu dạng document JSON linh hoạt, hỗ trợ Atlas Cloud, Aggregation Pipeline và Indexing hiệu năng cao." },
  { id: 2, tag: "Express.js", color: "#7C6EF5", subtitle: "Backend Framework", desc: "Xây dựng RESTful API nhanh chóng với Middleware, Routing linh hoạt, JWT Authentication và Error Handling." },
  { id: 3, tag: "React.js", color: "#F5A623", subtitle: "Frontend Library", desc: "Xây dựng giao diện hiện đại với Component, Hooks, Context API, React Router và Vite." },
  { id: 4, tag: "Node.js", color: "#FF6B6B", subtitle: "Runtime Environment", desc: "Môi trường chạy JavaScript phía server, xử lý I/O bất đồng bộ và hệ sinh thái npm khổng lồ." },
];

function TaskCard({ task }) {
  return (
    <div className="task-card">
      <div className="task-card-header" style={{ marginBottom: "10px" }}>
        <span className="task-tag" style={{ background: task.color + "22", color: task.color }}>
          {task.tag}
        </span>
      </div>
      <p style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px", fontWeight: 600 }}>
        {task.subtitle}
      </p>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: "1.6" }}>
        {task.desc}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAuth = (type) => {
    window.location.href = `/${type}`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080810;
          --surface: #10101A;
          --surface2: #161622;
          --border: rgba(255,255,255,0.08);
          --accent: #6C5FF5;
          --text: #EEEDF8;
          --muted: #6B6A82;
          --radius: 16px;
          --font: 'Plus Jakarta Sans', sans-serif;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          line-height: 1.6;
        }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 60px; height: 72px;
          transition: all 0.3s;
        }
        .nav.scrolled {
          background: rgba(8,8,16,0.85);
          backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 var(--border);
        }
        .nav-actions { display: flex; align-items: center; gap: 12px; }

        .btn-auth {
          height: 42px;
          padding: 0 24px;
          border-radius: 12px;
          font-family: var(--font);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .btn-login {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          color: var(--text);
        }
        .btn-login:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .btn-register {
          background: var(--accent);
          border: none;
          color: #fff;
        }
        .btn-register:hover { opacity: 0.9; transform: translateY(-1px); }

        .hero {
          min-height: 100vh;
          display: flex; align-items: center;
          padding: 80px 60px 0;
          position: relative;
        }
        .hero-inner {
          display: grid; grid-template-columns: 1.1fr 0.9fr;
          gap: 60px; align-items: center;
          max-width: 1200px; width: 100%; margin: 0 auto;
        }

        /* ── FIX: font chữ tiếng Việt chuyên nghiệp hơn ── */
        .hero-title {
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.3px;
          margin-bottom: 24px;
        }
        .accent-text {
          background: linear-gradient(90deg, #8B7EF8, #B8AEFF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-visual {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        .task-card {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
        }

        .task-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .nav { padding: 0 24px; }
          .hero { padding: 80px 24px 0; }
          .hero-inner { grid-template-columns: 1fr; text-align: center; }
          .hero-visual { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div style={{ fontWeight: 800, fontSize: "20px" }}>
          Task<span style={{ color: "var(--accent)" }}>.</span>Manager
        </div>
        <div className="nav-actions">
          <button className="btn-auth btn-login" onClick={() => handleAuth("login")}>Đăng nhập</button>
          <button className="btn-auth btn-register" onClick={() => handleAuth("signup")}>Đăng ký</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">
              Quản lý dự án<br />
              <span className="accent-text">hiệu quả</span>
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "17px", marginBottom: "40px", maxWidth: "480px", lineHeight: "1.7" }}>
              Hệ thống điều hành công việc tối ưu cho quy trình phát triển phần mềm và làm việc nhóm hiện đại.
            </p>
            <button
              className="btn-auth btn-register"
              style={{ width: "fit-content", height: "50px", padding: "0 36px", fontSize: "15px" }}
              onClick={() => handleAuth("login")}
            >
              Trải nghiệm miễn phí
            </button>
          </div>

          <div className="hero-visual">
            {taskCards.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}