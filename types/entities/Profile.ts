import { GroupmeIntegration } from "../Groupme.ts";
import { Entity } from "./Entity.ts";

export interface Profile extends Entity {
  firstName: string;
  lastName: string;
  defaultGroup?: string;
  groupme?: GroupmeIntegration;
}
