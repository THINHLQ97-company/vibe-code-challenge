export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">matbao-vibe-challenge</h1>
      <p className="mt-2 text-gray-600">
        Mắt Bão project scaffolded from next-fullstack-starter.
      </p>
      <ul className="mt-4 list-disc pl-5 text-sm">
        <li>
          Health:{" "}
          <a className="text-blue-600 underline" href="/api/health">
            /api/health
          </a>
        </li>
        <li>Docs: xem <code>docs/</code></li>
      </ul>
    </main>
  );
}
