const form = document.getElementById("signinForm");
const errorMsg = document.getElementById("errorMsg");
const submitBtn = document.getElementById("submitBtn");

// If already signed in, skip this page entirely
if (localStorage.getItem("token")) {
    window.location.href = "onboarding.html";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault(); // stop the browser's default full-page-reload form submission

    errorMsg.classList.remove("show");
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            // backend sent a 403 with { message: "Incorrect credentials" }
            errorMsg.textContent = data.message || "Something went wrong. Try again.";
            errorMsg.classList.add("show");
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign in";
            return;
        }

        localStorage.setItem("token", data.token);
        window.location.href = "onboarding.html";

    } catch (err) {
        // network failure, server down, etc — different from a "wrong password" error
        errorMsg.textContent = "Could not reach the server. Is it running?";
        errorMsg.classList.add("show");
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign in";
    }
});