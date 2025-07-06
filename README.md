# Cloudflare Worker: Interactive MIDI Sampler

![Sampler Screenshot](https://raw.githubusercontent.com/sashla/sense/main/underconstruction/screenshot.png)

A minimalist Cloudflare Worker to display an interactive synthesizer during maintenance. Just copy the contents of `underconstruction.js` into a new Worker and you're good to go.

- **9 Pads**: Play any chords from your MIDI file (example uses Crystal Waters' "She's Homeless").
- **Browser-Based**: Playback and synthesis happen directly in the browser with no dependencies.
- **Mobile Friendly**: Works on mobile devices.

## Quick Start

1.  Create a new Cloudflare Worker.
2.  Paste the code from `underconstruction.js`.
3.  (Optional) Use your own MIDI file:
    a. Upload your `.mid` file to a service like a CDN, an R2 bucket, or any public web server.
    b. In `underconstruction.js`, update the `MIDI_URL` constant with the link to your file. The default URL is just a nice-sounding example.
    ```js
    const MIDI_URL = 'https://your-midi-file.mid';
    ```
4.  Route your traffic to this worker during maintenance periods:
    ```js
    export default {
      async fetch(request) {
        const handler = new UnderConstructionHandler();
        return handler.handle(request);
      }
    }
    ```

## Local Development

To run this worker locally for development:

```bash
npm install -g @cloudflare/wrangler
wrangler dev --local
```

⚠️ Requires a browser that supports the Web Audio API.
