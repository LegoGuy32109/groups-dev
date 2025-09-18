import { assert, assertEquals, assertNotEquals } from "@std/assert";
import {
  fromBase64,
  getPbkdf2Hash,
  timingSafeEqual,
  toBase64,
} from "./security.ts";

Deno.test({
  name: "data can be converted to base64 and back",
  fn() {
    const data = crypto.getRandomValues(new Uint8Array(16));
    const string = toBase64(data);
    const decodedData = fromBase64(string);
    assertEquals(data, decodedData);
  },
});

Deno.test({
  name: "password can be hashed twice and equal",
  async fn() {
    const password = "`super secret passaword$#@!!+";
    const differentPassword = "`super secret passaword$#@!+";
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await getPbkdf2Hash(password, salt);
    const derivedKeyAgain = await getPbkdf2Hash(password, salt);
    const incorrectKey = await getPbkdf2Hash(differentPassword, salt);

    assertEquals<Uint8Array>(derivedKey, derivedKeyAgain);
    assert(
      timingSafeEqual(derivedKey, derivedKeyAgain),
      "linear time hash compare failed, equal keys found incorrect",
    );
    assertNotEquals<Uint8Array>(derivedKey, incorrectKey);
    assert(
      !timingSafeEqual(incorrectKey, derivedKey),
      "linear time hash compare failed, unequal keys found correct",
    );
  },
});
