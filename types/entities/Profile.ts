import { Entity } from "./Entity.ts";
import { GroupmeIntegration } from "./Groupme.ts";

export interface Profile extends Entity {
  firstName: string;
  lastName: string;
  defaultGroup?: string;
  groupme?: GroupmeIntegration;
}
