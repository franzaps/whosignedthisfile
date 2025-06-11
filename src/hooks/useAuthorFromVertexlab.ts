import { useQuery } from '@tanstack/react-query';
import { NPool, NRelay1 } from '@nostrify/nostrify';
import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';

export interface AuthorProfile {
  pubkey: string;
  metadata?: NostrMetadata;
  event?: NostrEvent;
}

/**
 * Fetch author profile from relay.vertexlab.io specifically, with fallback to other relays
 */
export function useAuthorFromVertexlab(pubkey: string | undefined) {
  return useQuery({
    queryKey: ['author-vertexlab', pubkey],
    queryFn: async (c) => {
      if (!pubkey) throw new Error('Pubkey is required');

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      
      // Try relay.vertexlab.io first, then fallback to other relays
      const relaysToTry = [
        'wss://relay.vertexlab.io',
        'wss://relay.nostr.band',
        'wss://relay.damus.io',
        'wss://nos.lol'
      ];

      for (const relayUrl of relaysToTry) {
        
        try {
          // Create a temporary pool for this specific relay
          const pool = new NPool({
            open(url: string) {
              return new NRelay1(url);
            },
            reqRouter(filters) {
              return new Map([[relayUrl, filters]]);
            },
            eventRouter() {
              return [relayUrl];
            },
          });
          
          const queryFilter = {
            kinds: [0],
            authors: [pubkey],
            limit: 10
          };
          
          // Query for kind 0 (metadata) events by this pubkey
          const events = await pool.query([queryFilter], { signal });

          // Clean up the pool
          try {
            await pool.close();
          } catch (error) {
            console.warn('Error closing pool:', error);
          }

          if (events.length > 0) {
            // Get the most recent metadata event
            const latestEvent = events.reduce((latest, current) => 
              current.created_at > latest.created_at ? current : latest
            );

            // Only log for the specific pubkey we're debugging
            if (pubkey.startsWith('0a1b')) {
              console.log(`🔍 Found ${events.length} events for Zapstore on ${relayUrl}`);
              console.log('Latest event content:', latestEvent.content);
            }

            let metadata: NostrMetadata | undefined;
            try {
              if (latestEvent.content.trim()) {
                metadata = JSON.parse(latestEvent.content);
                
                if (pubkey.startsWith('0a1b')) {
                  console.log('🔍 Parsed Zapstore metadata:', metadata);
                }
              } else {
                metadata = undefined;
              }
            } catch (error) {
              console.error('Failed to parse metadata for pubkey:', pubkey, error);
              metadata = undefined;
            }

            return {
              pubkey,
              metadata,
              event: latestEvent
            };
          }
        } catch (error) {
          if (pubkey.startsWith('0a1b')) {
            console.error(`❌ Error querying ${relayUrl} for Zapstore:`, error);
          }
          // Continue to next relay
        }
      }

      // No metadata found on any relay
      if (pubkey.startsWith('0a1b')) {
        console.log('❌ No metadata events found for Zapstore on any relay');
      }
      return { pubkey, metadata: undefined, event: undefined };
    },
    enabled: !!pubkey,
    retry: 1, // Reduce retries since we're trying multiple relays
    staleTime: 300000, // 5 minutes
  });
}