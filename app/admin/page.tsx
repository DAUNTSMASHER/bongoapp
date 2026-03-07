export default function AdminPage() {
  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">Admin — Story Moderation</h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        Protected route. Pending stories will be listed here for review and publish.
      </p>
    </div>
  );
}
