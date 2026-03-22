import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateExport, downloadExport } from './export';
import type { Proposition } from '../types';

function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

function makeProposition(overrides: Partial<Proposition> = {}): Proposition {
  return {
    id: 'test-id',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    claim: 'Test claim',
    triage: null,
    evidence: null,
    steelman: null,
    falsifiability: null,
    status: 'untested',
    revision_note: null,
    resolution_note: null,
    revised_from: null,
    ...overrides,
  };
}

describe('generateExport', () => {
  it('returns blob with correct MIME type (application/json)', () => {
    const { blob } = generateExport([]);
    expect(blob.type).toBe('application/json');
  });

  it('filename matches pattern propositions-YYYY-MM-DD.json', () => {
    const { filename } = generateExport([]);
    expect(filename).toMatch(/^propositions-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('exported JSON contains all propositions when no filter', async () => {
    const propositions = [
      makeProposition({ id: '1', status: 'confirmed' }),
      makeProposition({ id: '2', status: 'untested' }),
    ];
    const { blob } = generateExport(propositions);
    const text = await readBlobText(blob);
    const parsed = JSON.parse(text);
    expect(parsed.propositions).toHaveLength(2);
  });

  it('exported JSON filters by status when option set', async () => {
    const propositions = [
      makeProposition({ id: '1', status: 'confirmed' }),
      makeProposition({ id: '2', status: 'untested' }),
    ];
    const { blob } = generateExport(propositions, { filterStatus: 'confirmed' });
    const text = await readBlobText(blob);
    const parsed = JSON.parse(text);
    expect(parsed.propositions).toHaveLength(1);
    expect(parsed.propositions[0].status).toBe('confirmed');
  });

  it('exported JSON is pretty-printed', async () => {
    const { blob } = generateExport([makeProposition()]);
    const text = await readBlobText(blob);
    expect(text).toContain('\n');
    expect(text).toContain('  ');
  });

  it('empty propositions array produces valid JSON with empty array', async () => {
    const { blob } = generateExport([]);
    const text = await readBlobText(blob);
    const parsed = JSON.parse(text);
    expect(parsed.propositions).toEqual([]);
  });
});

describe('downloadExport', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  it('creates and removes an anchor element', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    const blob = new Blob(['{}'], { type: 'application/json' });
    downloadExport(blob, 'test.json');

    expect(appendSpy).toHaveBeenCalledOnce();
    expect(removeSpy).toHaveBeenCalledOnce();

    const appended = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(appended.tagName).toBe('A');
    expect(appended.download).toBe('test.json');
  });
});
