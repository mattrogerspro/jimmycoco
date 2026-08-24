import { Form } from "react-router";
import type { FollowUpCampaignId, FollowUpHistory } from "../../lib/manual-follow-ups.server";

type Props = {
  campaignId: FollowUpCampaignId;
  label: string;
  sourceLabel: string;
  eligible: boolean;
  ineligibleReason?: string;
  history: FollowUpHistory;
  busy: boolean;
};

function dateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export function ManualFollowUpPanel({ campaignId, label, sourceLabel, eligible, ineligibleReason, history, busy }: Props) {
  const enrollments = history.enrollments.filter((entry) => entry.campaign_id === campaignId);
  const current = enrollments[0];
  const active = current?.status === "active" || current?.status === "paused" || current?.status === "needs_attention";
  const messages = history.messages.filter((entry) => entry.campaign_id === campaignId);

  return (
    <section className="admin-panel is-secondary admin-follow-up" aria-busy={busy || undefined}>
      <div className="admin-panel-head"><h2>Follow-up campaign</h2><span>{label}</span></div>
      <div className="admin-panel-body">
        <p className="admin-follow-up-intro">A manual promotional sequence. Transactional emails and order operations stay unchanged.</p>
        {!history.configured ? <p className="admin-follow-up-state">Campaign service is not connected in this environment, so no follow-up can start from this page.</p> : null}
        {!eligible ? <p className="admin-follow-up-state">{ineligibleReason || "This record is not eligible for this follow-up."}</p> : null}
        {current ? (
          <dl className="admin-follow-up-facts">
            <div><dt>State</dt><dd><span className={`admin-status admin-status-${current.status}`}>{current.status.replace("_", " ")}</span></dd></div>
            <div><dt>Started</dt><dd>{dateTime(current.enrolled_at)}</dd></div>
            <div><dt>Next touch</dt><dd>{dateTime(current.next_send_at)}</dd></div>
            {current.exit_reason ? <div><dt>Stopped because</dt><dd>{current.exit_reason.replaceAll("_", " ")}</dd></div> : null}
          </dl>
        ) : null}
        {eligible && history.configured && !current ? (
          <Form method="post" replace className="admin-follow-up-form">
            <input type="hidden" name="intent" value="start-follow-up" />
            <input type="hidden" name="campaignId" value={campaignId} />
            <button className="admin-primary" type="submit" disabled={busy}>Start {label}</button>
            <p>Starts from this {sourceLabel} on the campaign schedule and first ends any active UK prospecting sequence for this contact.</p>
          </Form>
        ) : null}
        {eligible && history.configured && active ? (
          <Form method="post" replace className="admin-follow-up-form admin-follow-up-stop">
            <input type="hidden" name="intent" value="stop-follow-up" />
            <input type="hidden" name="campaignId" value={campaignId} />
            <label htmlFor={`stop-${campaignId}`}>Stop reason</label>
            <select id={`stop-${campaignId}`} name="reason" defaultValue="manual_suppression">
              <option value="manual_suppression">Manual suppression</option>
              <option value="current_negotiation">Current negotiation</option>
              <option value="existing_customer">Existing customer</option>
              <option value="reply">Reply handled manually</option>
            </select>
            <button type="submit" className="admin-danger" disabled={busy}>Stop {label}</button>
          </Form>
        ) : null}
        {messages.length ? <ul className="admin-follow-up-history">{messages.map((message) => <li key={message.id}><span>Step {message.step_number}</span><b>{message.status}</b><small>{message.subject}</small></li>)}</ul> : null}
      </div>
    </section>
  );
}
