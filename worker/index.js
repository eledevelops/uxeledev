const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
      }
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();
  const message = String(data.message ?? "").trim();
  const token = String(data.token ?? "");

  if (
    name === "" ||
    name.length > 200 ||
    !EMAIL_PATTERN.test(email) ||
    email.length > 254 ||
    message === "" ||
    message.length > 5000
  ) {
    return Response.json({ error: "Please check the form fields" }, { status: 400 });
  }

  const isHuman = await verifyTurnstile(token, request, env);
  if (!isHuman) {
    return Response.json({ error: "Verification failed, please try again" }, { status: 403 });
  }

  try {
    await env.EMAIL.send({
      to: env.CONTACT_TO,
      from: { email: "contact@uxele.dev", name: "uxele.dev contact form" },
      replyTo: email,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
  } catch (error) {
    console.error("Email failed:", error.code, error.message);
    return Response.json({ error: "Could not send, please try again later" }, { status: 502 });
  }

  return Response.json({ ok: true });
}

async function verifyTurnstile(token, request, env) {
  if (token === "") {
    return false;
  }

  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET);
  body.append("response", token);
  body.append("remoteip", request.headers.get("CF-Connecting-IP") ?? "");

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const outcome = await response.json();

  const allowedHostnames = env.TURNSTILE_HOSTNAMES.split(",");
  return outcome.success === true && allowedHostnames.includes(outcome.hostname);
}
