import { Db } from "../utilities/Database.ts";
import { signup } from "../utilities/security.ts";
async function showUsersAndUsernames() {
  const [allUsers, allUsernames] = await Promise.all([
    Db.getUsers(),
    Db.getUsernames(),
  ]);
  console.log(allUsers);
  console.log(allUsernames);
}
//console.log("current users and usernames");
//showUsersAndUsernames();
//console.log("signing up user");
//const result = await signup("josh", "hale");
//console.log(result);
//const joshUserId = result.userId;
//console.log("users and usernames after josh");
//showUsersAndUsernames();
//const deleteResult = await Db.deleteUser(joshUserId ?? "");
//console.log(deleteResult);
//console.log("users and usernames after delete");
await Db.deleteAllDataInDb();
showUsersAndUsernames();
