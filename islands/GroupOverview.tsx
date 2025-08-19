export default function GroupOverview(
  { group, count }: { group: string; count: number },
) {
  return (
    <div
      class="flex justify-between items-center flex-row 
            py-2 px-3 shadow-lg shadow-sky-900 bg-sky-700 
        even:bg-pink-700 even:shadow-pink-900 rounded-full font-sans text-slate-200
      cursor-pointer"
      onClick={(e) => {
        console.log(e);
        globalThis.location.href = `./attendance/${group}`;
      }}
    >
      <span class="font-semibold text-lg sm:text-2xl whitespace-break-spaces w-min">
        {group}
      </span>
      <span class="text-3xl sm:text-6xl font-bold">{count}</span>
    </div>
  );
}
