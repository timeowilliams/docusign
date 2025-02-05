'use client';

import React, { useState, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import Draggable from 'react-draggable';
import SignaturePad from 'react-signature-canvas';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface Element {
  id: string;
  type: 'text' | 'signature' | 'signatureRequest';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const PDFEditor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [elements, setElements] = useState<Element[]>([]);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signaturePadRef = useRef<SignaturePad>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setPageNumber(1);
    }
  };

  const addElement = (type: 'text' | 'signature' | 'signatureRequest') => {
    const newElement: Element = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? 'Click to edit' : '',
      position: { x: 0, y: 0 },
      size: { width: 200, height: type === 'text' ? 40 : 80 }
    };
    setElements([...elements, newElement]);
  };

  const onDragStop = (id: string, e: any, data: any) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, position: { x: data.x, y: data.y } } : el
    ));
  };

  const updateElementContent = (id: string, content: string) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, content } : el
    ));
  };

  const saveSignature = () => {
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      const newElement: Element = {
        id: Date.now().toString(),
        type: 'signature',
        content: signatureData,
        position: { x: 0, y: 0 },
        size: { width: 200, height: 80 }
      };
      setElements([...elements, newElement]);
      setShowSignaturePad(false);
    }
  };

  const requestSignature = async () => {
    // Here we'll implement the email request functionality
    const email = prompt('Enter email address for signature request:');
    if (email) {
      // TODO: Implement API call to send signature request
      alert(`Signature request will be sent to ${email}`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {/* Controls */}
      <div className="w-full mb-4 flex gap-2">
        <input
          type="file"
          accept=".pdf"
          onChange={onFileChange}
          className="block flex-1"
        />
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
          onClick={requestSignature}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Request Signature
        </button>
      </div>

      {/* PDF Viewer with Elements */}
      <div className="relative border rounded-lg p-4 bg-white">
        {pdfFile && (
          <Document
            file={pdfFile}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            <div className="relative">
              <Page pageNumber={pageNumber} />
              
              {/* Draggable Elements */}
              {elements.map((element) => (
                <Draggable
                  key={element.id}
                  onStop={(e, data) => onDragStop(element.id, e, data)}
                  position={element.position}
                >
                  <div
                    className="absolute cursor-move"
                    style={{
                      width: element.size.width,
                      height: element.size.height
                    }}
                  >
                    {element.type === 'text' ? (
                      <input
                        type="text"
                        value={element.content}
                        onChange={(e) => updateElementContent(element.id, e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    ) : element.type === 'signature' ? (
                      <img
                        src={element.content}
                        alt="Signature"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-purple-500 flex items-center justify-center">
                        <span className="text-purple-500">Sign Here</span>
                      </div>
                    )}
                  </div>
                </Draggable>
              ))}
            </div>
          </Document>
        )}
      </div>

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
                onClick={() => setShowSignaturePad(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Navigation */}
      {numPages > 1 && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="py-2">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFEditor;