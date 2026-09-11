'use client';

import dynamic from 'next/dynamic';

const WuCopyToClipboard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCopyToClipboard })),
  { ssr: false }
);

export function SnippetBlock({ filename, code }: { filename: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-lg bg-[#12192B]">
      <div className="flex items-center justify-between bg-[#0D1322] px-3 py-2">
        <span className="text-xs text-gray-400">{filename}</span>
        <WuCopyToClipboard textToCopy={code} />
      </div>
      <pre className="max-h-48 overflow-auto px-4 py-3 font-mono text-[12.5px] text-[#C7D3EE]">{code}</pre>
    </div>
  );
}
