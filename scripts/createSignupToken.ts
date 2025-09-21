import { signup } from "../utilities/security.ts";
const signupResult = await signup("Darby", "Fehl");
console.log(signupResult);
