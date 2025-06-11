import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, FileText, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSeoMeta } from '@unhead/react';

export function Index() {
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useSeoMeta({
    title: 'Who Signed This File? - Verify File Authenticity',
    description: 'Verify file authenticity and discover who signed your files on the Nostr network. Search by SHA-256 hash to find file metadata and signatures.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hash.trim()) {
      setError('Please enter a file hash');
      return;
    }

    const cleanHash = hash.trim();
    const hashRegex = /^[a-fA-F0-9]{64}$/;

    if (!hashRegex.test(cleanHash)) {
      setError('Hash must be exactly 64 hexadecimal characters (SHA-256)');
      return;
    }

    setError('');
    navigate(`/${cleanHash}`);
  };

  const handleHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHash(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 rounded-full p-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Who Signed This File?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verify file authenticity and discover who signed your files on the decentralized Nostr network.
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Verify File Signature</span>
            </CardTitle>
            <CardDescription>
              Enter a SHA-256 hash to find file metadata and signatures on Nostr
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-hash">File Hash (SHA-256)</Label>
                <Input
                  id="file-hash"
                  type="text"
                  placeholder="a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
                  value={hash}
                  onChange={handleHashChange}
                  className="font-mono text-sm"
                  maxLength={64}
                />
                <div className="text-xs text-muted-foreground">
                  Must be exactly 64 hexadecimal characters
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Verify File Signature
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>File Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Discover file information including name, type, size, and download links using NIP-94 file metadata events.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Cryptographic Proof</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verify file signatures using cryptographic proof from Nostr identities, ensuring authenticity and integrity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Identity Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View detailed signer profiles with links to external verification, helping you trust file sources.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle>How it Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">1. File Metadata Events</h4>
                <p className="text-sm text-muted-foreground">
                  Files are published to Nostr using kind 1063 and 3063 events containing metadata like hash, URL, MIME type, and size.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Cryptographic Signatures</h4>
                <p className="text-sm text-muted-foreground">
                  Each event is cryptographically signed by a Nostr identity, providing proof of who published the file metadata.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Decentralized Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Search across multiple Nostr relays to find all signatures for a file hash, ensuring comprehensive verification.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Identity Lookup</h4>
                <p className="text-sm text-muted-foreground">
                  Signer profiles are fetched from relay.vertexlab.io to display names, avatars, and verification information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Vibed with{" "}
            <Button variant="link" className="p-0 h-auto font-normal" asChild>
              <a href="https://soapbox.pub/tools/mkstack/" target="_blank" rel="noopener noreferrer">
                MKStack
              </a>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Index;