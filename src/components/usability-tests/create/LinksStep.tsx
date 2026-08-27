'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SelectableCard } from '@/components/ui/SelectableCard';

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
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

type SurfaceType = 'website' | 'saas' | 'figma';

interface WebsiteState { url: string; recordingOnly: boolean; verified: boolean; }
interface SaasState { url: string; environment: string; email: string; verified: boolean; }
interface FigmaState { connected: boolean; file: string; trackInteractive: boolean; }

const SURFACE_OPTIONS: { value: SurfaceType; title: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'website',
    title: 'Website',
    description: 'A live, public or marketing site — no login required',
    icon: <span className="wm-language text-xl" />,
  },
  {
    value: 'saas',
    title: 'SaaS Product',
    description: 'An authenticated app or dashboard',
    icon: <span className="wm-deployed-code text-xl" />,
  },
  {
    value: 'figma',
    title: 'Figma Prototype',
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
  'Checkout Redesign 2026',
  'Mobile Nav Exploration',
];

const FIGMA_FILE_OPTIONS = FIGMA_FILES.map((f) => ({ value: f, label: f }));

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
  label,
  successLabel,
  onVerify,
}: {
  verified: boolean;
  disabled: boolean;
  label: string;
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
      disabled={disabled}
      Icon={<span className="wm-refresh" />}
      onClick={onVerify}
      className="mt-2"
    >
      {label}
    </WuButton>
  );
}

function WebsitePanel({ state, setState }: { state: WebsiteState; setState: (s: WebsiteState) => void }) {
  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <span className="wm-layers text-base" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Install website tracking</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Captures clicks, scroll depth, and page paths so heatmaps and flow diagrams are available once the test starts.
          </p>
        </div>
      </div>

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
          <p className="text-xs text-gray-500">Paste this before <code>&lt;/head&gt;</code> on every page you want to test.</p>
          <InfoCallout>
            Single-page apps that don&apos;t change the URL on navigation won&apos;t register separate steps automatically. Use query parameters or hash routes if you need step-level tracking.
          </InfoCallout>
        </>
      )}

      {state.recordingOnly && (
        <InfoCallout tone="amber">
          Recording-only mode: no snippet needed. We&apos;ll rely on full screen + audio capture instead of heatmaps or path diagrams.
        </InfoCallout>
      )}

      <VerifyRow
        verified={state.verified}
        disabled={!state.url}
        label={state.recordingOnly ? 'Confirm live URL' : 'Verify installation'}
        successLabel={state.recordingOnly ? `Ready to record ${state.url}` : `Snippet detected on ${state.url}`}
        onVerify={() => setState({ ...state, verified: true })}
      />
    </div>
  );
}

function SaasPanel({ state, setState }: { state: SaasState; setState: (s: SaasState) => void }) {
  const envOption = ENV_OPTIONS.find((o) => o.value === state.environment) ?? ENV_OPTIONS[0];
  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <span className="wm-layers text-base" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Install tracking in your product</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Same snippet as a website, placed in your authenticated app shell so it loads after login.
          </p>
        </div>
      </div>

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
      <p className="text-xs text-gray-500">Add to your app shell/layout component so it survives client-side routing.</p>

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
      <p className="text-xs text-gray-500">Shared automatically and only with matched testers once the test goes live.</p>

      <InfoCallout>
        Testers need valid credentials to reach instrumented screens — the snippet just needs to load after login.
      </InfoCallout>

      <VerifyRow
        verified={state.verified}
        disabled={!state.url || !state.email}
        label="Verify installation"
        successLabel={`Snippet detected on ${state.url} (${state.environment})`}
        onVerify={() => setState({ ...state, verified: true })}
      />
    </div>
  );
}

function FigmaPanel({ state, setState }: { state: FigmaState; setState: (s: FigmaState) => void }) {
  const fileOption = FIGMA_FILE_OPTIONS.find((o) => o.value === state.file) ?? null;

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
          <span className="wm-gesture text-base" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Connect your Figma prototype</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Uses Figma&apos;s Embed API to capture clicks and navigation directly from the prototype — no code required.
          </p>
        </div>
      </div>

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

          <InfoCallout>
            We only request scoped read access to the file you import — not your team, comments, or other projects.
          </InfoCallout>
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

const SURFACE_LABELS: Record<SurfaceType, string> = {
  website: 'Website',
  saas: 'SaaS Product',
  figma: 'Figma Prototype',
};

const RESEARCH_RECS: Record<SurfaceType, string> = {
  website: 'A live website test will produce click heatmaps, scroll-depth graphs, and a Sankey path diagram once the snippet is verified.',
  saas: 'Because this is an authenticated flow, pair this test with a moderated Live Conversation to catch friction points automated tracking alone would miss.',
  figma: 'Prototype tests via the Embed API give you the richest quantitative data of any surface — no snippet reliability issues.',
};

function isTrackingReady(surface: SurfaceType, ws: WebsiteState, ss: SaasState, fs: FigmaState) {
  if (surface === 'website') return ws.verified || (ws.recordingOnly && !!ws.url);
  if (surface === 'saas') return ss.verified;
  if (surface === 'figma') return fs.connected && !!fs.file;
  return false;
}

export function LinksStep({ onBack, onSaveDraft, onContinue }: LinksStepProps) {
  const [surface, setSurface] = useState<SurfaceType | null>(null);
  const [website, setWebsite] = useState<WebsiteState>({ url: '', recordingOnly: false, verified: false });
  const [saas, setSaas] = useState<SaasState>({ url: '', environment: 'Staging', email: '', verified: false });
  const [figma, setFigma] = useState<FigmaState>({ connected: false, file: '', trackInteractive: true });

  const trackingReady = surface ? isTrackingReady(surface, website, saas, figma) : false;
  const surfaceLabel = surface ? SURFACE_LABELS[surface] : 'Not selected';
  const trackingLabel = trackingReady ? 'Connected' : 'Not connected';

  function handleContinue() {
    if (!surface || !trackingReady) return;
    onContinue();
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Links</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose the testing surface, then connect tracking so Behavior Analytics captures data automatically.
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
                  onClick={() => setSurface(opt.value)}
                />
              ))}
            </div>
          </div>

          {surface === 'website' && (
            <WebsitePanel state={website} setState={setWebsite} />
          )}
          {surface === 'saas' && (
            <SaasPanel state={saas} setState={setSaas} />
          )}
          {surface === 'figma' && (
            <FigmaPanel state={figma} setState={setFigma} />
          )}

          {!surface && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
              Select a testing surface above to see tracking setup options.
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
          <WuButton variant="secondary" onClick={onBack}>Back</WuButton>
          <div className="flex items-center gap-2">
            <WuButton variant="secondary" onClick={onSaveDraft}>Save Draft</WuButton>
            <WuButton
              Icon={<span className="wm-arrow-forward" />}
              iconPosition="right"
              disabled={!surface || !trackingReady}
              onClick={handleContinue}
            >
              Continue
            </WuButton>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Test Summary</h3>
          <div className="mt-3">
            <SummaryRow label="Testing surface" value={surfaceLabel} />
            <SummaryRow label="Tracking status" value={trackingLabel} pill={trackingReady ? 'green' : 'gray'} />
            <SummaryRow label="Target participants" value="12" />
            <SummaryRow label="Task duration" value="20 mins" />
          </div>
        </div>

        {surface && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-blue-900">
              <span className="wm-auto-awesome text-sm text-blue-600" /> Research Recommendation
            </p>
            <p className="mt-2 text-xs leading-5 text-blue-800">{RESEARCH_RECS[surface]}</p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">What tracking gives you</h3>
          <ul className="mt-3 space-y-2">
            {[
              { icon: 'wm-mouse', label: 'Click heatmaps' },
              { icon: 'wm-swap-vert', label: 'Scroll depth charts' },
              { icon: 'wm-play-circle', label: 'Session replays' },
              { icon: 'wm-account-tree', label: 'Click path flow' },
              { icon: 'wm-warning', label: 'Rage & misclick detection' },
            ].map(({ icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-xs text-gray-600">
                <span className={`${icon} text-sm text-gray-400`} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
