import { useParams } from 'react-router-dom';
import { AlertCircle, FileX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RelaySelector } from '@/components/RelaySelector';
import { FileSignatureCard } from '@/components/FileSignatureCard';
import { useFileMetadata } from '@/hooks/useFileMetadata';
import { useSeoMeta } from '@unhead/react';

export function FileVerification() {
  const { hash } = useParams<{ hash: string }>();
  const fileMetadata = useFileMetadata(hash);

  // Validate hash format
  const isValidHash = hash && /^[a-fA-F0-9]{64}$/.test(hash);

  // Set SEO metadata based on the state
  useSeoMeta({
    title: fileMetadata.isLoading
      ? `Verifying File ${hash?.slice(0, 8)}... - Who Signed This File?`
      : fileMetadata.error
        ? 'Error - Who Signed This File?'
        : !fileMetadata.data || fileMetadata.data.length === 0
          ? 'File Not Found - Who Signed This File?'
          : `File Signed by ${Array.from(new Set(fileMetadata.data.map(e => e.pubkey))).length} signer${Array.from(new Set(fileMetadata.data.map(e => e.pubkey))).length === 1 ? '' : 's'} - Who Signed This File?`,
    description: hash
      ? `File ${hash.slice(0, 16)}... verification results on the Nostr network.`
      : 'File verification on the Nostr network.',
  });

  if (!hash) {
    return <InvalidHashPage />;
  }

  if (!isValidHash) {
    return <InvalidHashPage hash={hash} />;
  }

  if (fileMetadata.isLoading) {
    return <FileVerificationLoading hash={hash} />;
  }

  if (fileMetadata.error) {
    return <FileVerificationError hash={hash} error={fileMetadata.error} />;
  }

  if (!fileMetadata.data || fileMetadata.data.length === 0) {
    return <FileNotFound hash={hash} />;
  }

  const events = fileMetadata.data;
  const uniqueSigners = Array.from(new Set(events.map(e => e.pubkey)));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            File Signature Verification
          </h1>
          <div className="text-muted-foreground space-y-1">
            <div className="font-mono text-sm bg-muted px-3 py-1 rounded-md inline-block">
              {hash}
            </div>
            <div className="text-sm">
              Found {events.length} signature{events.length === 1 ? '' : 's'} from {uniqueSigners.length} signer{uniqueSigners.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* File Signature Cards */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <FileSignatureCard key={`${event.id}-${index}`} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InvalidHashPage({ hash }: { hash?: string }) {
  useSeoMeta({
    title: 'Invalid Hash - Who Signed This File?',
    description: 'Invalid file hash format. File hashes must be exactly 64 hexadecimal characters (SHA-256).',
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Invalid Hash Format</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            File hashes must be exactly 64 hexadecimal characters (SHA-256).
          </div>

          {hash && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Provided hash:</div>
              <div className="font-mono text-sm bg-muted p-2 rounded-md break-all">
                {hash}
              </div>
              <div className="text-xs text-muted-foreground">
                Length: {hash.length} characters (expected: 64)
              </div>
            </div>
          )}

          <div className="pt-4">
            <div className="text-sm font-medium mb-2">Example valid hash:</div>
            <div className="font-mono text-xs bg-muted p-2 rounded-md break-all text-muted-foreground">
              a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FileVerificationLoading({ hash }: { hash: string }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-9 w-80 mx-auto" />
          <div className="space-y-2">
            <div className="font-mono text-sm bg-muted px-3 py-1 rounded-md inline-block">
              {hash}
            </div>
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>

        {/* Loading Cards */}
        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  );
}

function FileVerificationError({ hash, error }: { hash: string; error: Error }) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <div className="font-semibold">Error verifying file signature</div>
          <div className="text-sm">{error.message}</div>
          <div className="text-xs text-muted-foreground mt-2">
            Hash: {hash}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function FileNotFound({ hash }: { hash: string }) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <div className="max-w-sm mx-auto space-y-6">
            <div className="flex justify-center">
              <div className="bg-muted rounded-full p-4">
                <FileX className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Signatures Found</h3>
              <p className="text-muted-foreground text-sm">
                No file metadata events found for this hash on the configured relays.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-mono text-xs bg-muted p-2 rounded-md break-all">
                {hash}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Try switching to different relays to search more of the Nostr network:
                </p>
                <RelaySelector className="w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}