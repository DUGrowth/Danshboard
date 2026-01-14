"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Quote {
  id: number;
  quote_text: string;
  author: string;
  tags: string;
}

export default function StoicQuoteCard() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    setIsLoading(true);
    setIsFavorited(false);
    try {
      const res = await fetch("/api/quotes");
      const data = await res.json();
      setQuote(data);
    } catch (error) {
      console.error("Failed to load quote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!quote || isFavorited) return;

    try {
      await fetch("/api/quotes/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: quote.id }),
      });

      setIsFavorited(true);
      toast.success("Quote favorited!");
    } catch (error) {
      toast.error("Failed to favorite quote");
    }
  };

  if (isLoading || !quote) {
    return <div className="animate-pulse h-48 bg-card rounded-lg" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-gradient-to-br from-card to-card/50"
    >
      <div className="mb-4">
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg italic leading-relaxed mb-4"
        >
          &quot;{quote.quote_text}&quot;
        </motion.blockquote>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-right text-muted-foreground"
        >
          — {quote.author}
        </motion.div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleFavorite}
          variant={isFavorited ? "default" : "outline"}
          size="sm"
          disabled={isFavorited}
        >
          <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
          {isFavorited ? "Favorited" : "Favorite"}
        </Button>
        <Button
          onClick={loadQuote}
          variant="ghost"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Next Quote
        </Button>
      </div>
    </motion.div>
  );
}
