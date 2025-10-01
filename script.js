// State management
let activeTab = "notes";
let darkMode = false;

// Notes state
let notes = [];
let editingNoteId = null; // used for edit flows

// Products + sample data
let products = [
  {
    id: 1,
    name: "Mathematics Textbook",
    description: "Comprehensive math textbook for university students",
    category: "books",
    price: 49.99,
    rating: 4.5,
    image: "https://picsum.photos/seed/mathbook/600/400",
  },
  {
    id: 2,
    name: "Premium Notebook Set",
    description: "Set of 3 high-quality notebooks for note-taking",
    category: "stationery",
    price: 19.99,
    rating: 4.8,
    image: "https://picsum.photos/seed/notebooks/600/400",
  },
  {
    id: 3,
    name: "Wireless Earbuds",
    description: "Noise-cancelling wireless earbuds for studying",
    category: "gadgets",
    price: 89.99,
    rating: 4.3,
    image: "https://picsum.photos/seed/earbuds/600/400",
  },
  {
    id: 4,
    name: "Programming Course",
    description: "Complete web development course for beginners",
    category: "courses",
    price: 129.99,
    rating: 4.7,
    image: "https://picsum.photos/seed/course/600/400",
  },
  {
    id: 5,
    name: "Scientific Calculator",
    description: "Advanced scientific calculator for engineering students",
    category: "gadgets",
    price: 34.99,
    rating: 4.6,
    image: "https://picsum.photos/seed/calculator/600/400",
  },
  {
    id: 6,
    name: "Study Planner",
    description: "Academic year planner with weekly schedules",
    category: "stationery",
    price: 14.99,
    rating: 4.4,
    image: "https://picsum.photos/seed/planner/600/400",
  },
];

// Todos state
let todos = [];

// Initialize the application
function init() {
  loadFromLocalStorage();
  setupEventListeners();
  renderContent();
  checkOverdueTodos();
  // Periodically check overdue every minute
  setInterval(checkOverdueTodos, 60 * 1000);
}

// LocalStorage functions
function saveToLocalStorage() {
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("todos", JSON.stringify(todos));
  localStorage.setItem("darkMode", darkMode);
}

function loadFromLocalStorage() {
  const savedNotes = localStorage.getItem("notes");
  const savedTodos = localStorage.getItem("todos");
  const savedDarkMode = localStorage.getItem("darkMode");

  if (savedNotes) notes = JSON.parse(savedNotes);
  if (savedTodos) todos = JSON.parse(savedTodos);
  if (savedDarkMode) darkMode = savedDarkMode === "true";

  if (darkMode) {
    document.body.classList.add("bg-gray-900");
    document.body.classList.remove("bg-gray-50");
    document.getElementById("dark-mode-toggle").textContent = "☀️";
  }
}

// Event listeners setup
function setupEventListeners() {
  // Navigation
  document
    .getElementById("nav-notes")
    .addEventListener("click", () => switchTab("notes"));
  document
    .getElementById("nav-products")
    .addEventListener("click", () => switchTab("products"));
  document
    .getElementById("nav-todos")
    .addEventListener("click", () => switchTab("todos"));

  // Dark mode toggle
  document
    .getElementById("dark-mode-toggle")
    .addEventListener("click", toggleDarkMode);

  // Search and filter inputs
  document.getElementById("note-search").addEventListener("input", renderNotes);
  document.getElementById("note-sort").addEventListener("change", renderNotes);
  document
    .getElementById("product-search")
    .addEventListener("input", renderProducts);
  document
    .getElementById("product-category-filter")
    .addEventListener("change", renderProducts);
  document
    .getElementById("product-sort")
    .addEventListener("change", renderProducts);
  document
    .getElementById("todo-filter")
    .addEventListener("change", renderTodos);
  document.getElementById("todo-sort").addEventListener("change", renderTodos);
}

// Tab switching
function switchTab(tab) {
  activeTab = tab;

  // Update navigation buttons style
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active", "text-blue-600", "bg-blue-100");
    btn.classList.add("text-gray-600");
  });
  const activeBtn = document.getElementById(`nav-${tab}`);
  if (activeBtn) {
    activeBtn.classList.add("active", "text-blue-600", "bg-blue-100");
    activeBtn.classList.remove("text-gray-600");
  }

  // Show/hide content sections
  document
    .querySelectorAll(".content-section")
    .forEach((section) => section.classList.add("hidden"));
  const show = document.getElementById(`${tab}-section`);
  if (show) show.classList.remove("hidden");

  renderContent();
}

// Dark mode toggle
function toggleDarkMode() {
  darkMode = !darkMode;
  const toggleBtn = document.getElementById("dark-mode-toggle");

  if (darkMode) {
    document.body.classList.add("bg-gray-900");
    document.body.classList.remove("bg-gray-50");
    toggleBtn.textContent = "☀️";
  } else {
    document.body.classList.add("bg-gray-50");
    document.body.classList.remove("bg-gray-900");
    toggleBtn.textContent = "🌙";
  }

  saveToLocalStorage();
}

// ---------- Notes functionality ----------

// Override addNote to support edit mode (editingNoteId)
function addNote() {
  const titleEl = document.getElementById("note-title");
  const contentEl = document.getElementById("note-content");
  const categoryEl = document.getElementById("note-category");
  const tagsInputEl = document.getElementById("note-tags");

  const title = titleEl.value.trim();
  const content = contentEl.innerHTML.trim();
  const category = categoryEl.value;
  const tagsInput = tagsInputEl.value;
  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  if (!title || !content) {
    alert("Please fill in both title and content");
    return;
  }

  const nowISO = new Date().toISOString();

  if (editingNoteId) {
    // Update existing
    const idx = notes.findIndex((n) => n.id === editingNoteId);
    if (idx !== -1) {
      notes[idx].title = title;
      notes[idx].content = content;
      notes[idx].category = category;
      notes[idx].tags = tags;
      notes[idx].updatedAt = nowISO;
    }
    editingNoteId = null;
    document.getElementById("note-form-heading").textContent =
      "Create New Note";
    document.getElementById("note-save-btn").textContent = "Save Note";
  } else {
    // New
    const newNote = {
      id: Date.now(),
      title,
      content,
      category,
      tags,
      createdAt: nowISO,
      updatedAt: nowISO,
      pinned: false,
    };
    notes.unshift(newNote);
  }

  saveToLocalStorage();
  renderNotes();
  clearNoteForm();
}

function clearNoteForm() {
  document.getElementById("note-title").value = "";
  document.getElementById("note-content").innerHTML = "";
  document.getElementById("note-tags").value = "";
  document.getElementById("note-category").value = "Study";
  editingNoteId = null;
  document.getElementById("note-form-heading").textContent = "Create New Note";
  document.getElementById("note-save-btn").textContent = "Save Note";
}

function renderNotes() {
  const searchTerm = document.getElementById("note-search").value.toLowerCase();
  const sortBy = document.getElementById("note-sort").value;

  let filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
      note.category.toLowerCase().includes(searchTerm)
  );

  // Sort notes
  filteredNotes.sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "date-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Put pinned notes first
  filteredNotes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const notesList = document.getElementById("notes-list");
  notesList.innerHTML = "";

  if (filteredNotes.length === 0) {
    notesList.innerHTML =
      '<p class="text-gray-500 text-center py-8">No notes found</p>';
    return;
  }

  filteredNotes.forEach((note) => {
    const noteElement = document.createElement("div");
    noteElement.className = `p-4 rounded-lg border ${
      note.pinned ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
    }`;
    noteElement.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-lg">${escapeHtml(
                          note.title
                        )}</h3>
                        <div class="flex space-x-2">
                            <button onclick="togglePinNote(${
                              note.id
                            })" title="${
      note.pinned ? "Unpin" : "Pin"
    }" class="text-${note.pinned ? "blue" : "gray"}-600 hover:text-blue-800">
                                ${note.pinned ? "📌" : "📍"}
                            </button>
                            <button onclick="editNote(${
                              note.id
                            })" title="Edit" class="text-gray-600 hover:text-blue-600">✏️</button>
                            <button onclick="deleteNote(${
                              note.id
                            })" title="Delete" class="text-gray-600 hover:text-red-600">🗑️</button>
                        </div>
                    </div>
                    <div class="text-sm text-gray-600 mb-2">
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">${escapeHtml(
                          note.category
                        )}</span>
                        ${note.tags
                          .map(
                            (tag) =>
                              `<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs ml-1">${escapeHtml(
                                tag
                              )}</span>`
                          )
                          .join("")}
                    </div>
                    <div class="prose prose-sm max-w-none mb-2">${
                      note.content
                    }</div>
                    <div class="text-xs text-gray-500">
                        Created: ${new Date(note.createdAt).toLocaleString()} | 
                        Updated: ${new Date(note.updatedAt).toLocaleString()}
                    </div>
                `;
    notesList.appendChild(noteElement);
  });
}

function togglePinNote(id) {
  const noteIndex = notes.findIndex((note) => note.id === id);
  if (noteIndex !== -1) {
    notes[noteIndex].pinned = !notes[noteIndex].pinned;
    saveToLocalStorage();
    renderNotes();
  }
}

function editNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  editingNoteId = id;
  document.getElementById("note-title").value = note.title;
  document.getElementById("note-content").innerHTML = note.content;
  document.getElementById("note-category").value = note.category;
  document.getElementById("note-tags").value = note.tags.join(", ");
  document.getElementById("note-form-heading").textContent = "Edit Note";
  document.getElementById("note-save-btn").textContent = "Update Note";
  // Switch to notes tab if not active
  if (activeTab !== "notes") switchTab("notes");
  // scroll to top of form
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteNote(id) {
  if (confirm("Are you sure you want to delete this note?")) {
    notes = notes.filter((note) => note.id !== id);
    saveToLocalStorage();
    renderNotes();
  }
}

// Rich text formatting
function formatText(format) {
  document.execCommand(format, false, null);
}

function insertBulletList() {
  document.execCommand("insertUnorderedList", false, null);
}

// ---------- Products functionality ----------
function renderProducts() {
  const searchTerm = document
    .getElementById("product-search")
    .value.toLowerCase();
  const categoryFilter = document.getElementById(
    "product-category-filter"
  ).value;
  const sortBy = document.getElementById("product-sort").value;

  let filteredProducts = products.filter(
    (product) =>
      (categoryFilter === "all" || product.category === categoryFilter) &&
      (product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm))
  );

  // Sort products
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const productsGrid = document.getElementById("products-grid");
  productsGrid.innerHTML = "";

  filteredProducts.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.className =
      "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col";
    productElement.innerHTML = `
                    <img src="${product.image}" alt="${escapeHtml(
      product.name
    )}" class="w-full h-48 object-cover">
                    <div class="p-4 flex-1 flex flex-col">
                        <div class="flex justify-between items-start">
                            <h3 class="font-semibold text-lg mb-2">${escapeHtml(
                              product.name
                            )}</h3>
                            <div class="text-sm text-yellow-500 font-semibold">${"★".repeat(
                              Math.round(product.rating)
                            )}</div>
                        </div>
                        <p class="text-gray-600 mb-3 flex-1">${escapeHtml(
                          product.description
                        )}</p>
                        <div class="mt-2 flex items-center justify-between">
                            <div class="text-sm text-gray-700 font-semibold">₹${product.price.toFixed(
                              2
                            )}</div>
                            <button onclick="viewProduct(${
                              product.id
                            })" class="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">View</button>
                        </div>
                    </div>
                `;
    productsGrid.appendChild(productElement);
  });

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML =
      '<p class="text-gray-500 text-center col-span-full py-8">No products found</p>';
  }
}

// product view placeholder (optional enhancement)
function viewProduct(id) {
  const p = products.find((pr) => pr.id === id);
  if (!p) return;
  alert(
    `${p.name}\n\nPrice: ₹${p.price}\nRating: ${p.rating}\n\n${p.description}`
  );
}

// ---------- Todos functionality ----------
function addTodo() {
  const title = document.getElementById("todo-title").value.trim();
  const description = document.getElementById("todo-description").value.trim();
  const dueDate = document.getElementById("todo-due-date").value; // yyyy-mm-dd
  const category = document.getElementById("todo-category").value;
  const priority = document.getElementById("todo-priority").value;

  if (!title) {
    alert("Please enter a task title.");
    return;
  }

  const newTodo = {
    id: Date.now(),
    title,
    description,
    dueDate: dueDate || null,
    category,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.unshift(newTodo);
  saveToLocalStorage();
  renderTodos();
  clearTodoForm();
}

function clearTodoForm() {
  document.getElementById("todo-title").value = "";
  document.getElementById("todo-description").value = "";
  document.getElementById("todo-due-date").value = "";
  document.getElementById("todo-category").value = "Study";
  document.getElementById("todo-priority").value = "low";
}

function renderTodos() {
  const filter = document.getElementById("todo-filter").value;
  const sortBy = document.getElementById("todo-sort").value;
  const listEl = document.getElementById("todos-list");

  let filtered = todos.slice(); // copy

  // Filter
  const now = new Date();
  filtered = filtered.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "pending") return !todo.completed;
    if (filter === "completed") return todo.completed;
    if (filter === "today") {
      if (!todo.dueDate) return false;
      const due = new Date(todo.dueDate + "T23:59:59");
      return due.toDateString() === now.toDateString();
    }
    if (filter === "week") {
      if (!todo.dueDate) return false;
      const due = new Date(todo.dueDate + "T23:59:59");
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }
    if (filter === "overdue") {
      if (!todo.dueDate) return false;
      const due = new Date(todo.dueDate + "T23:59:59");
      return !todo.completed && due < now;
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "date-asc":
        return compareDates(a.dueDate, b.dueDate);
      case "date-desc":
        return compareDates(b.dueDate, a.dueDate);
      case "priority":
        return priorityWeight(b.priority) - priorityWeight(a.priority);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  listEl.innerHTML = "";
  if (filtered.length === 0) {
    listEl.innerHTML =
      '<p class="text-gray-500 text-center py-8">No tasks to show</p>';
    return;
  }

  filtered.forEach((todo) => {
    const dueText = todo.dueDate
      ? new Date(todo.dueDate).toLocaleDateString()
      : "No due date";
    const todoEl = document.createElement("div");
    const overdueClass =
      todo.dueDate &&
      !todo.completed &&
      new Date(todo.dueDate + "T23:59:59") < new Date()
        ? "overdue"
        : "";
    todoEl.className = `p-4 rounded-lg border bg-white border-gray-200 flex justify-between items-start ${overdueClass}`;
    todoEl.innerHTML = `
                    <div>
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" ${
                              todo.completed ? "checked" : ""
                            } onclick="toggleTodoComplete(${
      todo.id
    })" class="w-4 h-4">
                            <div>
                                <div class="font-semibold ${
                                  todo.completed
                                    ? "line-through text-gray-400"
                                    : ""
                                }">${escapeHtml(todo.title)}</div>
                                <div class="text-sm text-gray-500">${escapeHtml(
                                  todo.description
                                )}</div>
                                <div class="text-xs text-gray-500 mt-1">Due: ${dueText} • ${escapeHtml(
      todo.category
    )} • Priority: ${escapeHtml(todo.priority)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-end space-y-2">
                        <button onclick="editTodoPrompt(${
                          todo.id
                        })" class="text-sm text-gray-600 hover:text-blue-600">✏️</button>
                        <button onclick="deleteTodo(${
                          todo.id
                        })" class="text-sm text-gray-600 hover:text-red-600">🗑️</button>
                    </div>
                `;
    listEl.appendChild(todoEl);
  });
}

function compareDates(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(a) - new Date(b);
}

function priorityWeight(p) {
  return p === "high" ? 3 : p === "medium" ? 2 : 1;
}

function toggleTodoComplete(id) {
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) return;
  todos[idx].completed = !todos[idx].completed;
  saveToLocalStorage();
  renderTodos();
}

function deleteTodo(id) {
  if (!confirm("Delete this task?")) return;
  todos = todos.filter((t) => t.id !== id);
  saveToLocalStorage();
  renderTodos();
}

function editTodoPrompt(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  // populate form with todo and remove original
  document.getElementById("todo-title").value = todo.title;
  document.getElementById("todo-description").value = todo.description;
  document.getElementById("todo-due-date").value = todo.dueDate || "";
  document.getElementById("todo-category").value = todo.category;
  document.getElementById("todo-priority").value = todo.priority;
  // remove the todo to be replaced on save
  todos = todos.filter((t) => t.id !== id);
  saveToLocalStorage();
  renderTodos();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function checkOverdueTodos() {
  // highlight overdue tasks visually via renderTodos (overdue class)
  renderTodos();
}

// ---------- Utilities ----------
function renderContent() {
  // Render whatever is needed for current tab
  renderNotes();
  renderProducts();
  renderTodos();
}

// Small html escape to avoid any accidental injection in plain fields (content intentionally left as HTML)
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Initialize app on load
window.addEventListener("load", init);
