import Countdown from "../islands/Countdown.tsx";
export default function Page() {
  const now = new Date();
  now.setSeconds(now.getSeconds() + 100);
  const target = now.toString();
  console.log(target);
  return <Countdown target={target} />;
}
