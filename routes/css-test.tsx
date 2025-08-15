const stuff = Array.from(
  { length: 40 },
  (_, index) => ({ id: index, text: `${index + 1}`.padStart(2, "0") }),
);
const elements = stuff.map((thing) => (
  <div
    class="h-12 w-12 gap-4 rounded-full bg-blue-500 flex items-center justify-center
    font-sans font-bold text-slate-200"
    key={thing.text}
  >
    {thing.text}
  </div>
));
export default function Page() {
  return (
    <div class="bg-brand px-[78px] text-[--color-fresh]">
      Dark mode disabled!
    </div>
  );
}
