const ACTIVITY_KEY = "ropa.activities.v2";
const USER_KEY = "ropa.users.v1";
const SESSION_KEY = "ropa.session.v1";

const rolePermissions = {
  Admin: ["create_activity", "edit_activity", "view_activity", "manage_users", "view_all_divisions"],
  Editor: ["create_activity", "edit_activity", "view_activity"],
  Viewer: ["view_activity"],
};

const sections = [
  {
    id: "overview",
    title: "Overview",
    fields: [
      ["processName", "ชื่อกระบวนงาน", "text", true],
      ["department", "ฝ่ายงาน", "text", true],
      ["division", "Division", "text", true],
      ["owner", "ผู้รับผิดชอบ", "text", false],
      ["workflow", "รายละเอียดการทำงาน ฟังก์ชันการทำงาน", "textarea", true],
    ],
  },
  {
    id: "personalData",
    title: "Personal Data",
    fields: [
      ["dataset", "ชุดข้อมูลส่วนบุคคล", "text", true],
      ["dataFields", "ระบุรายละเอียดข้อมูลที่เก็บ", "textarea", true],
      ["dataType", "ประเภทข้อมูลการจัดเก็บข้อมูล", "text", false],
      ["dataSource", "แหล่งที่มาของข้อมูล", "textarea", false],
    ],
  },
  {
    id: "lawfulBasis",
    title: "Lawful Basis",
    fields: [
      ["purpose", "วัตถุประสงค์การใช้ข้อมูลส่วนบุคคล", "textarea", true],
      ["basis24", "ฐานประมวลผล (ตามมาตรา 24)", "text", false],
      ["basis26", "ฐานประมวลผล (มาตรา 26)", "text", false],
      ["consent", "กรณีต้องมีการขอความยินยอม", "textarea", false],
    ],
  },
  {
    id: "accessStorage",
    title: "Access & Storage",
    fields: [
      ["accessRoles", "รายชื่อผู้มีหน้าที่หรือสิทธิเข้าถึงข้อมูล", "textarea", false],
      ["accessRights", "สิทธิการเข้าถึง", "text", false],
      ["accessConditions", "เงื่อนไขในการเข้าถึงข้อมูลส่วนบุคคล", "textarea", false],
      ["storageLocation", "สถานที่จัดเก็บข้อมูล", "text", false],
    ],
  },
  {
    id: "retention",
    title: "Retention",
    fields: [
      ["retentionGroup", "กลุ่มข้อมูล", "text", false],
      ["retentionPeriod", "ระยะที่สามารถจัดเก็บได้", "text", false],
      ["retentionCondition", "เงื่อนไขรายละเอียด", "textarea", false],
      ["disposalMethod", "วิธีการลบทำลาย", "textarea", false],
    ],
  },
  {
    id: "rights",
    title: "Data Subject Rights",
    fields: [
      ["subjectRights", "สิทธิของเจ้าของข้อมูล", "textarea", false],
      ["rightsMethod", "วิธีการใช้สิทธิ", "textarea", false],
      ["rightsRequested", "มีการร้องขอใช้สิทธิเจ้าของข้อมูล", "select", false, ["", "มี", "ไม่มี"]],
      ["rightsStatus", "คำอธิบายสถานะการขอใช้สิทธิ", "textarea", false],
      ["rightsRejectReason", "คำอธิบายกรณีปฏิเสธการขอใช้สิทธิ", "textarea", false],
    ],
  },
  {
    id: "transfer",
    title: "Transfer",
    fields: [
      ["outsideUniversity", "ส่งข้อมูลส่วนบุคคลออกนอกมหาวิทยาลัย", "select", false, ["", "มี", "ไม่มี"]],
      ["crossBorder", "ส่งข้อมูลส่วนบุคคลออกต่างประเทศ", "select", false, ["", "มี", "ไม่มี"]],
    ],
  },
  {
    id: "risk",
    title: "Risk & Safeguards",
    fields: [
      ["pdpaIssues", "ประเด็น/ปัญหาที่เกี่ยวข้องกับ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล", "textarea", false],
      ["mitigationPlan", "แนวทาง แผนงานที่จะใช้ป้องกันระบบเบื้องต้น", "textarea", false],
      ["securityMeasures", "มาตรการรักษาความมั่นคงปลอดภัย", "textarea", false],
      ["requiredDocuments", "เอกสารที่มีความจำเป็นต้องดำเนินการ", "textarea", false],
    ],
  },
  {
    id: "system",
    title: "Status",
    fields: [
      ["status", "สถานะ", "select", true, ["Draft", "In Review", "Approved", "Archived"]],
      ["lastReviewedAt", "วันที่ทบทวนล่าสุด", "date", false],
      ["reviewDueDate", "วันที่ควรทบทวนครั้งถัดไป", "date", false],
      ["notes", "หมายเหตุ", "textarea", false],
    ],
  },
];

let users = loadUsers();
let activities = loadActivities();
let currentUser = getSessionUser();
let currentId = null;
let activeSection = sections[0].id;
let formState = {};

const loginView = document.querySelector("#loginView");
const appShell = document.querySelector("#appShell");
const listView = document.querySelector("#listView");
const formView = document.querySelector("#formView");
const detailView = document.querySelector("#detailView");
const adminView = document.querySelector("#adminView");
const table = document.querySelector("#activityTable");
const count = document.querySelector("#activityCount");
const form = document.querySelector("#activityForm");
const tabs = document.querySelector("#tabs");
const formFields = document.querySelector("#formFields");
const userForm = document.querySelector("#userForm");
const userTable = document.querySelector("#userTable");

document.querySelector("#loginForm").addEventListener("submit", login);
document.querySelector("#logoutButton").addEventListener("click", logout);
document.querySelectorAll("[data-action='new']").forEach((button) => button.addEventListener("click", createDraft));
document.querySelectorAll("[data-action='back']").forEach((button) => button.addEventListener("click", showList));
document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.view)));
document.querySelector("#saveButton").addEventListener("click", saveForm);
document.querySelector("#editButton").addEventListener("click", () => editActivity(currentId));
document.querySelector("#exportButton").addEventListener("click", exportCurrent);
document.querySelector("#searchInput").addEventListener("input", renderList);
document.querySelector("#statusFilter").addEventListener("change", renderList);
document.querySelector("#userRole").addEventListener("change", applyRoleDefaults);
document.querySelector("#resetUserForm").addEventListener("click", resetUserForm);
userForm.addEventListener("submit", saveUser);
window.addEventListener("hashchange", routeFromHash);

boot();

function boot() {
  persistUsers();
  persistActivities();
  if (currentUser) {
    showApp();
  } else {
    showLogin();
  }
}

function loadUsers() {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) return JSON.parse(stored);
  return [
    makeUser("System Admin", "admin@example.com", "admin123", "Admin", "Central Privacy Office", rolePermissions.Admin),
    makeUser("HR Editor", "editor.hr@example.com", "editor123", "Editor", "Human Resources", rolePermissions.Editor),
    makeUser("IT Viewer", "viewer.it@example.com", "viewer123", "Viewer", "Information Technology", rolePermissions.Viewer),
  ];
}

function loadActivities() {
  const stored = localStorage.getItem(ACTIVITY_KEY);
  if (stored) return JSON.parse(stored);
  const now = new Date().toISOString();
  return [
    {
      id: newId(),
      processName: "ลงทะเบียนผู้เข้าร่วมอบรม",
      department: "ฝ่ายพัฒนาบุคลากร",
      division: "Human Resources",
      owner: "HR Editor",
      dataset: "ข้อมูลผู้เข้าร่วมอบรม",
      purpose: "จัดการรายชื่อผู้เข้าอบรม ออกใบรับรอง และติดตามผลการเข้าร่วม",
      status: "Draft",
      createdBy: "editor.hr@example.com",
      createdAt: now,
      updatedAt: now,
      version: 1,
    },
    {
      id: newId(),
      processName: "จัดการบัญชีผู้ใช้งานระบบ",
      department: "ฝ่ายเทคโนโลยีสารสนเทศ",
      division: "Information Technology",
      owner: "IT Viewer",
      dataset: "บัญชีผู้ใช้งานและสิทธิระบบ",
      purpose: "จัดการการเข้าใช้งานระบบภายในและตรวจสอบสิทธิ",
      status: "Approved",
      createdBy: "admin@example.com",
      createdAt: now,
      updatedAt: now,
      version: 1,
    },
  ];
}

function makeUser(name, email, password, role, division, permissions) {
  return { id: newId(), name, email, password, role, division, permissions: [...permissions], active: true };
}

function getSessionUser() {
  const email = localStorage.getItem(SESSION_KEY);
  return users.find((user) => user.email === email && user.active) || null;
}

function persistUsers() {
  localStorage.setItem(USER_KEY, JSON.stringify(users));
}

function persistActivities() {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
  count.textContent = scopedActivities().length;
}

function login(event) {
  event.preventDefault();
  const email = event.currentTarget.elements.email.value.trim().toLowerCase();
  const password = event.currentTarget.elements.password.value;
  const user = users.find((item) => item.email.toLowerCase() === email && item.password === password && item.active);
  if (!user) {
    document.querySelector("#loginError").textContent = "Email หรือ password ไม่ถูกต้อง หรือ user ถูก disabled";
    return;
  }
  localStorage.setItem(SESSION_KEY, user.email);
  currentUser = user;
  showApp();
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
  currentId = null;
  showLogin();
}

function showLogin() {
  appShell.classList.add("hidden");
  loginView.classList.add("active");
}

function showApp() {
  loginView.classList.remove("active");
  appShell.classList.remove("hidden");
  document.querySelector("#currentUserName").textContent = currentUser.name;
  document.querySelector("#currentUserMeta").textContent = `${currentUser.role} · ${currentUser.division}`;
  document.querySelector("#adminNav").classList.toggle("hidden", !can("manage_users"));
  document.querySelector("#newActivityButton").classList.toggle("hidden", !can("create_activity"));
  document.querySelector("#scopeLabel").textContent = can("view_all_divisions")
    ? "ทุก division"
    : `เฉพาะ division: ${currentUser.division}`;
  renderTabs();
  renderList();
  renderUsers();
  routeFromHash();
}

function navigate(viewName) {
  if (viewName === "admin" && !can("manage_users")) return;
  window.location.hash = viewName === "admin" ? "admin" : "activities";
  routeFromHash();
}

function routeFromHash() {
  if (!currentUser) return;
  const route = window.location.hash.replace("#", "");
  if (route === "admin" && can("manage_users")) {
    setActiveNav("admin");
    renderUsers();
    show(adminView);
    return;
  }
  showList();
}

function show(view) {
  [listView, formView, detailView, adminView].forEach((item) => item.classList.remove("active"));
  view.classList.add("active");
}

function setActiveNav(viewName) {
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  const target = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (target) target.classList.add("active");
}

function showList() {
  currentId = null;
  setActiveNav("list");
  show(listView);
  renderList();
}

function createDraft() {
  if (!can("create_activity")) return;
  currentId = null;
  activeSection = sections[0].id;
  formState = { status: "Draft", division: currentUser.division, owner: currentUser.name };
  form.reset();
  document.querySelector("#formTitle").textContent = "สร้าง Draft";
  document.querySelector("#formMeta").textContent = `Division: ${currentUser.division}`;
  renderTabs();
  renderFields(formState);
  show(formView);
}

function editActivity(id) {
  const activity = getAccessibleActivity(id);
  if (!activity || !can("edit_activity")) return;
  currentId = id;
  activeSection = sections[0].id;
  formState = { ...activity };
  document.querySelector("#formTitle").textContent = activity.processName || "แก้ไข Draft";
  document.querySelector("#formMeta").textContent = `Division ${activity.division} · Version ${activity.version || 1} · ${activity.status || "Draft"}`;
  renderTabs();
  renderFields(formState);
  show(formView);
}

function renderTabs() {
  tabs.innerHTML = sections
    .map((section) => `<button class="tab ${section.id === activeSection ? "active" : ""}" type="button" data-tab="${section.id}">${section.title}</button>`)
    .join("");
  tabs.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      formState = readForm();
      activeSection = button.dataset.tab;
      renderTabs();
      renderFields(formState);
    });
  });
}

function renderFields(activity) {
  const section = sections.find((item) => item.id === activeSection);
  formFields.innerHTML = `<div class="field-grid">${section.fields.map((field) => renderField(field, activity)).join("")}</div>`;
}

function renderField([key, label, type, required, options], activity) {
  const value = activity[key] || (key === "status" ? "Draft" : "");
  const requiredText = required ? " required" : "";
  const full = type === "textarea" ? " full" : "";
  const lockedDivision = key === "division" && !can("view_all_divisions") ? " readonly" : "";
  if (type === "textarea") {
    return `<div class="field${full}"><label for="${key}">${label}</label><textarea id="${key}" name="${key}"${requiredText}>${escapeHtml(value)}</textarea></div>`;
  }
  if (type === "select") {
    return `<div class="field"><label for="${key}">${label}</label><select id="${key}" name="${key}"${requiredText}>${options
      .map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${option || "ไม่ระบุ"}</option>`)
      .join("")}</select></div>`;
  }
  return `<div class="field"><label for="${key}">${label}</label><input id="${key}" name="${key}" type="${type}" value="${escapeHtml(value)}"${requiredText}${lockedDivision} /></div>`;
}

function readForm() {
  const data = { ...formState };
  sections.flatMap((section) => section.fields).forEach(([key]) => {
    const input = form.elements[key];
    if (input) data[key] = input.value.trim();
  });
  if (!can("view_all_divisions")) data.division = currentUser.division;
  return data;
}

function saveForm() {
  if (!can("edit_activity") && currentId) return;
  if (!can("create_activity") && !currentId) return;
  formState = readForm();
  const data = formState;
  if (!data.processName || !data.department || !data.division) {
    activeSection = "overview";
    renderTabs();
    renderFields(data);
    form.reportValidity();
    return;
  }
  if (!canAccessDivision(data.division)) return;
  const now = new Date().toISOString();
  if (currentId) {
    activities = activities.map((item) =>
      item.id === currentId ? { ...data, id: currentId, updatedAt: now, version: (item.version || 1) + 1 } : item
    );
  } else {
    currentId = newId();
    activities.unshift({
      ...data,
      id: currentId,
      createdBy: currentUser.email,
      createdAt: now,
      updatedAt: now,
      version: 1,
    });
  }
  persistActivities();
  formState = {};
  renderDetail(currentId);
}

function scopedActivities() {
  if (!currentUser) return [];
  if (can("view_all_divisions")) return activities;
  return activities.filter((item) => item.division === currentUser.division);
}

function renderList() {
  persistActivities();
  const search = document.querySelector("#searchInput").value.toLowerCase();
  const status = document.querySelector("#statusFilter").value;
  const rows = scopedActivities().filter((item) => {
    const haystack = [item.processName, item.department, item.division, item.dataset].join(" ").toLowerCase();
    return (!search || haystack.includes(search)) && (!status || item.status === status);
  });
  table.innerHTML = rows.length
    ? rows
        .map(
          (item) => `<tr>
            <td><strong>${escapeHtml(item.processName || "Untitled")}</strong></td>
            <td>${escapeHtml(item.department || "-")}</td>
            <td>${escapeHtml(item.division || "-")}</td>
            <td>${escapeHtml(item.dataset || "-")}</td>
            <td><span class="pill ${statusClass(item.status)}">${escapeHtml(item.status || "Draft")}</span></td>
            <td>${formatDate(item.updatedAt)}</td>
            <td><div class="button-row"><button class="secondary" type="button" data-view-id="${item.id}">View</button>${can("edit_activity") ? `<button class="secondary" type="button" data-edit-id="${item.id}">Edit</button>` : ""}</div></td>
          </tr>`
        )
        .join("")
    : `<tr><td colspan="7"><div class="empty-state">ไม่พบกิจกรรมใน division นี้</div></td></tr>`;
  table.querySelectorAll("[data-view-id]").forEach((button) => button.addEventListener("click", () => renderDetail(button.dataset.viewId)));
  table.querySelectorAll("[data-edit-id]").forEach((button) => button.addEventListener("click", () => editActivity(button.dataset.editId)));
}

function renderDetail(id) {
  const activity = getAccessibleActivity(id);
  if (!activity || !can("view_activity")) return;
  currentId = id;
  document.querySelector("#detailTitle").textContent = activity.processName || "Untitled";
  document.querySelector("#detailMeta").textContent = `${activity.department || "ไม่ระบุฝ่ายงาน"} · ${activity.division || "ไม่ระบุ division"} · ${activity.status || "Draft"} · Version ${activity.version || 1}`;
  document.querySelector("#editButton").classList.toggle("hidden", !can("edit_activity"));
  document.querySelector("#detailContent").innerHTML = sections
    .map((section) => {
      const items = section.fields
        .map(([key, label, type]) => {
          const value = activity[key] || "-";
          const full = type === "textarea" ? " full" : "";
          return `<div class="detail-item${full}"><span>${label}</span><p>${escapeHtml(value)}</p></div>`;
        })
        .join("");
      return `<article class="detail-section"><h2>${section.title}</h2><div class="detail-items">${items}</div></article>`;
    })
    .join("");
  show(detailView);
}

function exportCurrent() {
  const activity = getAccessibleActivity(currentId);
  if (!activity) return;
  const blob = new Blob([JSON.stringify(activity, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(activity.processName || "ropa-activity").replace(/[\\/:*?"<>|]/g, "-")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderUsers() {
  if (!can("manage_users")) return;
  renderDivisionList();
  userTable.innerHTML = users
    .map(
      (user) => `<tr>
        <td><strong>${escapeHtml(user.name)}</strong><br><span class="muted">${escapeHtml(user.email)}${user.active ? "" : " · disabled"}</span></td>
        <td>${escapeHtml(user.division)}</td>
        <td><span class="pill">${escapeHtml(user.role)}</span></td>
        <td>${escapeHtml(user.permissions.join(", "))}</td>
        <td><div class="button-row"><button class="secondary" type="button" data-user-edit="${user.id}">Edit</button></div></td>
      </tr>`
    )
    .join("");
  userTable.querySelectorAll("[data-user-edit]").forEach((button) => button.addEventListener("click", () => editUser(button.dataset.userEdit)));
}

function saveUser(event) {
  event.preventDefault();
  if (!can("manage_users")) return;
  const formData = new FormData(userForm);
  const id = formData.get("id") || newId();
  const permissions = formData.getAll("permissions");
  const nextUser = {
    id,
    name: formData.get("name").trim(),
    email: formData.get("email").trim().toLowerCase(),
    password: formData.get("password").trim(),
    division: formData.get("division").trim(),
    role: formData.get("role"),
    active: formData.get("active") === "true",
    permissions,
  };
  const duplicate = users.some((user) => user.email === nextUser.email && user.id !== id);
  if (duplicate) {
    alert("Email นี้มีอยู่แล้ว");
    return;
  }
  users = users.some((user) => user.id === id) ? users.map((user) => (user.id === id ? nextUser : user)) : [nextUser, ...users];
  persistUsers();
  if (currentUser.id === id) currentUser = nextUser;
  resetUserForm();
  renderUsers();
}

function editUser(id) {
  const user = users.find((item) => item.id === id);
  if (!user) return;
  userForm.elements.id.value = user.id;
  userForm.elements.name.value = user.name;
  userForm.elements.email.value = user.email;
  userForm.elements.password.value = user.password;
  userForm.elements.division.value = user.division;
  userForm.elements.role.value = user.role;
  userForm.elements.active.value = String(user.active);
  setPermissionChecks(user.permissions);
  document.querySelector("#userFormTitle").textContent = "แก้ไข User";
}

function resetUserForm() {
  userForm.reset();
  userForm.elements.id.value = "";
  userForm.elements.role.value = "Editor";
  userForm.elements.active.value = "true";
  applyRoleDefaults();
  document.querySelector("#userFormTitle").textContent = "สร้าง User";
}

function applyRoleDefaults() {
  setPermissionChecks(rolePermissions[userForm.elements.role.value] || []);
}

function setPermissionChecks(permissions) {
  userForm.querySelectorAll("input[name='permissions']").forEach((input) => {
    input.checked = permissions.includes(input.value);
  });
}

function renderDivisionList() {
  const divisions = [...new Set([...users.map((user) => user.division), ...activities.map((activity) => activity.division)].filter(Boolean))].sort();
  document.querySelector("#divisionList").innerHTML = divisions.map((division) => `<option value="${escapeHtml(division)}"></option>`).join("");
}

function getAccessibleActivity(id) {
  const activity = activities.find((item) => item.id === id);
  if (!activity || !canAccessDivision(activity.division)) return null;
  return activity;
}

function can(permission) {
  return Boolean(currentUser && currentUser.permissions.includes(permission));
}

function canAccessDivision(division) {
  return can("view_all_divisions") || division === currentUser.division;
}

function statusClass(status) {
  return String(status || "Draft").replace(/\s+/g, "");
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function newId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `ropa-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
