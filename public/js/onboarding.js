const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "index.html";
}

const form = document.getElementById("orgForm");
const errorMsg = document.getElementById("errorMsg");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorMsg.classList.remove("show");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();

    try {
        const res = await fetch("/organization", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({ title, description })
        });

        const data = await res.json();

        if (!res.ok) {
            errorMsg.textContent = data.message || "Could not create organization.";
            errorMsg.classList.add("show");
            submitBtn.disabled = false;
            submitBtn.textContent = "Create organization";
            return;
        }


        window.location.href = "organization.html?orgId=" + data.id;

    } catch (err) {
        errorMsg.textContent = "Could not reach the server. Is it running?";
        errorMsg.classList.add("show");
        submitBtn.disabled = false;
        submitBtn.textContent = "Create organization";
    }
});