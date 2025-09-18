import { UserAgent } from "@std/http";
import { Entity } from "./Entity.ts";

export interface Session extends Entity {
  userId: string;
  userAgent?: UserAgent;
}
