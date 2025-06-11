import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { NRelay1 } from '@nostrify/nostrify';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAppContext } from '@/hooks/useAppContext';

/**
 * Validates if an event is a proper file metadata event (kind 1063 or 3063)
 */
function validateFileMetadataEvent(event: NostrEvent): boolean {
  // Check if it's a file metadata event kind
  if (![1063, 3063].includes(event.kind)) return false;

  // Check for required tags according to NIP-94
  const url = event.tags.find(([name]) => name === 'url')?.[1];
  const x = event.tags.find(([name]) => name === 'x')?.[1];

  // File metadata events require 'url' and 'x' tags
  if (!url || !x) return false;

  // Validate that the x tag contains a valid SHA-256 hash (64 hex characters)
  const hashRegex = /^[a-fA-F0-9]{64}$/;
  if (!hashRegex.test(x)) return false;

  return true;
}

export interface FileMetadataEvent extends NostrEvent {
  kind: 1063 | 3063;
}

/**
 * Query file metadata events by SHA-256 hash across all preset relays in parallel
 */
export function useFileMetadata(hash: string | undefined) {
  const { nostr } = useNostr();
  const { presetRelays } = useAppContext();

  return useQuery({
    queryKey: ['file-metadata', hash],
    queryFn: async (c) => {
      if (!hash) throw new Error('Hash is required');

      // Validate hash format (64 hex characters)
      const hashRegex = /^[a-fA-F0-9]{64}$/;
      if (!hashRegex.test(hash)) {
        throw new Error('Invalid hash format. Expected 64 hex characters.');
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      // Get all relay URLs to query (preset relays + current configured relay)
      const relayUrls = new Set<string>();
      
      // Add preset relays
      if (presetRelays && presetRelays.length > 0) {
        presetRelays.forEach(relay => relayUrls.add(relay.url));
      }
      
      // Fallback to using the main nostr instance if no preset relays
      if (relayUrls.size === 0) {
        const events = await nostr.query([
          {
            kinds: [1063, 3063],
            '#x': [hash],
            limit: 100
          }
        ], { signal });

        // Filter events through validator to ensure they meet requirements
        const validEvents = events.filter(validateFileMetadataEvent) as FileMetadataEvent[];
        return validEvents;
      }

      // Query all relays in parallel
      const queryPromises = Array.from(relayUrls).map(async (url) => {
        try {
          const relay = new NRelay1(url);
          const events = await relay.query([
            {
              kinds: [1063, 3063],
              '#x': [hash],
              limit: 100
            }
          ], { signal });
          
          return events.filter(validateFileMetadataEvent) as FileMetadataEvent[];
        } catch (error) {
          // Log the error but don't fail the entire query if one relay fails
          console.warn(`Failed to query relay ${url}:`, error);
          return [];
        }
      });

      // Wait for all queries to complete
      const allResults = await Promise.allSettled(queryPromises);
      
      // Combine all successful results
      const allEvents: FileMetadataEvent[] = [];
      allResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          allEvents.push(...result.value);
        }
      });

      // Deduplicate events by id (same event might be found on multiple relays)
      const uniqueEventsMap = new Map<string, FileMetadataEvent>();
      allEvents.forEach(event => {
        uniqueEventsMap.set(event.id, event);
      });

      return Array.from(uniqueEventsMap.values());
    },
    enabled: !!hash,
  });
}