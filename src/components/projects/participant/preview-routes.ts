export function studyPreviewPath(folderId: string, studyId: string): string {
  return `/preview/studies/${folderId}/${studyId}`;
}

export function questPreviewPath(folderId: string, studyId: string, questId: string): string {
  return `${studyPreviewPath(folderId, studyId)}/quests/${questId}`;
}

export function taskPreviewPath(
  folderId: string,
  studyId: string,
  questId: string,
  taskId: string
): string {
  return `${questPreviewPath(folderId, studyId, questId)}/tasks/${taskId}`;
}

export function openStudyPreview(folderId: string, studyId: string): void {
  window.open(studyPreviewPath(folderId, studyId), '_blank', 'noopener,noreferrer');
}
