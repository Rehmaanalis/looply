import { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Looply Animation Studio — Visual Keyframe Editor',
  description:
    'Design multi-layer web animations with timeline keyframes, live canvas dragging, and exportable CSS.',
  robots: {
    index: false,
    follow: true,
  },
};

// Client-only load of EditorShell to avoid SSR hydration mismatches with IndexedDB / window
const EditorShell = dynamic(() => import('@/components/editor/EditorShell'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-[#0f1117] flex items-center justify-center text-white text-sm">
      <div className="flex items-center gap-3 bg-[#161922] p-4 rounded-xl border border-[#2a3042] shadow-xl">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-medium">Loading Looply Studio...</span>
      </div>
    </div>
  ),
});

export default function AppPage() {
  return <EditorShell />;
}
