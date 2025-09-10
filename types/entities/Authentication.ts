import { Entity } from "./Entity.ts";

export interface Authentication extends Entity {
  algo: string;
  iterations: number;
  saltB64: string;
  hashB64: string;
}
