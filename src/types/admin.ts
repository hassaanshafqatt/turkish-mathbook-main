export type UserRole = "owner" | "admin" | "user";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_sign_in_at?: string;
}

export interface Stats {
  totalBooks: number;
  totalQuestions: number;
  successRate: number;
}

export interface StatsResponse {
  total_books: number;
  total_questions: number;
  success_rate: number;
}
