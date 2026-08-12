// Backend id ile sorgulanıyor (slug endpoint'i yok), ama URL'de SEO/okunabilirlik
// için "{id}-{slug}" formatı kullanılıyor. Bu, id'yi ayıklar.
export function parseIdFromIdSlug(idSlug) {
  const id = Number(String(idSlug).split("-")[0]);
  return Number.isFinite(id) ? id : null;
}
