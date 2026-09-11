'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { mergePages, type PageControl, type PageLandmark, type SitePage } from '@/data/site-page-utils';
import {
  addCustomPage,
  applyDefaultStartPages,
  emptyTask,
  isTaskConfigured,
  pageCatalogUrl,
  taskSuccessSummary,
  type LandmarkCache,
  type TaskSuccessMode,
  type UsabilityCreateDraft,
  type UsabilityTaskDraft,
} from '@/data/usability-create-storage';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);
const WuCombobox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCombobox })),
  { ssr: false }
);

interface TaskScriptStepProps {
  draft: UsabilityCreateDraft;
  fetchingPages: boolean;
  onDraftChange: (patch: Partial<UsabilityCreateDraft>) => void;
  onRefreshPages: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

interface SelectOption { value: string; label: string; }

const SUCCESS_MODE_OPTIONS: SelectOption[] = [
  { value: 'reach-page', label: 'They reach this page' },
  { value: 'reach-section', label: 'They reach a section on that page' },
  { value: 'click-control', label: 'They click this control' },
  { value: 'participant-done', label: 'Participant marks done' },
];

const FIGMA_SUCCESS_OPTIONS: SelectOption[] = [
  { value: 'participant-done', label: 'Participant marks done' },
];

function pageOptions(pages: SitePage[]): SelectOption[] {
  return pages.map((page) => ({
    value: page.id,
    label: page.path === '/' ? `${page.label} · Home` : `${page.label} · ${page.path}`,
  }));
}

function CatalogPicker({
  label,
  pages,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  pages: SitePage[];
  value: string | null;
  onChange: (id: string) => void;
  placeholder: string;
}) {
  const data = pageOptions(pages);
  const selected = data.find((option) => option.value === value) ?? null;
  if (pages.length === 0) {
    return (
      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">No pages listed yet. Add a page URL below.</p>
      </div>
    );
  }
  if (data.length > 15) {
    return (
      <WuCombobox
        Label={label}
        data={data}
        accessorKey={{ value: 'value', label: 'label' }}
        value={selected}
        onSelect={(v) => onChange((v as SelectOption).value)}
        enableSearch
        variant="outlined"
        placeholder={placeholder}
      />
    );
  }
  return (
    <WuSelect
      Label={label}
      data={data}
      accessorKey={{ value: 'value', label: 'label' }}
      value={selected}
      onSelect={(v) => onChange((v as SelectOption).value)}
      variant="outlined"
    />
  );
}

function LandmarkPicker({
  label,
  items,
  value,
  onChange,
  emptyLabel,
  loading,
}: {
  label: string;
  items: { id: string; label: string }[];
  value: string | null;
  onChange: (id: string) => void;
  emptyLabel: string;
  loading: boolean;
}) {
  const data = items.map((item) => ({ value: item.id, label: item.label }));
  const selected = data.find((option) => option.value === value) ?? null;
  if (loading) {
    return (
      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">Reading this page…</p>
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">{emptyLabel}</p>
      </div>
    );
  }
  if (data.length > 15) {
    return (
      <WuCombobox
        Label={label}
        data={data}
        accessorKey={{ value: 'value', label: 'label' }}
        value={selected}
        onSelect={(v) => onChange((v as SelectOption).value)}
        enableSearch
        variant="outlined"
        placeholder="Search"
      />
    );
  }
  return (
    <WuSelect
      Label={label}
      data={data}
      accessorKey={{ value: 'value', label: 'label' }}
      value={selected}
      onSelect={(v) => onChange((v as SelectOption).value)}
      variant="outlined"
    />
  );
}

function TaskCard({
  task,
  index,
  pages,
  isFigma,
  landmarks,
  loadingUrl,
  onChange,
  onRemove,
}: {
  task: UsabilityTaskDraft;
  index: number;
  pages: SitePage[];
  isFigma: boolean;
  landmarks: LandmarkCache;
  loadingUrl: string | null;
  onChange: (task: UsabilityTaskDraft) => void;
  onRemove: () => void;
}) {
  const modeOptions = isFigma ? FIGMA_SUCCESS_OPTIONS : SUCCESS_MODE_OPTIONS;
  const modeValue = modeOptions.find((option) => option.value === task.successMode) ?? modeOptions[0];
  const successPage = pages.find((page) => page.id === task.successPageId);
  const pageLandmarks = successPage ? landmarks[successPage.url] : undefined;
  const loadingLandmarks = Boolean(successPage && loadingUrl === successPage.url);

  function setMode(mode: TaskSuccessMode) {
    onChange({
      ...task,
      successMode: mode,
      successLandmarkId: null,
      successPageId: mode === 'participant-done' ? task.successPageId : task.successPageId,
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Task {index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
          aria-label="Remove task"
        >
          <span className="wm-delete text-base" />
        </button>
      </div>

      <div className="space-y-3">
        <WuInput
          Label="Task title"
          variant="outlined"
          placeholder="Join as a new member"
          value={task.title}
          onChange={(e) => onChange({ ...task, title: e.target.value })}
        />
        <WuTextarea
          Label="Participant instructions"
          variant="outlined"
          placeholder="You want to get set up and take your first action. Use the site as you normally would."
          value={task.instructions}
          rows={3}
          onChange={(e) => onChange({ ...task, instructions: e.target.value })}
        />
        <p className="text-xs text-gray-500">
          Describe the goal and situation. Do not name buttons, menus, or the success page — people should find those themselves.
        </p>

        {!isFigma && (
          <CatalogPicker
            label="Task starts on"
            pages={pages}
            value={task.startPageId}
            onChange={(id) => onChange({ ...task, startPageId: id })}
            placeholder="Search pages"
          />
        )}

        <WuSelect
          Label="They succeed when"
          data={modeOptions}
          accessorKey={{ value: 'value', label: 'label' }}
          value={modeValue}
          onSelect={(v) => setMode((v as SelectOption).value as TaskSuccessMode)}
          variant="outlined"
        />

        {isFigma && (
          <p className="text-xs text-gray-500">
            Prototype frames are not live pages. People tap done when they believe they have finished. Review the recording to judge success.
          </p>
        )}

        {!isFigma && task.successMode !== 'participant-done' && (
          <CatalogPicker
            label={task.successMode === 'reach-page' ? 'Success page' : 'On this page'}
            pages={pages}
            value={task.successPageId}
            onChange={(id) => onChange({ ...task, successPageId: id, successLandmarkId: null })}
            placeholder="Search pages"
          />
        )}

        {!isFigma && task.successMode === 'reach-section' && (
          <LandmarkPicker
            label="Success section"
            items={pageLandmarks?.sections ?? []}
            value={task.successLandmarkId}
            onChange={(id) => onChange({ ...task, successLandmarkId: id })}
            loading={loadingLandmarks}
            emptyLabel="No headings or sections found on this page. Add a page URL, or choose a different success."
          />
        )}

        {!isFigma && task.successMode === 'click-control' && (
          <LandmarkPicker
            label="Success control"
            items={pageLandmarks?.controls ?? []}
            value={task.successLandmarkId}
            onChange={(id) => onChange({ ...task, successLandmarkId: id })}
            loading={loadingLandmarks}
            emptyLabel="No named buttons or links found on this page. Add a page URL, or choose “Participant marks done.”"
          />
        )}

        {task.successMode === 'participant-done' && !isFigma && (
          <p className="text-xs text-gray-500">
            Use this when the site has no reliable page, section, or control to observe — including recording-only tests.
          </p>
        )}
      </div>
    </div>
  );
}

export function TaskScriptStep({
  draft,
  fetchingPages,
  onDraftChange,
  onRefreshPages,
  onBack,
  onSaveDraft,
  onContinue,
}: TaskScriptStepProps) {
  const [extraUrl, setExtraUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [landmarks, setLandmarks] = useState<LandmarkCache>({});
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);
  const pendingFetch = useRef<Set<string>>(new Set());
  const landmarksRef = useRef<LandmarkCache>({});
  landmarksRef.current = landmarks;

  const tasks = draft.tasks;
  const pages = draft.pages;
  const isFigma = draft.surface === 'figma';
  const hasPages = pages.length > 0;
  const configuredCount = tasks.filter((task) => isTaskConfigured(task, hasPages)).length;
  const catalogUrl = pageCatalogUrl(draft);

  useEffect(() => {
    const urls = new Set<string>();
    for (const task of tasks) {
      if (task.successMode !== 'reach-section' && task.successMode !== 'click-control') continue;
      const page = pages.find((item) => item.id === task.successPageId);
      if (page) urls.add(page.url);
    }

    async function load(url: string) {
      if (landmarksRef.current[url] || pendingFetch.current.has(url)) return;
      pendingFetch.current.add(url);
      setLoadingUrl(url);
      try {
        const response = await fetch('/api/page-landmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const json = (await response.json()) as { sections?: PageLandmark[]; controls?: PageControl[]; error?: string };
        if (response.ok && json.sections && json.controls) {
          setLandmarks((prev) => ({ ...prev, [url]: { sections: json.sections ?? [], controls: json.controls ?? [] } }));
        } else {
          setLandmarks((prev) => ({ ...prev, [url]: { sections: [], controls: [] } }));
        }
      } catch {
        setLandmarks((prev) => ({ ...prev, [url]: { sections: [], controls: [] } }));
      } finally {
        pendingFetch.current.delete(url);
        setLoadingUrl((current) => (current === url ? null : current));
      }
    }

    urls.forEach((url) => {
      void load(url);
    });
  }, [tasks, pages]);

  function updateTask(id: string, updated: UsabilityTaskDraft) {
    onDraftChange({ tasks: tasks.map((task) => (task.id === id ? updated : task)) });
  }

  function addTask() {
    const task = emptyTask(`task-${Date.now()}`);
    if (isFigma) task.successMode = 'participant-done';
    onDraftChange({ tasks: applyDefaultStartPages([...tasks, task], pages) });
  }

  function removeTask(id: string) {
    const next = tasks.filter((task) => task.id !== id);
    onDraftChange({ tasks: next.length > 0 ? next : [emptyTask('task-1')] });
  }

  function handleAddPageUrl() {
    const result = addCustomPage(pages, extraUrl);
    if ('error' in result) {
      setUrlError(result.error);
      return;
    }
    setUrlError('');
    setExtraUrl('');
    onDraftChange({
      pages: result.pages,
      fetchError: null,
      tasks: applyDefaultStartPages(tasks, result.pages),
    });
    void (async () => {
      try {
        const response = await fetch('/api/site-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: result.page.url }),
        });
        const json = (await response.json()) as { pages?: SitePage[]; blocked?: boolean };
        if (response.ok && json.pages) {
          const merged = mergePages(result.pages, json.pages);
          onDraftChange({
            pages: merged,
            fetchBlocked: Boolean(json.blocked),
            tasks: applyDefaultStartPages(tasks, merged),
          });
        }
      } catch {
        // Keep the URL that was added by hand.
      }
    })();
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Discussion guide</h2>
          <p className="mt-1 text-sm text-gray-500">
            Write each task as a goal. Then mark the start page and the observable success — not a hint about what to click.
          </p>
        </div>

        <div className="space-y-4 p-5">
          {isFigma && (
            <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
              This is a prototype. Success is when the participant marks the task done. You will judge from the recording whether they actually finished.
            </div>
          )}

          {!isFigma && !hasPages && (
            <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
              {draft.fetchError || 'No pages listed from Links yet.'}{' '}
              Add a page URL below, or use “Participant marks done.”
              {catalogUrl ? (
                <>
                  {' '}
                  <button
                    type="button"
                    className="font-medium text-amber-900 underline"
                    onClick={onRefreshPages}
                    disabled={fetchingPages}
                  >
                    {fetchingPages ? 'Listing pages…' : 'List pages from the Links URL'}
                  </button>
                </>
              ) : null}
            </div>
          )}

          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              pages={pages}
              isFigma={isFigma}
              landmarks={landmarks}
              loadingUrl={loadingUrl}
              onChange={(updated) => updateTask(task.id, updated)}
              onRemove={() => removeTask(task.id)}
            />
          ))}

          <WuButton variant="secondary" Icon={<span className="wm-add" />} onClick={addTask}>
            Add task
          </WuButton>

          {!isFigma && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-800">Add a page URL</p>
              <p className="mt-1 text-xs text-gray-500">
                Use this when a page is missing from the list — for example a confirmation screen that is not in the navigation.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <WuInput
                    Label="Page URL"
                    variant="outlined"
                    placeholder="https://yourproduct.com/checkout/confirm"
                    value={extraUrl}
                    onChange={(e) => {
                      setExtraUrl(e.target.value);
                      if (urlError) setUrlError('');
                    }}
                  />
                </div>
                <WuButton variant="secondary" onClick={handleAddPageUrl}>
                  Add page
                </WuButton>
              </div>
              {urlError ? <p className="mt-1 text-xs text-red-600">{urlError}</p> : null}
            </div>
          )}

          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-600">
            Tasks are shown one at a time, in this order. Tracking records the path; success is only the end state you set here.
          </div>
        </div>

        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
          <WuButton variant="secondary" onClick={onBack}>Back</WuButton>
          <div className="flex items-center gap-2">
            <WuButton variant="secondary" onClick={onSaveDraft}>Save draft</WuButton>
            <WuButton Icon={<span className="wm-arrow-forward" />} iconPosition="right" onClick={onContinue}>
              Continue
            </WuButton>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">How to write a task</h3>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-gray-600">
            <li className="flex gap-2"><span className="mt-0.5 text-blue-600">1.</span> Give a realistic goal and a short situation. People should be able to read it in under 30 seconds.</li>
            <li className="flex gap-2"><span className="mt-0.5 text-blue-600">2.</span> Do not mention UI. Avoid “use the checkout button” or “open the menu.” Let people find their own path.</li>
            <li className="flex gap-2"><span className="mt-0.5 text-blue-600">3.</span> Success must be observable: they reach a page, a section, or a named control — or they mark the task done.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Tasks ready</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{configuredCount} of {tasks.length}</p>
          <p className="mt-1 text-xs text-gray-500">
            {configuredCount === 1 ? 'task has' : 'tasks have'} a start and a success
          </p>
          <ul className="mt-3 space-y-2">
            {tasks.map((task, index) => (
              <li key={task.id} className="text-xs text-gray-600">
                <span className="font-medium text-gray-800">Task {index + 1}.</span>{' '}
                {taskSuccessSummary(task, pages)}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
