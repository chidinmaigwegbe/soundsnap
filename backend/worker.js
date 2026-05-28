import { Container, getContainer } from "@cloudflare/containers";

export class SoundSnapContainer extends Container {
  defaultPort = 3001; // Port the container is listening on
  sleepAfter = "10m"; // Stop instance if no requests for 10 minutes
}

export default {
  async fetch(request, env) {
    try {
      // Get container instance
      const containerInstance = getContainer(env.SOUNDSNAP_CONTAINER, "soundsnap-api");
      
      // Pass request to container
      return await containerInstance.fetch(request);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Container temporarily unavailable'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
