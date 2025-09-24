export interface GroupmeIntegration {
  id: string;
  accessToken: string;
  info: Record<string, any>; // response from /groupme/api/users/me
}
