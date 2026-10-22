import { PlannedPanel } from '../../components/admin/AdminBits';

export default function AdminPlanned({
  title,
  phase = 'Planned · Phase 2',
  description,
  bullets,
}: {
  title: string;
  phase?: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <p className="mt-1 text-sm text-text-muted">Not switched on yet.</p>
      </div>
      <PlannedPanel title={title} phase={phase} description={description} bullets={bullets} />
    </div>
  );
}
