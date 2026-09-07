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

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const raw = event.notification.data && event.notification.data.url
  const url = raw || '/'
  event.waitUntil(clients.openWindow(url))
})
