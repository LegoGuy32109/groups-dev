import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
const timeFmt = new Intl.RelativeTimeFormat("en-US");
// props to island components must be JSON (de)serializable.
export default function Countdown(props: { target: string }) {
  const target = new Date(props.target);
  const now = useSignal(new Date());
  // update now every second with current date, if component is mounted
  useEffect(() => {
    const timer = setInterval(() => {
      if (now.value > target) {
        clearInterval(timer);
      }
      now.value = new Date();
    }, 1000);
    return () => clearInterval(timer);
  }, [props.target]);
  const secondsLeft = Math.floor(
    (target.getTime() - now.value.getTime()) /
      1000,
  );
  // If the target date has passed, stop countdown
  if (secondsLeft <= 0) {
    return <span>🎉</span>;
  }
  return <span>{timeFmt.format(secondsLeft, "seconds")}</span>;
}
