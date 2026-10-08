// Runs in front of the static assets: canonicalise www.edgeless.me to the
// apex domain, then hand every other request to the asset server.
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4)
      return Response.redirect(url.toString(), 301)
    }
    return env.ASSETS.fetch(request)
  }
}
