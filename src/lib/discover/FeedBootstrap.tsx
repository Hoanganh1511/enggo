"use client";
import { useEffect } from "react";
import { ensureFeedLoaded } from "@/lib/discover/feed-store";

const FeedBootstrap = () => {
  useEffect(() => {
    void ensureFeedLoaded();
  }, []);
  return null;
};

export default FeedBootstrap;
