import { PageProps } from "$fresh/server.ts";
import VerticalCounter from "../../../islands/VerticalCounter.tsx";

export default function Page({ params }: PageProps) {
  const group = decodeURIComponent(params.group);
  const count = 0;
  return (
    <div class="p-6 flex flex-col items-center w-full grow">
      <h1 class="text-slate-300 text-4xl mb-8">{group}</h1>
      <VerticalCounter count={count} />
    </div>
  );
}
