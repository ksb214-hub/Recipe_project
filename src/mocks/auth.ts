// 백엔드에서 올 법한 회원 정보 타입 (Orval 생성 전이라도 미리 정의)
export interface MockUser {
  id: number;
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
}

// 1. 이미 가입된 유저 데이터 (중복 가입 체크 시연용)
export const EXISTING_USERS: MockUser[] = [
  { id: 1, email: "test@test.com", nickname: "테스트유저", role: "USER" },
  { id: 2, email: "seongbin@zero.com", nickname: "성빈님", role: "USER" }
];

// 2. 로그인 성공 시 내려줄 가짜 토큰 및 응답값
export const MOCK_LOGIN_RESPONSE = {
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // 가짜 JWT
  user: EXISTING_USERS[1]
};