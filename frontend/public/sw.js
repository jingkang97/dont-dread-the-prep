self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.pathname !== '/manifest.webmanifest') return
  const raw = (url.searchParams.get('s') || '').trim().toUpperCase()
  if (!/^[A-Z2-9]{4}$/.test(raw)) return
  event.respondWith(
    fetch('/manifest.webmanifest').then(async (res) => {
      const manifest = await res.json()
      manifest.start_url = `/?s=${encodeURIComponent(raw)}`
      return new Response(JSON.stringify(manifest), {
        headers: { 'Content-Type': 'application/manifest+json' },
      })
    }),
  )
})

self.addEventListener('push', (event) => {
  let data = { title: 'PrepPath', body: '', url: '/' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    /* ignore */
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'PrepPath', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/' },
    }),
  )
})

function destUrl(raw) {
  try {
    const parsed = new URL(raw || '/', self.location.origin)
    return new URL(parsed.pathname + parsed.search + parsed.hash, self.location.origin)
  } catch {
    return new URL('/', self.location.origin)
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const dest = destUrl(event.notification.data && event.notification.data.url)
  const go = dest.searchParams.get('go') || ''
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windows) => {
      for (const client of windows) {
        let origin = ''
        try {
          origin = new URL(client.url).origin
        } catch {
          continue
        }
        if (origin !== dest.origin) continue
        if ('navigate' in client) {
          try {
            await client.navigate(dest.pathname + dest.search + dest.hash)
          } catch {
            /* iOS often blocks navigate; tell the open window which tab to show */
          }
        }
        if ('postMessage' in client) {
          client.postMessage({ type: 'preppath-open', go })
        }
        if ('focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(dest.href)
      return undefined
    }),
  )
})
