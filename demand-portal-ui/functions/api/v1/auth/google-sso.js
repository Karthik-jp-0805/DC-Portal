export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const email = body.email || "Sample@tigeranalytics.com";
    const userType = body.user_type || "employee";
    const role = body.stakeholder_role || (userType === 'admin' ? "Portal Admin" : "Demand Creation");
    const name = userType === 'admin' ? "Portal Admin" : "Karthikeyan Jayaprakash";

    return new Response(JSON.stringify({
      message: "SSO Authentication Successful",
      user: { email, name, user_type: userType, role }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ detail: err.message }), { status: 400 });
  }
}