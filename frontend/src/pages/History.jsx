import { useState, useEffect } from "react";
import { API } from "../config";

function History() {
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // 필터 상태
  const [filterSubjectId, setFilterSubjectId] = useState("all");
  const [range, setRange] = useState("all"); // week | month | all

  // 과목 목록 (필터 드롭다운용) — 처음 한 번
  useEffect(() => {
    fetch(`${API}/subjects`)
      .then((res) => res.json())
      .then((data) => setSubjects(data));
  }, []);

  // 세션 목록 불러오기 — 필터가 바뀔 때마다 다시 호출
  function loadSessions() {
    // 쿼리스트링 조립
    const params = new URLSearchParams();
    if (filterSubjectId !== "all") params.append("subject_id", filterSubjectId);
    if (range !== "all") params.append("range", range);

    fetch(`${API}/sessions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setSessions(data));
  }
  useEffect(() => {
    loadSessions();
  }, [filterSubjectId, range]);

  // 세션 삭제
  function handleDelete(id) {
    fetch(`${API}/sessions/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => loadSessions());
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>History</h1>

      {/* 필터 */}
      <div style={{ margin: "16px 0" }}>
        <label>과목: </label>
        <select
          value={filterSubjectId}
          onChange={(e) => setFilterSubjectId(e.target.value)}
        >
          <option value="all">전체</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <label style={{ marginLeft: "12px" }}>기간: </label>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="all">전체</option>
          <option value="week">이번 주</option>
          <option value="month">이번 달</option>
        </select>
      </div>

      {/* 세션 목록 */}
      {sessions.length === 0 ? (
        <p>세션이 없습니다.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>과목</th>
              <th>시간(분)</th>
              <th>날짜</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.subject_name}</td>
                <td>{s.duration}</td>
                {/* created_at(ISO 문자열)을 보기 좋은 날짜로 */}
                <td>{new Date(s.created_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDelete(s.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default History;
