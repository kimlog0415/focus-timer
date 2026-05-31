import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { API } from "../config";
// 요일 순서 고정 (백엔드 by_weekday는 순서 없는 객체라서)
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API}/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  // 데이터 오기 전엔 로딩 표시
  if (!stats) return <p style={{ padding: "20px" }}>불러오는 중...</p>;

  // by_weekday(객체) → Recharts용 배열로 변환 ({Mon:45} → [{day:"Mon", minutes:45}])
  const weekdayData = WEEKDAYS.map((day) => ({
    day,
    minutes: stats.by_weekday[day] || 0,
  }));

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      {/* 요약 통계 카드 */}
      <div style={{ display: "flex", gap: "24px", margin: "16px 0" }}>
        <div>
          <h3>🔥 연속 기록</h3>
          <p style={{ fontSize: "32px" }}>{stats.streak}일</p>
        </div>
        <div>
          <h3>⏱ 총 집중 시간</h3>
          <p style={{ fontSize: "32px" }}>{stats.total_hours}시간</p>
        </div>
        <div>
          <h3>📅 이번 주 세션</h3>
          <p style={{ fontSize: "32px" }}>{stats.sessions_this_week}회</p>
        </div>
      </div>

      {/* 과목별 집중 시간 (막대 차트) */}
      <h3>과목별 집중 시간 (분)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={stats.by_subject}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" fill="#4caf50" />
        </BarChart>
      </ResponsiveContainer>

      {/* 요일별 집중 시간 (막대 차트) */}
      <h3>요일별 집중 시간 (분)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weekdayData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" fill="#2196f3" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Dashboard;
