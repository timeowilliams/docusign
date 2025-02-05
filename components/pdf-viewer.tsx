'use client';

import dynamic from 'next/dynamic';

const PDFViewerCore = dynamic(() => import('./pdf-viewer-core'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-gray-500">Loading PDF viewer...</div>
    </div>
  ),
});

const PDFViewer = () => {
  return <PDFViewerCore />;
};

export default PDFViewer;