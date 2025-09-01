export default function GroupOverview(
  { group, count }: { group: string; count: number },
) {
  return (
    <div
      class="flex justify-between items-center flex-row 
            py-2 px-3 shadow-lg shadow-sky-900 bg-sky-700 
        even:bg-pink-700 even:shadow-pink-900 rounded-full font-sans text-slate-200
      cursor-pointer hover:scale-105 transition-all"
      onClick={(e) => {
        console.log(e);
        globalThis.location.href = `./attendance/${group}`;
      }}
    >
      <span class="font-semibold text-md sm:text-2xl whitespace-break-spaces mx-2 w-min">
        {group}
      </span>
      <span class="text-3xl sm:text-6xl font-bold font-mono tabular-nums">
        {count}
      </span>
    </div>
  );
}
