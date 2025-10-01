import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1"
        />
        {/* Manifest */}
        <link rel="manifest" href="/app.webmanifest" />

        {/* Control the status bar style */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black"
        />
        <meta name="theme-color" content="#1d293d" />

        {/* App title on the home screen */}
        <meta name="apple-mobile-web-app-title" content="E91Students" />

        {/* Home screen icons (different sizes for devices)
        <link rel="apple-touch-icon" href="/e91StudentsLogo_180px.png" />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/e91StudentsLogo_120px.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/e91StudentsLogo_152px.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/e91StudentsLogo_167px.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/e91StudentsLogo_180px.png"
        />
 */}
        <title>E91Students</title>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
