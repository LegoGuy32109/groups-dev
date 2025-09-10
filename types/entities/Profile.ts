import { Entity } from "./Entity.ts";

export interface Profile extends Entity {
  username: string;
  firstName?: string;
  lastName?: string;
  defaultGroup?: unknown;
}
