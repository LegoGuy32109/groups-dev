export default function ProfileImg(
  { imageUrl, profileName }: { imageUrl?: string; profileName: string },
) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        onClick={() => {
          console.log("hey");
          globalThis.open(imageUrl, "_blank", "noopener,noreferrer");
        }}
        class="cursor-pointer min-w-10 max-w-10"
      />
    );
  }
  return (
    <div class="rounded-xl bg-slate-400 min-w-10 max-w-10 h-10 font-black flex items-center justify-center">
      {profileName.split(" ").map((word) => word.at(0)?.toUpperCase()).slice(
        0,
        2,
      )}
    </div>
  );
}
