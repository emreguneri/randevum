import { TripStatus } from "@arabanla-eve/shared";

const sampleStatuses: TripStatus[] = [
  "REQUESTED",
  "DRIVER_ASSIGNED",
  "STARTED",
  "COMPLETED",
];

export default function HomePage() {
  return (
    <div className="shell">
      <h1>Arabanla Eve Admin</h1>
      <p className="muted">
        Manage trips, drivers, pricing, disputes, and payouts. Placeholder UI.
      </p>
      <div className="card">
        <strong>Trips</strong>
        <p className="muted">Example statuses: {sampleStatuses.join(", ")}</p>
      </div>
      <div className="card">
        <strong>Pricing</strong>
        <p className="muted">Configure taxi rates and derived KM/wait rates.</p>
      </div>
      <div className="card">
        <strong>Payouts & Disputes</strong>
        <p className="muted">Weekly payout batches with dispute holds.</p>
      </div>
    </div>
  );
}

