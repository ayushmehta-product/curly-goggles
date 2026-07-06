'use client';

import { useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import {
  INITIAL_MODERATOR_IDS,
  INITIAL_OBSERVER_IDS,
  MOCK_MODERATORS,
  MOCK_OBSERVERS,
  type StudyTeamMember,
} from '@/data/mock-study-team';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);

interface TeamStepProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

function matchesSearch(member: StudyTeamMember, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [member.fullName, member.email]
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery);
}

function Avatar({ member }: { member: StudyTeamMember }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
      {member.initials}
    </span>
  );
}

function CompactEmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-gray-400">
          <span className={`${icon} text-base`} />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function AssignedMemberCard({
  member,
  onRemove,
}: {
  member: StudyTeamMember;
  onRemove: (member: StudyTeamMember) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar member={member} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-gray-900">{member.fullName}</p>
            </div>
            <p className="mt-0.5 truncate text-xs text-gray-500">{member.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <WuButton variant="link" color="error" onClick={() => onRemove(member)}>
            Remove
          </WuButton>
        </div>
      </div>
    </div>
  );
}

function TypeaheadSearch({
  label,
  placeholder,
  query,
  onQueryChange,
  results,
  emptyMessage,
  onAdd,
}: {
  label: string;
  placeholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  results: StudyTeamMember[];
  emptyMessage: string;
  onAdd: (member: StudyTeamMember) => void;
}) {
  const showDropdown = query.trim().length > 0;

  return (
    <div className="relative">
      <WuInput
        Label={label}
        Icon={<span className="wm-search" />}
        iconPosition="left"
        variant="outlined"
        placeholder={placeholder}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />

      {showDropdown && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-500">{emptyMessage}</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar member={member} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {member.fullName}
                      </p>
                      <p className="truncate text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <WuButton size="sm" variant="secondary" onClick={() => onAdd(member)}>
                    Add
                  </WuButton>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="max-w-[170px] truncate text-right text-xs font-semibold text-gray-800">
        {value}
      </span>
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function AssignedSection({
  title,
  description,
  searchLabel,
  searchPlaceholder,
  query,
  onQueryChange,
  searchResults,
  emptySearchMessage,
  assignedMembers,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  searchLabel: string;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  searchResults: StudyTeamMember[];
  emptySearchMessage: string;
  assignedMembers: StudyTeamMember[];
  emptyIcon: string;
  emptyTitle: string;
  emptyDescription: string;
  onAdd: (member: StudyTeamMember) => void;
  onRemove: (member: StudyTeamMember) => void;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <div className="space-y-3 p-5">
        <TypeaheadSearch
          label={searchLabel}
          placeholder={searchPlaceholder}
          query={query}
          onQueryChange={onQueryChange}
          results={searchResults}
          emptyMessage={emptySearchMessage}
          onAdd={onAdd}
        />

        {assignedMembers.length === 0 ? (
          <CompactEmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <div className="space-y-2">
            {assignedMembers.map((member) => (
              <AssignedMemberCard
                key={member.id}
                member={member}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function getReadinessIndicator(moderators: StudyTeamMember[]) {
  if (moderators.length === 0) return 'Moderator staffing needed';
  if (moderators.some((member) => member.availabilityStatus.includes('Needs'))) {
    return 'Schedule review needed';
  }
  return 'Session team ready';
}

export function TeamStep({ onBack, onSaveDraft, onContinue }: TeamStepProps) {
  const { showToast } = useWuShowToast();
  const [moderatorIds, setModeratorIds] = useState(INITIAL_MODERATOR_IDS);
  const [observerIds, setObserverIds] = useState(INITIAL_OBSERVER_IDS);
  const [moderatorSearch, setModeratorSearch] = useState('');
  const [observerSearch, setObserverSearch] = useState('');

  const assignedModerators = useMemo(
    () => MOCK_MODERATORS.filter((moderator) => moderatorIds.includes(moderator.id)),
    [moderatorIds]
  );
  const assignedObservers = useMemo(
    () => MOCK_OBSERVERS.filter((observer) => observerIds.includes(observer.id)),
    [observerIds]
  );
  const moderatorResults = useMemo(
    () =>
      MOCK_MODERATORS.filter(
        (moderator) => !moderatorIds.includes(moderator.id) && matchesSearch(moderator, moderatorSearch)
      ),
    [moderatorIds, moderatorSearch]
  );
  const observerResults = useMemo(
    () =>
      MOCK_OBSERVERS.filter(
        (observer) => !observerIds.includes(observer.id) && matchesSearch(observer, observerSearch)
      ),
    [observerIds, observerSearch]
  );
  const readinessIndicator = getReadinessIndicator(assignedModerators);

  function addModerator(moderator: StudyTeamMember) {
    setModeratorIds((currentIds) => [...currentIds, moderator.id]);
    setModeratorSearch('');
    showToast({ message: `${moderator.fullName} added as moderator`, variant: 'success' });
  }

  function removeModerator(moderator: StudyTeamMember) {
    setModeratorIds((currentIds) => currentIds.filter((id) => id !== moderator.id));
    showToast({ message: `${moderator.fullName} removed from moderators`, variant: 'success' });
  }

  function addObserver(observer: StudyTeamMember) {
    setObserverIds((currentIds) => [...currentIds, observer.id]);
    setObserverSearch('');
    showToast({ message: `${observer.fullName} added as observer`, variant: 'success' });
  }

  function removeObserver(observer: StudyTeamMember) {
    setObserverIds((currentIds) => currentIds.filter((id) => id !== observer.id));
    showToast({ message: `${observer.fullName} removed from observers`, variant: 'success' });
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-3">
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Moderators</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800">
                  {assignedModerators.length} assigned
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Observers</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800">
                  {assignedObservers.length} assigned
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800">{readinessIndicator}</p>
              </div>
            </div>
          </div>

          <AssignedSection
            title="Assigned Moderators"
            description="Moderators conduct interviews, guide conversations, and manage participant interactions."
            searchLabel="Add moderator"
            searchPlaceholder="Start typing a researcher name or email"
            query={moderatorSearch}
            onQueryChange={setModeratorSearch}
            searchResults={moderatorResults}
            emptySearchMessage="No matching moderators found."
            assignedMembers={assignedModerators}
            emptyIcon="wm-record-voice-over"
            emptyTitle="No moderators assigned yet."
            emptyDescription="Add at least one moderator to conduct interview sessions."
            onAdd={addModerator}
            onRemove={removeModerator}
          />
        </section>

        <AssignedSection
          title="Assigned Observers"
          description="Observers can silently watch live sessions without interacting with participants."
          searchLabel="Add observer"
            searchPlaceholder="Start typing a stakeholder name or email"
          query={observerSearch}
          onQueryChange={setObserverSearch}
          searchResults={observerResults}
          emptySearchMessage="No matching observers found."
          assignedMembers={assignedObservers}
          emptyIcon="wm-visibility"
          emptyTitle="No observers assigned yet."
          emptyDescription="Add stakeholders who need to watch approved moderated sessions silently."
          onAdd={addObserver}
          onRemove={removeObserver}
        />

      <div className="sticky bottom-0 z-20 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
        <WuButton variant="secondary" onClick={onBack}>
          Back
        </WuButton>
        <div className="flex items-center gap-2">
          <WuButton variant="secondary" onClick={onSaveDraft}>
            Save Draft
          </WuButton>
          <WuButton Icon={<span className="wm-arrow-forward" />} iconPosition="right" onClick={onContinue}>
            Continue
          </WuButton>
        </div>
      </div>
      </div>

      <aside className="space-y-4">
        <SidebarCard title="Team Summary">
          <SummaryRow label="Total moderators" value={String(assignedModerators.length)} />
          <SummaryRow label="Total observers" value={String(assignedObservers.length)} />
          <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
            {readinessIndicator}
          </div>
        </SidebarCard>

        <SidebarCard title="Moderator Responsibilities">
          <ul className="space-y-2 text-xs leading-5 text-gray-600">
            <li>Conduct interviews and guide participant conversations.</li>
            <li>Manage participant entry, waiting room flow, and session timing.</li>
            <li>Capture notes, tags, and key moments during the interview.</li>
            <li>Keep discussion guides on track while allowing natural probing.</li>
          </ul>
        </SidebarCard>
      </aside>
    </div>
  );
}
