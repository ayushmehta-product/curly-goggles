'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { SelectableCard } from '@/components/ui/SelectableCard';
import {
  MAX_VARIANTS,
  areAllVariantsConnected,
  attachMappingsToNewVariant,
  defaultVariantName,
  duplicateVariant,
  emptyVariant,
  isVariantConnected,
  type FigmaLinkState,
  type SaasLinkState,
  type UsabilityCreateDraft,
  type UsabilitySurface,
  type UsabilityVariantDraft,
  type WebsiteLinkState,
} from '@/data/usability-create-storage';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuCheckbox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCheckbox })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
const WuCopyToClipboard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCopyToClipboard })),
  { ssr: false }
);

interface LinksStepProps {
  draft: UsabilityCreateDraft;
  fetchingVariantId: string | null;
  onDraftChange: (patch: Partial<UsabilityCreateDraft>) => void;
  onVerify: (variantId: string) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const SURFACE_OPTIONS: { value: UsabilitySurface; title: string; description: string; icon: ReactNode }[] = [
  {
    value: 'website',
    title: 'Website',
    description: 'A live public or marketing site — no login required',
    icon: <span className="wm-language text-xl" />,
  },
  {
    value: 'saas',
    title: 'SaaS product',
    description: 'An authenticated app or dashboard',
    icon: <span className="wm-deployed-code text-xl" />,
  },
  {
    value: 'figma',
    title: 'Figma prototype',
    description: 'A clickable design file — no snippet required',
    icon: <span className="wm-gesture text-xl" />,
  },
];

const ENV_OPTIONS = [
  { value: 'Staging', label: 'Staging' },
  { value: 'Production', label: 'Production' },
];

const FIGMA_FILES = [
  'Greater Midland Community — Onboarding v4',
  'Greater Midland Community — Onboarding v5',
  'Checkout Redesign 2026',
  'Mobile Nav Exploration',
];

const FIGMA_FILE_OPTIONS = FIGMA_FILES.map((file) => ({ value: file, label: file }));

function SnippetBlock({ studySlug, env }: { studySlug?: string; env?: string }) {
  const slug = studySlug ?? 'your-study-id';
  const lines = [
    '<script',
    '  src="https://track.questionpro.com/ux.js"',
    `  data-study="${slug}"`,
    ...(env ? [`  data-env="${env.toLowerCase()}"`] : []),
    '  async',
    '></script>',
  ].join('\n');

  return (
    <div className="overflow-hidden rounded-lg bg-[#12192B]">
      <div className="flex items-center justify-between bg-[#0D1322] px-3 py-2">
        <span className="text-xs text-gray-400">snippet.html</span>
        <WuCopyToClipboard textToCopy={lines} />
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[12.5px] text-[#C7D3EE]">{lines}</pre>
    </div>
  );
}

function InfoCallout({ tone, children }: { tone?: 'info' | 'amber'; children: React.ReactNode }) {
  const styles = tone === 'amber'
    ? 'bg-amber-50 text-amber-800 border-amber-100'
    : 'bg-blue-50 text-blue-800 border-blue-100';
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-5 ${styles}`}>
      <span className={`mt-0.5 shrink-0 ${tone === 'amber' ? 'wm-warning' : 'wm-info'} text-sm`} />
      <span>{children}</span>
    </div>
  );
}

function VerifyRow({
  verified,
  disabled,
  busy,
  label,
  busyLabel,
  successLabel,
  onVerify,
}: {
  verified: boolean;
  disabled: boolean;
  busy: boolean;
  label: string;
  busyLabel: string;
  successLabel: string;
  onVerify: () => void;
}) {
  if (verified) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-green-700">
        <span className="wm-check-circle text-base" />
        {successLabel}
      </div>
    );
  }
  return (
    <WuButton
      variant="secondary"
      size="sm"
      disabled={disabled || busy}
      Icon={<span className="wm-refresh" />}
      onClick={onVerify}
      className="mt-2"
    >
      {busy ? busyLabel : label}
    </WuButton>
  );
}

function WebsitePanel({
  state,
  setState,
  fetchingPages,
  onVerify,
}: {
  state: WebsiteLinkState;
  setState: (s: WebsiteLinkState) => void;
  fetchingPages: boolean;
  onVerify: () => void;
}) {
  return (
    <div className="space-y-4">
      <WuInput
        Label="Website URL"
        variant="outlined"
        placeholder="https://yourproduct.com"
        value={state.url}
        onChange={(e) => setState({ ...state, url: e.target.value, verified: false })}
      />

      <label className="flex cursor-pointer items-start gap-2">
        <WuCheckbox
          checked={state.recordingOnly}
          onChange={(checked) => setState({ ...state, recordingOnly: checked, verified: false })}
        />
        <span className="text-sm text-gray-700">
          I can&apos;t add code to this site — use screen recording only
        </span>
      </label>

      {!state.recordingOnly && (
        <>
          <SnippetBlock />
          <p className="text-xs text-gray-500">
            Paste this before <code>&lt;/head&gt;</code> on every page you want to observe. The snippet identifies the study only.
          </p>
          <InfoCallout>
            Testers are randomly assigned to one design when they start — not by this snippet.
          </InfoCallout>
        </>
      )}

      {state.recordingOnly && (
        <InfoCallout tone="amber">
          Recording-only: we still list pages from this URL so you can define start and success. Heatmaps and click paths will not be available.
        </InfoCallout>
      )}

      <VerifyRow
        verified={state.verified}
        disabled={!state.url}
        busy={fetchingPages}
        label={state.recordingOnly ? 'Confirm URL and list pages' : 'Verify and list pages'}
        busyLabel="Listing pages…"
        successLabel={state.recordingOnly ? `Ready to record ${state.url}` : `Connected ${state.url}`}
        onVerify={onVerify}
      />
    </div>
  );
}

function SaasPanel({
  state,
  setState,
  fetchingPages,
  onVerify,
}: {
  state: SaasLinkState;
  setState: (s: SaasLinkState) => void;
  fetchingPages: boolean;
  onVerify: () => void;
}) {
  const envOption = ENV_OPTIONS.find((o) => o.value === state.environment) ?? ENV_OPTIONS[0];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <WuInput
          Label="App URL"
          variant="outlined"
          placeholder="https://app.yourproduct.com"
          value={state.url}
          onChange={(e) => setState({ ...state, url: e.target.value, verified: false })}
        />
        <WuSelect
          Label="Environment"
          data={ENV_OPTIONS}
          accessorKey={{ value: 'value', label: 'label' }}
          value={envOption}
          onSelect={(v) => {
            const sel = v as { value: string; label: string };
            setState({ ...state, environment: sel.value, verified: false });
          }}
          variant="outlined"
        />
      </div>

      <SnippetBlock env={state.environment} />
      <p className="text-xs text-gray-500">Add to your app shell so it survives client-side routing. The snippet identifies the study only.</p>
      <InfoCallout>
        Testers are randomly assigned to one design when they start — not by this snippet.
      </InfoCallout>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <WuInput
          Label="Test account email"
          variant="outlined"
          placeholder="tester@yourproduct.com"
          value={state.email}
          onChange={(e) => setState({ ...state, email: e.target.value })}
        />
        <WuInput
          Label="Test account password"
          variant="outlined"
          type="password"
          placeholder="••••••••"
        />
      </div>
      <p className="text-xs text-gray-500">Shared only with matched testers once the test is live.</p>

      <VerifyRow
        verified={state.verified}
        disabled={!state.url || !state.email}
        busy={fetchingPages}
        label="Verify and list pages"
        busyLabel="Listing pages…"
        successLabel={`Connected ${state.url} (${state.environment})`}
        onVerify={onVerify}
      />
    </div>
  );
}

function FigmaPanel({ state, setState }: { state: FigmaLinkState; setState: (s: FigmaLinkState) => void }) {
  const fileOption = FIGMA_FILE_OPTIONS.find((o) => o.value === state.file) ?? null;

  return (
    <div className="space-y-4">
      {!state.connected ? (
        <WuButton
          variant="secondary"
          Icon={<span className="wm-link" />}
          onClick={() => setState({ ...state, connected: true })}
        >
          Connect Figma account
        </WuButton>
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <span className="wm-check-circle text-sm text-green-600" />
            <span className="text-sm text-green-800">
              Connected as <strong>you@company.com</strong>
            </span>
            <button
              type="button"
              className="ml-auto text-xs font-medium text-blue-600 hover:underline"
              onClick={() => setState({ connected: false, file: '', trackInteractive: true })}
            >
              Disconnect
            </button>
          </div>

          <WuSelect
            Label="Prototype file"
            data={FIGMA_FILE_OPTIONS}
            accessorKey={{ value: 'value', label: 'label' }}
            value={fileOption}
            onSelect={(v) => setState({ ...state, file: (v as { value: string }).value })}
            variant="outlined"
          />

          <label className="flex cursor-pointer items-start gap-2">
            <WuCheckbox
              checked={state.trackInteractive}
              onChange={(checked) => setState({ ...state, trackInteractive: checked })}
            />
            <span className="text-sm text-gray-700">Track interactive components (toggles, variant swaps)</span>
          </label>
        </>
      )}
    </div>
  );
}

function SummaryRow({ label, value, pill }: { label: string; value: string; pill?: 'green' | 'gray' }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      {pill ? (
        pill === 'green'
          ? <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">{value}</span>
          : <WuChip variant="secondary" size="sm">{value}</WuChip>
      ) : (
        <span className="max-w-[160px] truncate text-right text-xs font-semibold text-gray-800">{value}</span>
      )}
    </div>
  );
}

const SURFACE_LABELS: Record<UsabilitySurface, string> = {
  website: 'Website',
  saas: 'SaaS product',
  figma: 'Figma prototype',
};

const RESEARCH_RECS: Record<UsabilitySurface, string> = {
  website: 'Write tasks as goals, not clicks. After you list pages, mark an observable success — reaching a page, a section, or a named control.',
  saas: 'Authenticated flows often hide the success screen behind login. Pair page-based success with a live session so you can see why people divert.',
  figma: 'Prototype frames are not live pages. Use “Participant marks done” as success, and review the recording to judge whether they actually finished.',
};

function connectionLabel(surface: UsabilitySurface | null, variant: UsabilityVariantDraft): string {
  if (surface === 'website') return variant.website.url || 'No URL';
  if (surface === 'saas') return variant.saas.url || 'No URL';
  if (surface === 'figma') return variant.figma.file || 'No file';
  return 'Not connected';
}

function nextVariantId(existing: UsabilityVariantDraft[]): string {
  return `variant-${Date.now()}-${existing.length + 1}`;
}

export function LinksStep({
  draft,
  fetchingVariantId,
  onDraftChange,
  onVerify,
  onBack,
  onSaveDraft,
  onContinue,
}: LinksStepProps) {
  const surface = draft.surface;
  const trackingReady = areAllVariantsConnected(draft);
  const surfaceLabel = surface ? SURFACE_LABELS[surface] : 'Not selected';
  const connectedCount = draft.variants.filter((variant) => isVariantConnected(surface, variant)).length;

  function patchVariant(id: string, patch: Partial<UsabilityVariantDraft>) {
    onDraftChange({
      variants: draft.variants.map((variant) => (variant.id === id ? { ...variant, ...patch } : variant)),
    });
  }

  function addVariant() {
    if (draft.variants.length >= MAX_VARIANTS) return;
    const source = draft.variants[0] ?? emptyVariant('variant-a', 'Variant A');
    const id = nextVariantId(draft.variants);
    const name = defaultVariantName(draft.variants.length);
    const created = duplicateVariant(source, id, name);
    onDraftChange({
      variants: [...draft.variants, created],
      tasks: attachMappingsToNewVariant(draft.tasks, source.id, id),
    });
  }

  function removeVariant(id: string) {
    if (draft.variants.length <= 1) return;
    onDraftChange({
      variants: draft.variants.filter((variant) => variant.id !== id),
      tasks: draft.tasks.map((task) => {
        const mappings = { ...task.mappings };
        delete mappings[id];
        return { ...task, mappings };
      }),
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Links</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose what you are testing. Add a design variant for each URL or file you want people to try.
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">What are you testing?</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SURFACE_OPTIONS.map((opt) => (
                <SelectableCard
                  key={opt.value}
                  title={opt.title}
                  description={opt.description}
                  icon={opt.icon}
                  isSelected={surface === opt.value}
                  onClick={() => onDraftChange({ surface: opt.value })}
                />
              ))}
            </div>
          </div>

          {surface && (
            <div className="space-y-4">
              {draft.variants.map((variant, index) => (
                <div key={variant.id} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <span className="wm-layers text-base" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {draft.variants.length > 1 ? `Design variant ${index + 1}` : 'Connect this design'}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Researcher-only name. Testers will not see this label.
                      </p>
                    </div>
                    {draft.variants.length > 1 && (
                      <WuButton
                        variant="iconOnly"
                        size="sm"
                        color="error"
                        aria-label={`Remove ${variant.name}`}
                        Icon={<span className="wm-delete text-sm" />}
                        onClick={() => removeVariant(variant.id)}
                      />
                    )}
                  </div>

                  <WuInput
                    Label="Variant name"
                    variant="outlined"
                    placeholder={defaultVariantName(index)}
                    value={variant.name}
                    onChange={(e) => patchVariant(variant.id, { name: e.target.value })}
                  />

                  {surface === 'website' && (
                    <WebsitePanel
                      state={variant.website}
                      setState={(website) => {
                        const urlChanged = website.url !== variant.website.url;
                        patchVariant(variant.id, {
                          website,
                          ...(urlChanged ? { pages: [], fetchError: null, fetchBlocked: false } : {}),
                        });
                      }}
                      fetchingPages={fetchingVariantId === variant.id}
                      onVerify={() => onVerify(variant.id)}
                    />
                  )}
                  {surface === 'saas' && (
                    <SaasPanel
                      state={variant.saas}
                      setState={(saas) => {
                        const urlChanged = saas.url !== variant.saas.url;
                        patchVariant(variant.id, {
                          saas,
                          ...(urlChanged ? { pages: [], fetchError: null, fetchBlocked: false } : {}),
                        });
                      }}
                      fetchingPages={fetchingVariantId === variant.id}
                      onVerify={() => onVerify(variant.id)}
                    />
                  )}
                  {surface === 'figma' && (
                    <FigmaPanel
                      state={variant.figma}
                      setState={(figma) => patchVariant(variant.id, { figma })}
                    />
                  )}

                  {variant.pages.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {variant.pages.length} page{variant.pages.length === 1 ? '' : 's'} listed for this design.
                    </p>
                  )}
                </div>
              ))}

              <WuButton
                variant="secondary"
                Icon={<span className="wm-add" />}
                disabled={draft.variants.length >= MAX_VARIANTS}
                onClick={addVariant}
              >
                Add variant
              </WuButton>
              {draft.variants.length >= MAX_VARIANTS && (
                <p className="text-xs text-gray-500">You can compare up to {MAX_VARIANTS} designs in one test.</p>
              )}
            </div>
          )}

          {!surface && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
              Select a testing surface above to see setup options.
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
          <WuButton variant="secondary" onClick={onBack}>Back</WuButton>
          <div className="flex items-center gap-2">
            <WuButton variant="secondary" onClick={onSaveDraft}>Save draft</WuButton>
            <WuButton
              Icon={<span className="wm-arrow-forward" />}
              iconPosition="right"
              disabled={!surface || !trackingReady}
              onClick={onContinue}
            >
              Continue
            </WuButton>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Test summary</h3>
          <div className="mt-3">
            <SummaryRow label="Testing surface" value={surfaceLabel} />
            <SummaryRow
              label="Design variants"
              value={String(draft.variants.length)}
            />
            <SummaryRow
              label="Connected"
              value={`${connectedCount} of ${draft.variants.length}`}
              pill={trackingReady ? 'green' : 'gray'}
            />
            {draft.variants.map((variant) => (
              <SummaryRow
                key={variant.id}
                label={variant.name || 'Untitled variant'}
                value={isVariantConnected(surface, variant) ? connectionLabel(surface, variant) : 'Not connected'}
                pill={isVariantConnected(surface, variant) ? 'green' : 'gray'}
              />
            ))}
          </div>
        </div>

        {surface && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-blue-900">
              <span className="wm-auto-awesome text-sm text-blue-600" /> How this is used
            </p>
            <p className="mt-2 text-xs leading-5 text-blue-800">{RESEARCH_RECS[surface]}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
