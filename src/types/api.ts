// ----------------------------------------------------
// API Request & Response Contracts
// ----------------------------------------------------

export interface ApiResponse<T = object> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string | Record<string, string | number | boolean | null>;
}
