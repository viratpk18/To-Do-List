const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDateInput");
const taskList = document.getElementById("taskList");
const addBtn = document.getElementById("addBtn");
const filterBtns = document.querySelectorAll(".filters button");
const themeToggle = document.getElementById("themeToggle");
const exportBtn = document.getElementById("exportBtn");
const toast = document.getElementById("toast");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filter = "all";

// Show Toast
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Save Tasks
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render Tasks
function renderTasks() {
  taskList.innerHTML = "";
  exportBtn.disabled = tasks.length === 0;

  const filteredTasks = tasks.filter(task =>
    filter === "all" ? true :
    filter === "active" ? !task.completed :
    task.completed
  );

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      tasks[index].completed = checkbox.checked;
      tasks[index].completedAt = checkbox.checked ? new Date().toISOString() : null;
      saveTasks();
      renderTasks();
    });

    const span = document.createElement("span");
    span.textContent = task.text;
    if (task.dueDate) {
      const date = document.createElement("small");
      date.textContent = ` (Due: ${task.dueDate})`;
      date.style.marginLeft = "5px";
      span.appendChild(date);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.background = "#e74c3c";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.append(checkbox, span, deleteBtn);
    taskList.appendChild(li);
  });
}

// Add Task
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (text === "") {
    showToast("⚠️ Please enter a task.");
    return;
  }

  const assignedAt = new Date().toISOString();

  tasks.push({ text, completed: false, dueDate, assignedAt, completedAt: null });
  taskInput.value = "";
  dueDateInput.value = "";
  saveTasks();
  renderTasks();
});

// Filter Buttons
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    renderTasks();
  });
});

// Export as PDF
exportBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("To-Do Task Report", 105, 15, null, null, "center");

  const completedTasks = tasks.filter(task => task.completed);
  const uncompletedTasks = tasks.filter(task => !task.completed);

  // Completed Tasks Table
  doc.setFontSize(14);
  doc.text("Completed Tasks", 14, 30);

  const completedTable = completedTasks.map((task, i) => [
    i + 1,
    task.text,
    task.assignedAt ? new Date(task.assignedAt).toLocaleString() : "N/A",
    task.completedAt ? new Date(task.completedAt).toLocaleString() : "N/A"
  ]);

  doc.autoTable({
    head: [["S.No", "Task Name", "Assigned At", "Completed At"]],
    body: completedTable,
    startY: 35,
    theme: "striped",
    styles: { halign: "left" },
  });

  const uncompletedStartY = doc.lastAutoTable.finalY + 10;

  // Uncompleted Tasks Table
  doc.text("Uncompleted Tasks", 14, uncompletedStartY);

  const uncompletedTable = uncompletedTasks.map((task, i) => [
    i + 1,
    task.text,
    task.assignedAt ? new Date(task.assignedAt).toLocaleString() : "N/A",
    task.dueDate || "N/A"
  ]);

  doc.autoTable({
    head: [["S.No", "Task Name", "Assigned At", "Due Date"]],
    body: uncompletedTable,
    startY: uncompletedStartY + 5,
    theme: "striped",
    styles: { halign: "left" },
  });

  doc.save("tasks.pdf");
});

// Dark Mode
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Initial Render
renderTasks();
