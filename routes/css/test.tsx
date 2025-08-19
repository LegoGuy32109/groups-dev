const stuff = Array.from(
  { length: 40 },
  (_, index) => ({ id: index, text: `${index + 1}`.padStart(2, "0") }),
);
function StuffIHadBefore() {
  return (
    <div class="pl-16">
      <div class="card flex-center">
        <h1>Glad that tailwindcss is working now</h1>
      </div>
      <label class="my-4 block">
        <input
          type="file"
          class="block w-full text-sm text-slate-500
        file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 
        file:py-2 file:font-semibold file:text-violet-700 
        hover:file:bg-violet-100"
        />
      </label>
      <div class="selection:bg-green-400 selection:text-white">
        <p>
          So I started to write this long written instructions Client Task
          right? It included reports such as discharge, admission, even
          paylocity payroll. The biggest issue was how could I highlight this
          text and make the background green? That really was the hardest
          problem to solve.
        </p>
      </div>
      <div class="group max-w-lg mx-auto p-8">
        <details
          class="open:bg-fresh-400 open:ring-1
          open:ring-black/5 open:shadow-lg p-6 rounded-lg"
          open
        >
          <summary class="text-sm leading-6 text-slate-900 font-semibold select-none">
            Why do they call it Ovaltine?
          </summary>
          <summary class="mt-3 text-sm leading-6 text-slate-600">
            <p class="group-has-hover:opacity-0">
              The mug is round. The jar is round. They should call it Roundtine.
            </p>
          </summary>
        </details>
      </div>
      <ul class="my-2 space-y-2">
        {stuff.map((thing) => (
          <li class="p-2 odd:bg-blue-200 first:accent-pink-500 even:bg-yellow-200">
            <label>
              <input
                type="checkbox"
                checked
              />
              {thing.text}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
function SideBarIcon(
  { icon, tooltipText = "tooltip 💡" }: { icon: string; tooltipText?: string },
) {
  return (
    <div class="sidebar-icon group">
      {icon}
      <span class="sidebar-tooltip group-hover:scale-100">
        {tooltipText}
      </span>
    </div>
  );
}
export default function Page() {
  return (
    <div class="flex flex-row">
      <div class="fixed top-0 left-0 h-screen w-16 m-0
        flex flex-col bg-gray-900 text-white shadow-lg">
        <SideBarIcon icon="🫢" tooltipText="shush!" />
        <SideBarIcon icon="🎉" tooltipText="party this way" />
        <SideBarIcon icon="🖌️" tooltipText="Paint™️ your Fears Away" />
        <SideBarIcon icon="😈" tooltipText="hehehehehehehehehehe" />
        <SideBarIcon icon="💬" tooltipText="Chat" />
      </div>
      <StuffIHadBefore />
    </div>
  );
}
