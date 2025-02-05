// app/dashboard/page.tsx
import PDFViewer from "@/components/pdf-viewer"

export default function Dashboard() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Document Editor</h1>
      <PDFViewer />
    </main>
  )
}