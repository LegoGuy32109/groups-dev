import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import IndexedDbAccess from "../../islands/IndexedDbAccess.tsx";

export default define.page(
  function Page() {
    return (
      <>
        <Head>
          <title>IndexedDB Test</title>
        </Head>
        <div class="text-3xl font-semibold bg-linear-to-bl from-bg-amber-800 to-fuchsia-950 w-full h-full flex items-center justify-center">
          <IndexedDbAccess />
        </div>
      </>
    );
  },
);
