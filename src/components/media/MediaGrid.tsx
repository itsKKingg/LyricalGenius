"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "@/mocks/mediaMocks";

interface MediaGridProps {
  assets: MediaAsset[];
  onAddToProject: (asset: MediaAsset) => Promise<void>;
  savingIds: Set<string>;
}

export function MediaGrid({ assets, onAddToProject, savingIds }: MediaGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <AnimatePresence>
        {assets.map((asset) => (
          <motion.div key={asset.id} variants={itemVariants}>
            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div
                  className="relative aspect-[9/16] overflow-hidden bg-gray-100"
                  onMouseEnter={() => setHoveredId(asset.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <img
                    src={asset.thumbnail}
                    alt={asset.title}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-300",
                      hoveredId === asset.id && "scale-105"
                    )}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === asset.id ? 1 : 0 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  >
                    <div className="text-white text-center p-4">
                      <p className="text-sm font-medium mb-2">{asset.title}</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {asset.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-white/20 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {asset.duration && (
                        <p className="text-xs mt-2 opacity-80">
                          {asset.duration}s
                        </p>
                      )}
                    </div>
                  </motion.div>

                  <div className="absolute top-2 right-2">
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        asset.source === "pinterest"
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white"
                      )}
                    >
                      {asset.source}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 truncate">
                    {asset.title}
                  </h3>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onAddToProject(asset)}
                    disabled={savingIds.has(asset.id)}
                  >
                    {savingIds.has(asset.id) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Project
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
