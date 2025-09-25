import { GroupmeInfo } from "./GroupmeInfo.ts";

export interface GroupmeIntegration {
  id: string;
  accessToken: string;
  info: GroupmeInfo;
}
