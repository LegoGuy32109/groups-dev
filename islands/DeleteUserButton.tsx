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

    const deleteResponse = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
    });
    const response = await deleteResponse.json();
    if (response.errors) {
      console.error(response.errors);
    } else {
       globalThis.location.reload()
    }
  }

  return (
    <div onClick={handleDeleteUser}>
      <DeleteButton />
    </div>
  );
}
