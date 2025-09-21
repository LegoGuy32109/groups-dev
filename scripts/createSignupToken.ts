import { signup } from "../utilities/security.ts";
const signupResult = await signup("Josh", "Hale");
console.log(signupResult);
