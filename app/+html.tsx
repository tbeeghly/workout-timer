import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Custom <html> wrapper used by Expo Router during static export.
 * Injects PWA manifest, theme color, and apple-touch icons so the site is
 * installable from Chrome / iOS Add to Home Screen with the stopwatch icon.
 *
 * Hrefs are written relative to the document so the configured `baseUrl`
 * (`/workout-timer/` on GitHub Pages) is respected automatically.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <title>Workout Timer</title>
        <meta
          name="description"
          content="Interval workout timer with prep, work, rest and round rest cues."
        />

        {/* PWA */}
        <link rel="manifest" href="manifest.webmanifest" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="application-name" content="Workout Timer" />

        {/* iOS add-to-home-screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Timer" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <link rel="apple-touch-icon" href="icons/apple-touch-icon.png" />

        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="favicon-16.png" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: bodyBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const bodyBackground = `
body { background-color: #FFFFFF; }
@media (prefers-color-scheme: dark) {
  body { background-color: #000000; }
}
`;
