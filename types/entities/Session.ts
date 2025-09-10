import { UserAgent } from "$std/http/user_agent.ts";
import { Entity } from "./Entity.ts";

export interface Session extends Entity {
  userId: string;
  userAgent?: UserAgent;
}
