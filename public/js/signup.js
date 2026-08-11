const form = document.getElementById("signupForm");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorMsg.classList.remove("show");
    successMsg.classList.remove("show");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            // backend sent 411 with { message: "user with this usrname already exists" }
            errorMsg.textContent = data.message || "Something went wrong. Try again.";
            errorMsg.classList.add("show");
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign up";
            return;
        }

        successMsg.textContent = "Account created! Redirecting to sign in...";
        successMsg.classList.add("show");

        // small delay so the person actually sees the success message before redirect
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (err) {
        errorMsg.textContent = "Could not reach the server. Is it running?";
        errorMsg.classList.add("show");
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign up";
    }
});
