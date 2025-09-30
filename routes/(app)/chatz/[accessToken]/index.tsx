import ProfileImg from "../../../../islands/ProfileImg.tsx";
import { define } from "../../../../utils.ts";

export default define.page(
  async function Page({ params }) {
    const result = await fetch(
      `https://api.groupme.com/v3/groups?token=${params.accessToken}&per_page=100&page=1`,
    );

    if (!result.ok) {
      return (
        <h1 class="font-extrabold text-5xl text-red-300">
          Invalid Access Code
        </h1>
      );
    }

    const groupData = await result.json();

    const chatsResult = await fetch(
      `https://api.groupme.com/v3/chats?token=${params.accessToken}&per_page=100&page=1`,
    );
    const chatsData = await chatsResult.json();
    console.dir(groupData, { depth: 3 });

    return (
      <div class="flex w-full text-slate-300 h-full px-2 pt-4">
        <div class="flex flex-col gap-2 p-2">
          <h1 class="font-extrabold text-3xl">
            {groupData.response.length} Groups Found
          </h1>
          {groupData.response.map((group: any) => (
            <a
              href={`/chatz/${params.accessToken}/group/${group.id}`}
              class="flex bg-slate-900/50 rounded-lg w-md gap-2 items-center py-1 px-2"
            >
              <ProfileImg imageUrl={group.image_url} profileName={group.name} />
              <div class="flex flex-col">
                <span class="font-medium">{group.name}</span>
                <p class="text-xs font-normal">{group.description}</p>
              </div>
              <div class="grow" />
              <p class="text-lg font-extrabold font-mono">
                {group.messages.count}
              </p>
            </a>
          ))}
        </div>
        <div class="flex flex-col gap-2 p-2">
          <h1 class="font-extrabold text-3xl">
            {chatsData.response.length} Chats Found
          </h1>
          {chatsData.response.map((chat: any) => (
            <a
              href={`/chatz/${params.accessToken}/chat/${chat.other_user.id}`}
              class="flex bg-slate-900/50 rounded-lg w-md gap-2 items-center py-1 px-2"
            >
              <ProfileImg
                imageUrl={chat.other_user.avatar_url}
                profileName={chat.other_user.name}
              />
              <div class="flex flex-col">
                <span class="font-medium">{chat.other_user.name}</span>
                <p class="text-xs font-normal">{chat.last_message.text}</p>
              </div>
              <div class="grow" />
              <p class="text-lg font-extrabold font-mono">
                {chat.messages_count}
              </p>
            </a>
          ))}
        </div>
      </div>
    );
  },
);
