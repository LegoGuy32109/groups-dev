import { Users } from "../../../data/Users.ts";
import ProfileImg from "../../../islands/ProfileImg.tsx";
import { Dates } from "../../../utilities/Dates.ts";
import { define } from "../../../utils.ts";

export default define.page(
  async function Page() {
    const profilesResult = await Users.getAllProfileRecords();
    if (!profilesResult.success) {
      return (
        <h1 class="font-extrabold text-5xl text-red-300">
          Failed to access Chatz
        </h1>
      );
    }

    const { profileRecords } = profilesResult;
    const groupmeProfileRecords = profileRecords.filter((record) =>
      record.value.groupme
    );

    return (
      <div class="block w-full text-slate-300 h-full px-2 pt-4">
        <h1 class="font-extrabold text-5xl">Chatz</h1>
        <div class="flex flex-col gap-2 p-2">
          {groupmeProfileRecords.map(({ value: { groupme } }) => (
            <a
              href={`/chatz/${groupme?.accessToken}`}
              class="flex bg-slate-900/50 w-md rounded-lg gap-2 items-center py-1 px-2"
            >
              <ProfileImg
                imageUrl={groupme?.info.image_url}
                profileName={groupme?.info.name ?? ""}
              />
              <span class="font-medium">{groupme?.info.name}</span>
              <div class="grow" />
              <div class="flex flex-col text-xs font-light items-end">
                <span>
                  <i>Updated:</i>{" "}
                  {Dates.fromGroupmeTemporal(groupme?.info.updated_at ?? 0)
                    .toLocaleString()}
                </span>
                <span>
                  <i>Created:</i>{" "}
                  {Dates.fromGroupmeTemporal(groupme?.info.created_at ?? 0)
                    .toLocaleString()}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  },
);
