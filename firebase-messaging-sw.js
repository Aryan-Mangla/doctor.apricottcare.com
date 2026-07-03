/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDFKDicUPvL5oCvW4JKrF55FRqlvJlJGPA',
  authDomain: 'apricott-2d56b.firebaseapp.com',
  projectId: 'apricott-2d56b',
  storageBucket: 'apricott-2d56b.firebasestorage.app',
  messagingSenderId: '46653454813',
  appId: '1:46653454813:web:64c7e2a73e19364ce59e34',
  measurementId: 'G-C3BYNHRMX8',
})

const messaging = firebase.messaging()
const APP_ORIGIN = self.location.origin
const DEFAULT_ICON = APP_ORIGIN + '/favicon.png'

function showSystemNotification(title, body, data) {
  const tag = data.event || data.type || 'apricott-doctor-' + Date.now()
  const options = {
    body,
    icon: data.icon || DEFAULT_ICON,
    badge: data.badge || DEFAULT_ICON,
    tag,
    renotify: true,
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
    data: { ...data, title, body },
  }
  if (data.image) {
    options.image = data.image
  }
  return self.registration.showNotification(title, options)
}

function resolveTargetUrl(data) {
  const link = data && data.link
  if (!link) {
    return APP_ORIGIN + '/appointments'
  }
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return link
  }
  return APP_ORIGIN + (link.startsWith('/') ? link : '/' + link)
}

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {}
  const title = data.title || 'Apricott Care Doctor'
  const body = data.body || ''
  return showSystemNotification(title, body, data)
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = event.notification.data || {}
  const targetUrl = resolveTargetUrl(data)

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          client.postMessage({ type: 'apricott:doctor-fcm-click', data })
          if ('navigate' in client && data.link) {
            try {
              client.navigate(targetUrl)
            } catch (e) {
              // Some browsers block navigate(); focus is enough.
            }
          }
          return undefined
        }
      }
      return clients.openWindow(targetUrl)
    })
  )
})
