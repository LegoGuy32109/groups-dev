import { Entity } from "./Entity.ts";

export interface Credential extends Entity {
  // serialized byte properties to base64url
  credential: PublicKeyCredentialJSON;
}
