const IMAGE_CACHE_NAME = "pure-desktop-res";
const BG_LIST_CACHE_NAME = "pure-desktop-bg-list";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (/\.(png|jpg)$/.test(event.request.url)) {
    // 此处策略：只保存当前一张图片的缓存，避免占用过多空间
    // 断网情况下，图片切换也只会显示当前缓存的一张图片

    event.respondWith(
      caches.match(event.request).then((cacheData) => {
        if (cacheData) {
          return cacheData;
        }

        return fetch(event.request)
          .then((response) => {
            return caches.open(IMAGE_CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());

              cache.keys().then((keyList) => {
                Promise.all(
                  keyList.map((key) => {
                    if (key.url != event.request.url) {
                      return cache.delete(key);
                    }
                  })
                );
              });

              return response;
            });
          })
          .catch(() => {
            return caches.open(IMAGE_CACHE_NAME).then((cache) => {
              return cache.keys().then((keyList) => {
                if (keyList.length) {
                  return cache.match(keyList[0]);
                }
              });
            });
          });
      })
    );
  }

  if (/bg-list\.json$/.test(event.request.url)) {
    return event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(BG_LIST_CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});
