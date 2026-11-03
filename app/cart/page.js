"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CartRequestPanel from "@/components/cart/CartRequestPanel";
import { readCartItems, saveCartItems } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TwContainer } from "@/components/site/tw-layout";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(readCartItems());
    setLoaded(true);
  }, []);


  useEffect(() => {
    if (!loaded) return;
    saveCartItems(items);
  }, [items, loaded]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item.price) || 0), 0),
    [items]
  );
  const hasCenterOnlyItems = useMemo(
    () => items.some((item) => item.home_collection === false),
    [items]
  );

  function removeItem(itemId) {
    trackEvent("remove_from_cart", { item_id: itemId }, { pagePath: "/cart" });
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  return (
    <>
      <section className="brochure-bg functional-hero-cover py-10 md:py-14">
        <TwContainer>
          <h1 className="hero-title text-slate-800">
            Your Cart
            <span className="hero-subline text-[var(--sdrc-teal-deep)]">Review Tests and Packages</span>
          </h1>
          <p className="mt-3 text-base text-slate-700 md:text-lg">
            Returning users on this browser will continue to see these selected items.
          </p>
        </TwContainer>
      </section>

      <TwContainer className="py-10">
        {items.length === 0 ? (
          <Card interactive={false} className="p-6">
            <p className="mb-4 text-slate-600">Your cart is empty.</p>
            <Button as={Link} href="/tests">Browse tests and packages</Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            <Card interactive={false} className="p-5">
              <div className="mt-5 flex flex-wrap gap-2">
                <Button as={Link} href="/tests" size="sm">Continue Adding</Button>
                <Button as={Link} href="/packages" variant="outline" size="sm">Browse Packages</Button>
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  size="sm"
                  onClick={() => {
                    trackEvent("clear_cart", { item_count: items.length }, { pagePath: "/cart" });
                    setItems([]);
                  }}
                >
                  Clear Cart
                </Button>
              </div>

              <CartRequestPanel
                cartItems={items}
                subtotal={subtotal}
                hasCenterOnlyItems={hasCenterOnlyItems}
                source="/cart page"
                onRequestSuccess={() => setItems([])}
                onRemoveItem={removeItem}
                onClearCart={() => setItems([])}
              />
            </Card>
          </div>
        )}
      </TwContainer>
    </>
  );
}
