'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { FocusGroupSessionWorkspace } from '@/components/focus-group-studies/FocusGroupSessionWorkspace';
import { MOCK_FOCUS_GROUPS } from '@/data/mock-focus-groups';
import { MOCK_FOCUS_GROUP_WORKSPACES } from '@/data/mock-focus-group-scheduling';
import { MOCK_FOCUS_GROUP_SESSIONS } from '@/data/mock-focus-group-session';

export default function FocusGroupSessionPage() {
  const { id } = useParams<{ id: string }>();

  const focusGroup = MOCK_FOCUS_GROUPS.find((item) => item.id === id);
  const workspace =
    MOCK_FOCUS_GROUP_WORKSPACES.find((item) => item.focusGroupId === id) ?? MOCK_FOCUS_GROUP_WORKSPACES[0];
  const session =
    MOCK_FOCUS_GROUP_SESSIONS.find((item) => item.focusGroupId === id) ?? MOCK_FOCUS_GROUP_SESSIONS[0];

  if (!focusGroup) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon="wm-error-outline"
          title="Focus group not found"
          description="This focus group does not exist or has been removed from the prototype workspace."
          action={
            <Link href="/focus-group-studies" className="text-sm font-medium text-blue-600 hover:underline">
              Back to focus groups
            </Link>
          }
        />
      </div>
    );
  }

  return <FocusGroupSessionWorkspace focusGroup={focusGroup} workspace={workspace} session={session} />;
}
