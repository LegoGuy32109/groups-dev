import { Entity } from "./Entity.ts";

export interface Profile extends Entity {
  username: string;
  firstName?: string;
  lastName?: string;
  defaultGroup?: string;
  groupme?: {
    id: string;
    accessToken: string;
    info: Record<string, string>; // response from /groupme/api/users/me
  };
}
