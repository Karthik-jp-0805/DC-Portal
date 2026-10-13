// In-memory persistent edge store for live demo submissions
let ledgerStore = [
  {
    requirement_id: "REQ-2026-0142",
    domain: "Consumer & Commercial",
    project_name: "PEPSICO_PBNA_MKT",
    client_requestor_name: "Karthikeyan Jayaprakash",
    requestor_email: "Sample@tigeranalytics.com",
    service_required: "Demand: Lead Data Engineer",
    created_at: "2026-10-12T10:00:00.000Z",
    status: "IN PROGRESS",
    additional_comments: "Awaiting candidate technical screening with CP."
  },
  {
    requirement_id: "REQ-2026-0141",
    domain: "Supply Chain (SC)",
    project_name: "PEPSICO_CTO_SC_EDGE",
    client_requestor_name: "Sarah Jenkins",
    requestor_email: "sarah.j@tigeranalytics.com",
    service_required: "Dossier Project Creation",
    created_at: "2026-10-11T09:30:00.000Z",
    status: "COMPLETED",
    additional_comments: "Project code established in Dossier system."
  }
];

export async function onRequestGet() {
  return new Response(JSON.stringify(ledgerStore), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const reqId = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord = {
      ...data,
      requirement_id: reqId,
      status: "IN PROGRESS",
      created_at: new Date().toISOString()
    };

    ledgerStore.unshift(newRecord);

    return new Response(JSON.stringify({
      requirement_id: reqId,
      status: "IN PROGRESS",
      message: "Demand submitted successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ detail: err.message }), { status: 400 });
  }
}