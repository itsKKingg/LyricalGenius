"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/media/SearchBar";
import { MediaGrid } from "@/components/media/MediaGrid";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { searchMedia, saveToProject } from "@/lib/mediaService";
import type { MediaAsset } from "@/mocks/mediaMocks";

export default function AestheticsPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSearch = async (
    query: string,
    source: 'pinterest' | 'pexels',
    useMocks: boolean
  ) => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAssets([]);

    try {
      const results = await searchMedia({ query, source, useMocks });
      setAssets(results);

      if (results.length === 0) {
        toast({
          title: "No results",
          description: `No assets found for "${query}" on ${source}.`,
        });
      } else {
        toast({
          title: "Success",
          description: `Found ${results.length} assets from ${source}.`,
          variant: "success",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToProject = async (asset: MediaAsset) => {
    setSavingIds(prev => new Set(prev).add(asset.id));

    try {
      await saveToProject(asset);
      
      toast({
        title: "Success!",
        description: `"${asset.title}" has been added to your project.`,
        variant: "success",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save asset";
      
      if (errorMessage === "Link already in vault") {
        toast({
          title: "Already saved",
          description: `"${asset.title}" is already in your project.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Save failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(asset.id);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Toaster />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Aesthetics Browser
          </h1>
          <p className="text-gray-600 text-lg">
            Discover and save aesthetic video assets for your projects
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching for assets...</p>
              </div>
            </div>
          ) : assets.length > 0 ? (
            <MediaGrid
              assets={assets}
              onAddToProject={handleAddToProject}
              savingIds={savingIds}
            />
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No assets loaded
              </h3>
              <p className="text-gray-500">
                Search for aesthetic assets to get started
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
