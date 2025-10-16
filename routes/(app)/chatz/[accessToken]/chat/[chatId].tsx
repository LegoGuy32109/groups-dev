import Conditional from "../../../../../components/Conditional.tsx";
import ProfileImg from "../../../../../islands/ProfileImg.tsx";
import { Dates } from "../../../../../utilities/Dates.ts";
import { define } from "../../../../../utils.ts";

export default define.page(
  async function Page({ req, params }) {
    const beforeMessageId = new URL(req.url).searchParams.get("before_id");
    const chatsResult = await fetch(
      `https://api.groupme.com/v3/direct_messages?token=${params.accessToken}&other_user_id=${params.chatId}&limit=100${
        beforeMessageId ? `&before_id=${beforeMessageId}` : ""
      }`,
    );
    console.log(chatsResult);

    if (!chatsResult.ok) {
      return (
        <h1 class="font-extrabold text-5xl text-red-300">
          Error Accessing Chat
        </h1>
      );
    }

    const data = await chatsResult.json();

    return (
      <div class="flex w-full text-slate-300 h-full px-2 pt-4">
        <div class="flex flex-col gap-2 p-2">
          <h1 class="font-extrabold text-3xl">
            <a
              href={`/chatz/${params.accessToken}`}
              class="bg-slate-900/50 p-1 m-1 rounded-xl"
            >
              ⬅️
            </a>{" "}
            {data.response.count} Messages Found
          </h1>
          {data.response.direct_messages.map((
            message: any,
            index: number,
            messages: Array<any>,
          ) => (
            <div class="flex flex-col bg-slate-900/50 rounded-lg w-lg">
              <div class="flex gap-2 items-center py-1 px-2">
                <ProfileImg
                  imageUrl={message.avatar_url}
                  profileName={message.name}
                />
                <div class="flex flex-col">
                  <span class="text-xs font-medium">{message.name}</span>
                  <p class="text-md font-normal">{message.text}</p>
                </div>
                <div class="grow" />
                <p class="text-sm">
                  {Dates.fromGroupmeTemporal(message.created_at)
                    .toLocaleString()}
                </p>
              </div>
              {message.reactions?.map((reaction: any) => (
                <p class="m-1 p-1 bg-blue-800/30 rounded-full max-w-10">
                  {reaction.user_ids.length}
                  {reaction.code}
                </p>
              ))}
              <Conditional visible={message.attachments.length > 0}>
                <details class="mx-3 bg-amber-700/10">
                  <summary>
                    📄 {message.attachments.length}{" "}
                    Attachment{message.attachments.length > 1 && "s"}
                  </summary>
                  {message.attachments.map((attachment: any, index: number) => {
                    if (attachment["type"] === "image") {
                      return (
                        <img
                          key={index}
                          class="m-2 p-1 w-sm"
                          src={attachment.url}
                        />
                      );
                    }
                    return (
                      <code key={index}>
                        {JSON.stringify(attachment, undefined, 2)}
                      </code>
                    );
                  })}
                </details>
              </Conditional>
              <Conditional visible={index === messages.length - 1}>
                <a
                  href={`/chatz/${params.accessToken}/chat/${params.chatId}?before_id=${message.id}`}
                  class="fixed bottom-2 right-2 m-1 p-2 bg-blue-800/30 rounded-full"
                >
                  {messages.length} Next Page ➡️
                </a>
              </Conditional>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
