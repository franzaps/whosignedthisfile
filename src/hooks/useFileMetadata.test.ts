import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { useFileMetadata } from './useFileMetadata';

// Mock the NRelay1 class
vi.mock('@nostrify/nostrify', async () => {
  const actual = await vi.importActual('@nostrify/nostrify');
  return {
    ...actual,
    NRelay1: vi.fn().mockImplementation(() => ({
      query: vi.fn().mockResolvedValue([]),
    })),
  };
});

describe('useFileMetadata', () => {
  it('should be enabled when hash is provided', () => {
    const validHash = 'a'.repeat(64); // 64 hex characters
    
    const { result } = renderHook(
      () => useFileMetadata(validHash),
      { wrapper: TestApp }
    );

    // Should be fetching when a valid hash is provided
    expect(result.current.isFetching || result.current.isPending).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('should be disabled when hash is undefined', () => {
    const { result } = renderHook(
      () => useFileMetadata(undefined),
      { wrapper: TestApp }
    );

    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should validate hash format', async () => {
    const invalidHash = 'invalid-hash';
    
    const { result } = renderHook(
      () => useFileMetadata(invalidHash),
      { wrapper: TestApp }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toContain('Invalid hash format');
  });
});