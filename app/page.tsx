

import AuthForm from "@/components/auth-form"

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">DocuSign Alternative</h1>
      <AuthForm />
    </main>
  )
}