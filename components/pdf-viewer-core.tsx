

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DndContext, DragEndEvent, useDraggable } from '@dnd-kit/core';
import SignaturePad from 'react-signature-canvas';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


// Types
interface EditableElement {
  id: string;
  type: 'text' | 'signature' | 'signatureRequest';
  content: string;
  position: { x: number; y: number };
}

interface DraggableElementProps {
  element: EditableElement;
  children: React.ReactNode;
}

// Draggable Element Component
function DraggableElement({ element, children }: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

const PDFViewerCore = () => {
  // State management
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [elements, setElements] = useState<EditableElement[]>([]);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const initializePDF = async () => {
      try {
        console.log('Current pdfjs version:', pdfjs.version);
        const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        console.log('Setting worker src to:', workerSrc);
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      } catch (error) {
        console.error('Error initializing PDF worker:', error);
      }
    }
    initializePDF()
  });

  // Refs
  const signaturePadRef = useRef<SignaturePad>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // File handling
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setPageNumber(1);
      setError(null);
      setElements([]);
      setScale(1);
      setRotation(0);
    }
  };

  // PDF document handlers
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF Load Error:', error);
    setError('Failed to load PDF. Please try again.');
  };

  const onPageLoadSuccess = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, []);

  // Navigation
  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return newPage >= 1 && newPage <= (numPages || 1) ? newPage : prevPageNumber;
    });
  };

  // Zoom and rotation controls
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Element management
  const addElement = (type: 'text' | 'signature' | 'signatureRequest') => {
    const newElement: EditableElement = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? 'Click to edit' : '',
      position: { x: 50, y: 50 }
    };
    setElements(prev => [...prev, newElement]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    setElements(prev => prev.map(el => {
      if (el.id === active.id) {
        return {
          ...el,
          position: {
            x: el.position.x + delta.x,
            y: el.position.y + delta.y,
          },
        };
      }
      return el;
    }));
  };

  const updateElementContent = (id: string, content: string) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, content } : el
    ));
  };

  // Signature handling
  const saveSignature = () => {
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      const newElement: EditableElement = {
        id: Date.now().toString(),
        type: 'signature',
        content: signatureData,
        position: { x: 50, y: 50 }
      };
      setElements(prev => [...prev, newElement]);
      setShowSignaturePad(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {/* File Upload Section */}
      <div className="w-full mb-4 space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Upload PDF
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={onFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {/* Controls */}
      {pdfFile && (
        <div className="w-full mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded ${
              editMode ? 'bg-green-500' : 'bg-blue-500'
            } text-white`}
          >
            {editMode ? 'View Mode' : 'Edit Mode'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleZoomOut}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Zoom Out
            </button>
            <button
              onClick={handleZoomIn}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Zoom In
            </button>
            <button
              onClick={handleRotate}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Rotate
            </button>
          </div>

          {editMode && (
            <div className="flex gap-2">
              <button
                onClick={() => addElement('text')}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add Text
              </button>
              <button
                onClick={() => setShowSignaturePad(true)}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Add Signature
              </button>
              <button
                onClick={() => addElement('signatureRequest')}
                className="px-4 py-2 bg-purple-500 text-white rounded"
              >
                Request Signature
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="w-full mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* PDF Viewer */}
      <DndContext onDragEnd={handleDragEnd}>
        <div 
          ref={containerRef}
          className="w-full border rounded-lg p-4 bg-white relative overflow-auto max-h-[800px]"
        >
          {pdfFile && (
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="text-center py-4">Loading PDF...</div>}
              error={<div className="text-center py-4 text-red-500">Failed to load PDF</div>}
            >
              <div className="relative">
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  rotate={rotation}
                  onLoadSuccess={onPageLoadSuccess}
                  className="max-w-full"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />

                {editMode && elements.map((element) => (
                  <DraggableElement key={element.id} element={element}>
                    <div
                      style={{
                        position: 'absolute',
                        left: element.position.x,
                        top: element.position.y,
                        cursor: 'move',
                      }}
                      className="z-10"
                    >
                      {element.type === 'text' ? (
                        <textarea
                          value={element.content}
                          onChange={(e) => updateElementContent(element.id, e.target.value)}
                          className="w-48 p-2 border rounded resize-none bg-white bg-opacity-80"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : element.type === 'signature' ? (
                        <img
                          src={element.content}
                          alt="Signature"
                          className="w-48 h-20 object-contain"
                        />
                      ) : (
                        <div className="w-48 h-20 border-2 border-dashed border-purple-500 flex items-center justify-center bg-white bg-opacity-50">
                          <span className="text-purple-500">Sign Here</span>
                        </div>
                      )}
                    </div>
                  </DraggableElement>
                ))}
              </div>
            </Document>
          )}

          {!pdfFile && (
            <div className="text-center py-8 text-gray-500">
              Upload a PDF to view it here
            </div>
          )}
        </div>
      </DndContext>

      {/* Navigation Controls */}
      {pdfFile && numPages && numPages > 1 && (
        <div className="flex justify-between items-center w-full mt-4">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <SignaturePad
              ref={signaturePadRef}
              canvasProps={{
                className: 'border rounded',
                width: 400,
                height: 200
              }}
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={saveSignature}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={() => {
                  if (signaturePadRef.current) {
                    signaturePadRef.current.clear();
                  }
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Clear
              </button>
              <button
                onClick={() => setShowSignaturePad(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewerCore;