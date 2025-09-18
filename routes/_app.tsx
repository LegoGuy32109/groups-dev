import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1"
        />
        {/* Manifest */}
        <link rel="manifest" href="/app.webmanifest" />

        {/* Make it behave like an installable app */}
        <meta name="NVMmobile-web-app-capable" content="yes" />
        {/* Control the status bar style */}
        <meta
          name="NVMapple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        {/* App title on the home screen */}
        <meta name="NVMapple-mobile-web-app-title" content="E91Students" />

        {/* Home screen icons (different sizes for devices) */}
        <link rel="apple-touch-icon" href="/static/e91StudentsLog_180px.png" />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/e91StudentsLog_120px.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/e91StudentsLog_152px.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/e91StudentsLog_167px.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/e91StudentsLog_180px.png"
        />

        <title>E91Students</title>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
