import { GroupmeTemporal } from "../utilities/Dates.ts";

// response from /groupme/api/users/me
export interface GroupmeInfo {
  id: string;
  user_id: string;
  name: string;
  email: string;
  email_verified: boolean;
  created_at: GroupmeTemporal;
  updated_at: GroupmeTemporal;

  locale: string;
  bio?: string;
  phone_number?: string;
  sms: boolean;
  zip_code?: string;

  image_url?: string;
  share_url?: string;
  share_qr_code_url?: string;

  facebook_connected: boolean;
  microsoft_connected: boolean;
  twitter_connected: boolean;
  mfa: {
    enabled: boolean;
    channels: Array<{ type: string; created_at: GroupmeTemporal }>;
  };
  tags: Array<string>;
  prompt_for_survey: boolean;
  show_age_gate: boolean;
  birth_date_set: boolean;
  graduation_year: string;
  campus_profile_visibility: "visible" | "hidden";
}
