/**
 * Integration: Export Flow
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import * as storage from '../../services/storage';

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('Export Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('Export with no propositions produces valid JSON with empty array', async () => {
    const user = userEvent.setup();
    renderApp('/');

    // Spy on anchor click to capture exported content
    const clickSpy = vi.fn();
    let capturedHref = '';

    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const el = origCreate('a') as HTMLAnchorElement;
        Object.defineProperty(el, 'click', { value: clickSpy, writable: true });
        Object.defineProperty(el, 'href', {
          get: () => capturedHref,
          set: (v: string) => { capturedHref = v; },
        });
        return el;
      }
      return origCreate(tag);
    });

    await screen.findByText(/Your Propositions/i);
    await user.click(screen.getByRole('button', { name: /export json/i }));

    expect(clickSpy).toHaveBeenCalled();
    // URL.createObjectURL returns 'blob:mock-url' from test-setup.ts
    expect(capturedHref).toBe('blob:mock-url');
  });

  it('Export with mixed-status propositions includes all by default', async () => {
    storage.createProposition('Confirmed claim');
    const p2 = storage.createProposition('Suspended claim');
    storage.updateProposition(p2.id, { status: 'suspended' });
    const p3 = storage.createProposition('Revised claim');
    storage.updateProposition(p3.id, { status: 'revised' });

    let exportedData: { propositions: unknown[] } | null = null;
    const origBlob = globalThis.Blob;
    const BlobSpy = vi.fn().mockImplementation((parts: BlobPart[], opts?: BlobPropertyBag) => {
      if (opts?.type === 'application/json') {
        exportedData = JSON.parse(parts[0] as string);
      }
      return new origBlob(parts, opts);
    });
    vi.stubGlobal('Blob', BlobSpy);

    const user = userEvent.setup();
    renderApp('/');

    await screen.findByText(/Your Propositions/i);
    await user.click(screen.getByRole('button', { name: /export json/i }));

    expect(exportedData).not.toBeNull();
    expect(exportedData!.propositions).toHaveLength(3);

    vi.unstubAllGlobals();
  });

  it('Filtered export only includes matching propositions', async () => {
    storage.createProposition('Untested one');
    const p2 = storage.createProposition('Confirmed one');
    storage.updateProposition(p2.id, {
      status: 'confirmed',
      triage: 'confirmed_intuition',
    });

    let exportedData: { propositions: unknown[] } | null = null;
    const origBlob = globalThis.Blob;
    const BlobSpy = vi.fn().mockImplementation((parts: BlobPart[], opts?: BlobPropertyBag) => {
      if (opts?.type === 'application/json') {
        exportedData = JSON.parse(parts[0] as string);
      }
      return new origBlob(parts, opts);
    });
    vi.stubGlobal('Blob', BlobSpy);

    const user = userEvent.setup();
    renderApp('/');

    await screen.findByText(/Your Propositions/i);

    // Filter to "confirmed" using the select
    await user.selectOptions(screen.getByRole('combobox', { name: /filter by status/i }), 'confirmed');
    // Now export
    await user.click(screen.getByRole('button', { name: /export json/i }));

    expect(exportedData).not.toBeNull();
    expect(exportedData!.propositions).toHaveLength(1);
    expect((exportedData!.propositions[0] as { claim: string }).claim).toBe('Confirmed one');

    vi.unstubAllGlobals();
  });

  it('Exported JSON matches the AppData schema', async () => {
    const p = storage.createProposition('Schema test claim');
    storage.updateProposition(p.id, {
      triage: 'pressure_test',
      evidence: 'Some evidence',
      status: 'confirmed',
    });

    let exportedData: unknown = null;
    const origBlob = globalThis.Blob;
    const BlobSpy = vi.fn().mockImplementation((parts: BlobPart[], opts?: BlobPropertyBag) => {
      if (opts?.type === 'application/json') {
        exportedData = JSON.parse(parts[0] as string);
      }
      return new origBlob(parts, opts);
    });
    vi.stubGlobal('Blob', BlobSpy);

    const user = userEvent.setup();
    renderApp('/');

    await screen.findByText(/Your Propositions/i);
    await user.click(screen.getByRole('button', { name: /export json/i }));

    expect(exportedData).toHaveProperty('propositions');
    const data = exportedData as { propositions: unknown[] };
    expect(Array.isArray(data.propositions)).toBe(true);
    const prop = data.propositions[0] as Record<string, unknown>;
    expect(prop).toHaveProperty('id');
    expect(prop).toHaveProperty('claim');
    expect(prop).toHaveProperty('status');
    expect(prop).toHaveProperty('created_at');
    expect(prop).toHaveProperty('updated_at');

    vi.unstubAllGlobals();
  });

  it('Filename follows propositions-YYYY-MM-DD.json pattern', async () => {
    let capturedDownload = '';
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const el = origCreate('a') as HTMLAnchorElement;
        Object.defineProperty(el, 'click', { value: vi.fn(), writable: true });
        Object.defineProperty(el, 'download', {
          get: () => capturedDownload,
          set: (v: string) => { capturedDownload = v; },
        });
        return el;
      }
      return origCreate(tag);
    });

    const user = userEvent.setup();
    renderApp('/');

    await screen.findByText(/Your Propositions/i);
    await user.click(screen.getByRole('button', { name: /export json/i }));

    expect(capturedDownload).toMatch(/^propositions-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
