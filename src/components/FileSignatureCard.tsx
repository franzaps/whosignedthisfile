import { ExternalLink, FileText, Shield, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthorFromVertexlab } from '@/hooks/useAuthorFromVertexlab';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import type { FileMetadataEvent } from '@/hooks/useFileMetadata';
import type { NostrMetadata } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

interface FileSignatureCardProps {
  event: FileMetadataEvent;
}

export function FileSignatureCard({ event }: FileSignatureCardProps) {
  const authorFromVertexlab = useAuthorFromVertexlab(event.pubkey);
  const authorFallback = useAuthor(event.pubkey);
  
  // Use vertexlab data if available, otherwise fallback to regular author hook
  const author = authorFromVertexlab.data?.metadata ? authorFromVertexlab : authorFallback;
  
  // Extract file information from tags
  const url = event.tags.find(([name]) => name === 'url')?.[1];
  const mimeType = event.tags.find(([name]) => name === 'm')?.[1];
  const size = event.tags.find(([name]) => name === 'size')?.[1];
  const fileName = url ? url.split('/').pop() || 'Unknown File' : 'Unknown File';
  const isImage = mimeType?.startsWith('image/') || false;
  
  // Generate npub for external link
  const npub = nip19.npubEncode(event.pubkey);

  // Debug logging for profile issues
  if (event.pubkey && authorFromVertexlab.data?.metadata) {
    console.log('✅ Got metadata from vertex lab for:', event.pubkey.slice(0, 8));
  } else if (authorFallback.data?.metadata) {
    console.log('⚠️ Using fallback profile for:', event.pubkey.slice(0, 8));
  } else {
    console.log('❌ No profile data found for:', event.pubkey.slice(0, 8));
  }

  if (author.isLoading) {
    return <FileSignatureCardSkeleton />;
  }

  if (author.error && !author.data) {
    return <FileSignatureCardError pubkey={event.pubkey} />;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          <CardTitle className="text-lg">File Signature Verified</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            Kind {event.kind}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Information */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">File Information</span>
          </div>
          <div className="pl-6 space-y-1 text-sm text-muted-foreground">
            <div><span className="font-medium">Name:</span> {fileName}</div>
            {mimeType && <div><span className="font-medium">Type:</span> {mimeType}</div>}
            {size && <div><span className="font-medium">Size:</span> {formatFileSize(parseInt(size))}</div>}
          </div>
          
          {/* Show image preview if it's an image */}
          {isImage && url && (
            <div className="pl-6 mt-3">
              <div className="border rounded-md overflow-hidden max-w-md">
                <img 
                  src={url} 
                  alt={fileName}
                  className="w-full h-auto max-h-64 object-contain bg-muted"
                  onError={(e) => {
                    // Hide the image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          
          {url && (
            <div className="pl-6">
              <Button asChild size="sm" variant="outline">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {isImage ? 'View Full Image' : 'Download File'}
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Signer Information */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Signed by</span>
          </div>
          
          <ProfileDisplay author={author.data} pubkey={event.pubkey} />
          
          <div className="pl-6">
            <Button asChild size="sm" variant="outline">
              <a 
                href={`https://npub.world/${npub}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on npub.world
              </a>
            </Button>
          </div>
        </div>

        {/* Event Description */}
        {event.content && (
          <div className="space-y-2">
            <div className="font-medium text-sm">Description</div>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              {event.content}
            </div>
          </div>
        )}
        
        {/* Timestamp */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          Signed on {new Date(event.created_at * 1000).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileDisplay({ author, pubkey }: { 
  author: { metadata?: NostrMetadata } | null | undefined; 
  pubkey: string;
}) {
  // Extract metadata from author data
  const metadata = author?.metadata;
  
  const displayName = metadata?.name || metadata?.display_name || genUserName(pubkey);
  const about = metadata?.about;
  const picture = metadata?.picture;
  const nip05 = metadata?.nip05;
  
  // Only log if we have the specific pubkey we're debugging
  if (pubkey.startsWith('0a1b')) {
    console.log('🔍 Profile for Zapstore pubkey:', {
      pubkey: pubkey.slice(0, 8),
      metadata,
      displayName,
      picture,
      nip05
    });
  }
  
  return (
    <div className="pl-6 flex items-center space-x-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={picture} alt={displayName} />
        <AvatarFallback>
          {displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{displayName}</div>
        {nip05 && (
          <div className="text-xs text-muted-foreground truncate">{nip05}</div>
        )}
        {about && (
          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {about}
          </div>
        )}

      </div>
    </div>
  );
}

function FileSignatureCardSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-16 ml-auto" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="pl-6 space-y-2">
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          
          <div className="pl-6 flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FileSignatureCardError({ pubkey }: { pubkey: string }) {
  const displayName = genUserName(pubkey);
  const npub = nip19.npubEncode(pubkey);
  
  return (
    <Card className="w-full max-w-2xl mx-auto border-destructive/50">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3 text-destructive">
          <User className="h-5 w-5" />
          <span className="font-medium">Profile not found on relay.vertexlab.io</span>
        </div>
        
        <div className="mt-4 pl-8 space-y-2">
          <div className="text-sm">
            <span className="font-medium">Pubkey:</span> {displayName}
          </div>
          
          <Button asChild size="sm" variant="outline">
            <a 
              href={`https://npub.world/${npub}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View on npub.world
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}