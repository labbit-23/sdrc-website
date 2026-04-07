function toNumberOrMax(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

export function sortPackages(packages = []) {
  return [...packages].sort((a, b) => {
    const promoA = a?.is_promoted ? 1 : 0;
    const promoB = b?.is_promoted ? 1 : 0;
    if (promoA !== promoB) return promoB - promoA;

    const orderA = toNumberOrMax(a?.display_order);
    const orderB = toNumberOrMax(b?.display_order);
    if (orderA !== orderB) return orderA - orderB;

    return String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}

export function sortPackageVariants(variants = []) {
  return [...variants].sort((a, b) => {
    const promoA = a?.is_promoted ? 1 : 0;
    const promoB = b?.is_promoted ? 1 : 0;
    if (promoA !== promoB) return promoB - promoA;

    const orderA = toNumberOrMax(a?.display_order);
    const orderB = toNumberOrMax(b?.display_order);
    if (orderA !== orderB) return orderA - orderB;

    const priceA = Number(a?.price ?? Number.MAX_SAFE_INTEGER);
    const priceB = Number(b?.price ?? Number.MAX_SAFE_INTEGER);
    if (priceA !== priceB) return priceA - priceB;

    return String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}
