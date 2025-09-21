export interface GroupmeIntegration {
  id: string;
  accessToken: string;
  info: Record<string, string>; // response from /groupme/api/users/me
}
