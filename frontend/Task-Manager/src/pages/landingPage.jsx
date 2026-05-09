import { useState, useEffect } from "react";
import BoxChatAI from "../components/BoxChatAI";

const taskCards = [
  {
    id: 1,
    tag: "MongoDB",
    color: "#4ECDC4",
    subtitle: "Database Layer",
    desc: "Lưu trữ dữ liệu dạng document JSON linh hoạt, hỗ trợ Atlas Cloud, Aggregation Pipeline và Indexing hiệu năng cao.",
  },
  {
    id: 2,
    tag: "Express.js",
    color: "#7C6EF5",
    subtitle: "Backend Framework",
    desc: "Xây dựng RESTful API nhanh chóng với Middleware, Routing linh hoạt, JWT Authentication và Error Handling.",
  },
  {
    id: 3,
    tag: "React.js",
    color: "#F5A623",
    subtitle: "Frontend Library",
    desc: "Xây dựng giao diện hiện đại với Component, Hooks, Context API, React Router và Vite.",
  },
  {
    id: 4,
    tag: "Node.js",
    color: "#FF6B6B",
    subtitle: "Runtime Environment",
    desc: "Môi trường chạy JavaScript phía server, xử lý I/O bất đồng bộ và hệ sinh thái npm khổng lồ.",
  },
];

function TaskCard({ task }) {
  return (
    <div className="task-card">
      <div
        className="task-card-header"
        style={{ marginBottom: "12px" }}
      >
        <span
          className="task-tag"
          style={{
            background: task.color + "22",
            color: task.color,
          }}
        >
          {task.tag}
        </span>
      </div>

      <p
        style={{
          fontSize: "11px",
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "10px",
          fontWeight: 700,
        }}
      >
        {task.subtitle}
      </p>

      <p
        style={{
          fontSize: "15px",
          color: "rgba(255,255,255,0.72)",
          lineHeight: "1.8",
        }}
      >
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

    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAuth = (type) => {
    window.location.href = `/${type}`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --bg: #070711;
          --surface: #11111B;
          --surface2: #151522;
          --border: rgba(255,255,255,0.07);
          --accent: #8B7EF8;
          --text: #F4F2FF;
          --muted: #7B7A94;
          --radius: 18px;
          --font: 'Plus Jakarta Sans', sans-serif;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          overflow-x: hidden;
        }

        /* ================= NAVBAR ================= */

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;

          height: 76px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 70px;

          z-index: 100;

          transition: all 0.3s ease;
        }

        .nav.scrolled {
          background: rgba(7,7,17,0.82);

          backdrop-filter: blur(18px);

          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .logo {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .logo span {
          color: var(--accent);
        }

        .nav-actions {
          display: flex;
          gap: 14px;
        }

        .btn-auth {
          height: 46px;

          padding: 0 28px;

          border-radius: 14px;

          border: none;

          font-family: var(--font);
          font-size: 14px;
          font-weight: 700;

          cursor: pointer;

          transition: all 0.25s ease;
        }

        .btn-login {
          background: rgba(255,255,255,0.04);

          color: #fff;

          border: 1px solid rgba(255,255,255,0.06);
        }

        .btn-login:hover {
          background: rgba(255,255,255,0.08);
        }

        .btn-register {
          background: linear-gradient(
            135deg,
            #7B6EF6,
            #9B8CFF
          );

          color: white;

          box-shadow:
            0 12px 28px rgba(123,110,246,0.3);
        }

        .btn-register:hover {
          transform: translateY(-2px);
        }

        /* ================= HERO ================= */

        .hero {
          min-height: 100vh;

          display: flex;
          align-items: center;

          padding: 100px 70px 40px;
        }

        .hero-inner {
          width: 100%;
          max-width: 1280px;

          margin: 0 auto;

          display: grid;
          grid-template-columns: 1.05fr 0.95fr;

          gap: 70px;

          align-items: center;
        }

        /* ================= TITLE ================= */

        .hero-title {
          font-size: clamp(54px, 6vw, 86px);

          font-weight: 800;

          line-height: 1.03;

          letter-spacing: -3px;

          margin-bottom: 34px;

          text-wrap: balance;
        }

        .line-1 {
          display: block;

          color: rgba(255,255,255,0.98);
        }

        .line-2 {
          display: block;

          margin-top: 6px;

          background: linear-gradient(
            90deg,
            #B3A6FF 0%,
            #8B7EF8 50%,
            #D7CFFF 100%
          );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;

          filter: drop-shadow(
            0 0 18px rgba(139,126,248,0.22)
          );
        }

        .hero-description {
          max-width: 560px;

          font-size: 20px;

          line-height: 1.9;

          color: var(--muted);

          margin-bottom: 44px;
        }

        /* ================= LABEL ================= */

        .free-label {
          display: inline-flex;
          align-items: center;
          gap: 12px;

          padding: 15px 28px;

          border-radius: 999px;

          position: relative;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              rgba(139,126,248,0.15),
              rgba(139,126,248,0.05)
            );

          border: 1px solid rgba(139,126,248,0.24);

          color: #D4CCFF;

          font-size: 15px;
          font-weight: 800;

          letter-spacing: 1.4px;

          text-transform: uppercase;

          box-shadow:
            0 0 40px rgba(139,126,248,0.12),
            inset 0 0 24px rgba(255,255,255,0.02);

          backdrop-filter: blur(16px);
        }

        .free-label::before {
          content: "";

          position: absolute;

          top: 0;
          left: -140%;

          width: 80%;
          height: 100%;

          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.18),
            transparent
          );

          transform: skewX(-20deg);

          animation: shine 3.4s linear infinite;
        }

        @keyframes shine {
          100% {
            left: 180%;
          }
        }

        /* ================= CARDS ================= */

        .hero-visual {
          display: grid;
          grid-template-columns: 1fr 1fr;

          gap: 20px;
        }

        .task-card {
          background: var(--surface2);

          border: 1px solid var(--border);

          border-radius: var(--radius);

          padding: 24px;

          transition: all 0.3s ease;
        }

        .task-card:hover {
          transform: translateY(-5px);

          border-color: rgba(255,255,255,0.12);

          box-shadow:
            0 20px 40px rgba(0,0,0,0.32);
        }

        .task-tag {
          display: inline-block;

          padding: 6px 14px;

          border-radius: 10px;

          font-size: 13px;

          font-weight: 700;
        }

        /* ================= MOBILE ================= */

        @media (max-width: 950px) {
          .nav {
            padding: 0 24px;
          }

          .hero {
            padding: 120px 24px 60px;
          }

          .hero-inner {
            grid-template-columns: 1fr;

            text-align: center;
          }

          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-visual {
            grid-template-columns: 1fr;
          }

          .free-label {
            margin: 0 auto;
          }

          .hero-title {
            letter-spacing: -2px;
          }
        }
      `}</style>

      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="logo">
          Task<span>.</span>Manager
        </div>

        <div className="nav-actions">
          <button
            className="btn-auth btn-login"
            onClick={() => handleAuth("login")}
          >
            Đăng nhập
          </button>

          <button
            className="btn-auth btn-register"
            onClick={() => handleAuth("signup")}
          >
            Đăng ký
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">
              <span className="line-1">
                Quản lý dự án
              </span>

              <span className="line-2">
                hiệu quả
              </span>
            </h1>

            <p className="hero-description">
              Hệ thống điều hành công việc tối ưu
              cho quy trình phát triển phần mềm và
              làm việc nhóm hiện đại.
            </p>

            <div className="free-label">
                 Hãy đăng nhập để trải nghiệm miễn phí
            </div>
          </div>

          <div className="hero-visual">
            {taskCards.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}