import { signup } from "../utilities/security.ts";
const signupResult = await signup("Josh", "hale");
console.log(signupResult);
