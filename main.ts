import { App, staticFiles } from "fresh";
import { define, type State } from "./utils.ts";
import { Dates } from "./utilities/Dates.ts";

export const app = new App<State>();

app.use(staticFiles());

app.use((ctx) => {
  const { state } = ctx;
  state.today = Dates.getMonthDay();
  return ctx.next();
});

// this is the same as the /api/:name route defined via a file. feel free to delete this!
// app.get("/api2/:name", (ctx) => {
//   const name = ctx.params.name;
//   return new Response(
//     `Hello, ${name.charAt(0).toUpperCase() + name.slice(1)}!`,
//   );
// });

// this can also be defined via a file. feel free to delete this!
const trackUrlMiddleware = define.middleware((ctx) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  return ctx.next();
});
app.use(trackUrlMiddleware);

// Include file-system based routes here
app.fsRoutes();
