import { Entity } from "./Entity.ts";

export interface Attendance extends Entity {
  count: number; // >= 0
}
