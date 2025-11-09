"use client";

import { DataLocation } from "@/lib/api-client";
import { Shield, ExternalLink, Calendar, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { IndividualDeleteButton } from "./IndividualDeleteButton";

interface DataLocationCardProps {
  location: DataLocation;
  onDelete?: (commitmentHash: string) => Promise<void>;
}

export function DataLocationCard({
  location,
  onDelete,
}: DataLocationCardProps) {
  const createdDate = new Date(location.createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });

  return (
    <div
      className={`p-6 rounded-lg border transition-all ${
        location.deleted
          ? "bg-secondary/30 border-border opacity-60"
          : "bg-secondary/50 border-border hover:border-primary hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg mb-1">
            {location.serviceProvider}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {location.dataCategories.map((category, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full"
              >
                <Tag size={12} />
                {category}
              </span>
            ))}
          </div>
        </div>
        {location.deleted ? (
          <span className="text-xs font-semibold text-accent bg-accent/20 px-3 py-1 rounded-full flex-shrink-0">
            DELETED
          </span>
        ) : (
          <span className="text-xs font-semibold text-primary bg-primary/20 px-3 py-1 rounded-full flex-shrink-0">
            ACTIVE
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <Calendar size={14} />
        <span>Created {timeAgo}</span>
      </div>

      {location.deleted ? (
        <div className="space-y-2">
          {location.deletionProofHash && (
            <a
              href={`https://explorer.midnight.network/proof/${location.deletionProofHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Shield size={14} />
              View blockchain proof
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      ) : (
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Hash: {location.commitmentHash.slice(0, 16)}...
          </span>
          {onDelete && (
            <IndividualDeleteButton
              commitmentHash={location.commitmentHash}
              serviceProvider={location.serviceProvider}
              onDelete={onDelete}
            />
          )}
        </div>
      )}
    </div>
  );
}
