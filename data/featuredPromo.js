import promos from './promos.json';
import config from './promoConfig.json';

// Returns the configured active promo, or falls back to the latest available promo.
export function getCurrentPromo() {
  const { promos: promoList } = promos;
  if (!promoList || promoList.length === 0) return null;

  const active = promoList.find(p => p.id === config.activePromoId);
  return active ?? promoList[promoList.length - 1];
}
