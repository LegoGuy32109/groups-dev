import { PageProps } from "$fresh/server.ts";

export default function Greet(props: PageProps) {
  return (
    <main>
      <p>Hello {decodeURIComponent(props.params.name)}</p>
    </main>
  );
}
