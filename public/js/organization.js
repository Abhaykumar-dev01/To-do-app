
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "index.html";
}


const params = new URLSearchParams(window.location.search);
const orgId = params.get("orgId"); // returns "1" (a string) or null if missing

if (!orgId) {

    window.location.href = "onboarding.html";
}

// --- Element references ---
const errorMsg = document.getElementById("errorMsg");
const orgTitleEl = document.getElementById("orgTitle");
const orgDescriptionEl = document.getElementById("orgDescription");
const orgIdPill = document.getElementById("orgIdPill");
const dashboardLink = document.getElementById("dashboardLink");
const inviteSection = document.getElementById("inviteSection");
const inviteForm = document.getElementById("inviteForm");
const inviteError = document.getElementById("inviteError");
const inviteBtn = document.getElementById("inviteBtn");
const membersList = document.getElementById("membersList");
const signOutBtn = document.getElementById("signOutBtn");

let isAdmin = false;

// --- Sign out ---
signOutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});


async function loadOrganization() {
    const res = await fetch("/organizations", {
        headers: { "token": token }
    });
    const data = await res.json();

    if (!res.ok) {
        errorMsg.textContent = data.message || "Could not load organization.";
        errorMsg.classList.add("show");
        return;
    }


    const org = data.organizations.find(o => o.id === Number(orgId));

    if (!org) {
        errorMsg.textContent = "You don't have access to this organization.";
        errorMsg.classList.add("show");
        return;
    }

    isAdmin = org.isAdmin;

    orgTitleEl.textContent = org.title;
    orgDescriptionEl.textContent = org.description || "";
    orgIdPill.textContent = "org #" + org.id;
    dashboardLink.href = "dashboard.html?orgId=" + org.id;


    if (isAdmin) {
        inviteSection.style.display = "block";
    }
}

// --- Load and render the member list ---
async function loadMembers() {
    const res = await fetch("/members?organizationId=" + orgId, {
        headers: { "token": token }
    });
    const data = await res.json();

    if (!res.ok) {
        membersList.innerHTML = `<div class="empty-state">${data.message || "Could not load members."}</div>`;
        return;
    }

    renderMembers(data.members);
}

function renderMembers(members) {
    if (members.length === 0) {
        membersList.innerHTML = `<div class="empty-state">No members yet. Invite someone above.</div>`;
        return;
    }


    membersList.innerHTML = members.map(member => `
    <div class="spread" style="padding:12px 14px; background:var(--surface); border:1px solid var(--border); border-radius:8px;">
      <span>${escapeHtml(member.username)}</span>
      ${isAdmin ? `<button class="btn btn-danger btn-small" data-username="${escapeHtml(member.username)}">Remove</button>` : ""}
    </div>
  `).join("");


    membersList.querySelectorAll("button[data-username]").forEach(btn => {
        btn.addEventListener("click", () => removeMember(btn.dataset.username));
    });
}


function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
