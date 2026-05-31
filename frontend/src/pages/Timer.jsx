import { useState, useEffect } from "react";
import { API } from "../config";

const FOCUS_TIME = 1500; // 집중 25분 (초)
const BREAK_TIME = 300; // 휴식 5분 (초)

function Timer() {
  // ---- 타이머 상태 (localStorage에서 복원: 새로고침해도 유지) ----
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const saved = localStorage.getItem("secondsLeft");
    return saved !== null ? Number(saved) : FOCUS_TIME;
  });
  const [isRunning, setIsRunning] = useState(
    () => localStorage.getItem("isRunning") === "true",
  );
  const [mode, setMode] = useState(
    () => localStorage.getItem("mode") || "focus", // "focus" | "break"
  );

  // ---- 과목 상태 ----
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState("");

  // 모드에 따른 전체 시간 / 진행률
  const totalTime = mode === "focus" ? FOCUS_TIME : BREAK_TIME;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((totalTime - secondsLeft) / totalTime) * 100;

  // ---- 과목 목록 불러오기 (처음 한 번) ----
  function loadSubjects() {
    fetch(`${API}/subjects`)
      .then((res) => res.json())
      .then((data) => {
        setSubjects(data);
        // 선택된 과목이 없으면 첫 과목을 기본 선택
        if (data.length > 0) {
          setSelectedSubjectId((prev) => prev ?? data[0].id);
        }
      });
  }
  useEffect(() => {
    loadSubjects();
  }, []);

  // ---- 1초마다 카운트다운 ----
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      // 0 밑으로는 안 내려가게 (0에서 멈춤)
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // ---- 타이머 상태를 localStorage에 저장 (바뀔 때마다) ----
  useEffect(() => {
    localStorage.setItem("secondsLeft", secondsLeft);
    localStorage.setItem("isRunning", isRunning);
    localStorage.setItem("mode", mode);
  }, [secondsLeft, isRunning, mode]);

  // ---- 0초가 되면 완료 처리 ----
  useEffect(() => {
    if (secondsLeft > 0) return;
    setIsRunning(false);

    if (mode === "focus") {
      // 집중 세션 자동 저장 (과목이 선택돼 있을 때만)
      if (selectedSubjectId) {
        fetch(`${API}/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject_id: selectedSubjectId,
            duration: 25,
          }),
        });
      }
      alert("🎉 집중 완료! 5분 휴식을 시작합니다.");
      // 휴식 모드로 전환 후 자동 시작
      setMode("break");
      setSecondsLeft(BREAK_TIME);
      setIsRunning(true);
    } else {
      alert("☕ 휴식 끝! 다시 집중해볼까요?");
      setMode("focus");
      setSecondsLeft(FOCUS_TIME);
    }
  }, [secondsLeft]);

  // ---- 리셋: 현재 모드의 처음으로 ----
  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
  }

  // ---- 과목 추가 ----
  function handleAddSubject() {
    const name = newSubjectName.trim();
    if (!name) return;
    fetch(`${API}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewSubjectName("");
        loadSubjects();
      });
  }

  // ---- 과목 삭제 ----
  function handleDeleteSubject(id) {
    fetch(`${API}/subjects/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => loadSubjects());
  }

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h1>{mode === "focus" ? "🍅 집중" : "☕ 휴식"}</h1>

      {/* 타이머 표시 */}
      <p style={{ fontSize: "48px", margin: "10px 0" }}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </p>

      {/* 진행 막대 */}
      <div
        style={{
          width: "300px",
          height: "20px",
          background: "#eee",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: mode === "focus" ? "#4caf50" : "#2196f3",
            transition: "width 1s linear",
          }}
        />
      </div>

      {/* 컨트롤 버튼 */}
      <div style={{ margin: "16px 0" }}>
        <button onClick={() => setIsRunning(true)}>시작</button>
        <button onClick={() => setIsRunning(false)}>일시정지</button>
        <button onClick={handleReset}>리셋</button>
      </div>

      {/* 과목 선택 */}
      <div style={{ margin: "16px 0" }}>
        <label>과목 선택: </label>
        <select
          value={selectedSubjectId ?? ""}
          onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* 과목 관리 (추가 / 삭제) */}
      <div style={{ margin: "16px 0" }}>
        <h3>과목 관리</h3>
        <input
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
          placeholder="새 과목 이름"
        />
        <button onClick={handleAddSubject}>추가</button>
        <ul>
          {subjects.map((s) => (
            <li key={s.id}>
              {s.name}{" "}
              <button onClick={() => handleDeleteSubject(s.id)}>삭제</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Timer;
