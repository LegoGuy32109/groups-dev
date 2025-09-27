import { Users } from "../data/Users.ts";
import { Profile } from "../types/entities/Profile.ts";
import DeleteButton from "./DeleteButton.tsx";

export default function DeleteUserButton(
  { profile, userId }: { profile: Profile; userId?: string },
) {
  async function handleDeleteUser() {
    if (!userId) {
      console.error("Failed to delete User, id was missing");
      return;
    }

    // TODO: replace this with a <dialog> to stop blocking event loop
    const ok = globalThis.confirm(
      `Are you sure you want to delete '${profile.firstName} ${profile.lastName}'?`,
    );

    if (!ok) return;

    const result = await Users.deleteUser(userId);
    if (!result.success) {
      console.error(result.errors);
    }
  }

  return (
    <div onClick={handleDeleteUser}>
      <DeleteButton />
    </div>
  );
}
