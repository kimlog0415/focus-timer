// 빌드 시 VITE_API_URL 환경변수가 있으면 배포된 백엔드 주소를, 없으면 로컬 주소를 사용
export const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
