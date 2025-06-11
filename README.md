# Who Signed This File?

A web application to verify file authenticity and discover who signed your files on the decentralized Nostr network.

## Features

- **File Signature Verification**: Enter a SHA-256 hash to find file metadata and signatures on Nostr
- **Cryptographic Proof**: Verify file signatures using cryptographic proof from Nostr identities
- **Identity Verification**: View detailed signer profiles with links to external verification
- **Multi-Relay Search**: Configurable relay connections to search across the Nostr network
- **Modern UI**: Clean, responsive interface built with React and TailwindCSS

## How It Works

1. **File Metadata Events**: Files are published to Nostr using kind 1063 and 3063 events containing metadata like hash, URL, MIME type, and size
2. **Cryptographic Signatures**: Each event is cryptographically signed by a Nostr identity, providing proof of who published the file metadata
3. **Decentralized Verification**: Search across multiple Nostr relays to find all signatures for a file hash
4. **Identity Lookup**: Signer profiles are fetched from relay.vertexlab.io to display names, avatars, and verification information

## Usage

1. Visit the homepage
2. Enter a 64-character SHA-256 hash in the search form
3. View the results showing:
   - File information (name, type, size, download link)
   - Signer profiles with avatars and verification links
   - Cryptographic proof of authenticity

## Technology Stack

- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Nostrify** for Nostr protocol integration
- **Vite** for build tooling
- **shadcn/ui** components

## Nostr Protocol Integration

This application implements:
- **NIP-94**: File Metadata events (kind 1063)
- **Kind 3063**: Extension of file metadata events
- **NIP-19**: Nostr address encoding/decoding
- **Multi-relay querying** for comprehensive file verification

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Deployment

The application is configured for deployment on Vercel with automatic builds and deployments.

---

*Vibed with [MKStack](https://soapbox.pub/tools/mkstack/)*