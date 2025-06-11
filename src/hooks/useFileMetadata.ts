import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

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
 * Query file metadata events by SHA-256 hash
 */
export function useFileMetadata(hash: string | undefined) {
  const { nostr } = useNostr();

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
      
      // Query for both 1063 and 3063 events with the specified hash
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
    },
    enabled: !!hash,
  });
}