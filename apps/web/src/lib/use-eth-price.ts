"use client";

import { useState, useEffect } from "react";

interface PriceData {
  ethPrice: number | null;
  isLoading: boolean;
  error: Error | null;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
const CACHE_DURATION = 60_000; // 1 minute cache

let cachedPrice: number | null = null;
let cacheTimestamp = 0;

export function useEthPrice(): PriceData {
  const [ethPrice, setEthPrice] = useState<number | null>(cachedPrice);
  const [isLoading, setIsLoading] = useState(!cachedPrice);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const now = Date.now();
    
    // Return cached price if still valid
    if (cachedPrice && now - cacheTimestamp < CACHE_DURATION) {
      setEthPrice(cachedPrice);
      setIsLoading(false);
      return;
    }

    const fetchPrice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(COINGECKO_API);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ETH price: ${response.status}`);
        }
        
        const data = await response.json();
        const price = data.ethereum?.usd;
        
        if (typeof price === "number") {
          cachedPrice = price;
          cacheTimestamp = Date.now();
          setEthPrice(price);
          setError(null);
        } else {
          throw new Error("Invalid price data received");
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        // Keep using cached price on error if available
        if (cachedPrice) {
          setEthPrice(cachedPrice);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
  }, []);

  return { ethPrice, isLoading, error };
}

