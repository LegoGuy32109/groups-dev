import { createDefine } from "fresh";
import { Profile } from "./types/entities/Profile.ts";
import { Session } from "./types/entities/Session.ts";

// This specifies the type of "ctx.state"
export interface State {
  shared: string;
  session?: Session;
  profile?: Profile;
  errors?: Array<string>;
  urlPath?: string;
}

export const define = createDefine<State>();
