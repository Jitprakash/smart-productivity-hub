// --------------------------
// Shared Helpers
// --------------------------
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m];
  });
}

// --------------------------
// Dark Mode Toggle
// --------------------------
const darkModeBtn = document.getElementById("dark-mode-toggle");
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// --------------------------
// Navigation
// --------------------------
const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    navBtns.forEach((b) =>
      b.classList.remove("active", "bg-blue-100", "text-blue-600")
    );
    btn.classList.add("active", "bg-blue-100", "text-blue-600");

    sections.forEach((sec) => sec.classList.add("hidden"));
    if (btn.id === "nav-notes")
      document.getElementById("notes-section").classList.remove("hidden");
    else if (btn.id === "nav-products")
      document.getElementById("products-section").classList.remove("hidden");
    else if (btn.id === "nav-todos")
      document.getElementById("todos-section").classList.remove("hidden");
  });
});

// --------------------------
// Notes Module
// --------------------------
let notes = [];
let editingNoteId = null;

function formatText(command) {
  document.execCommand(command);
}

function insertBulletList() {
  document.execCommand("insertUnorderedList");
}

function addNote() {
  const title = document.getElementById("note-title").value.trim();
  const content = document.getElementById("note-content").innerHTML.trim();
  const category = document.getElementById("note-category").value;
  const tags = document
    .getElementById("note-tags")
    .value.split(",")
    .map((t) => t.trim())
    .filter((t) => t);

  if (!title || !content) return alert("Title and Content are required.");

  const nowISO = new Date().toISOString();
  if (editingNoteId) {
    const idx = notes.findIndex((n) => n.id === editingNoteId);
    if (idx !== -1) {
      notes[idx] = {
        ...notes[idx],
        title,
        content,
        category,
        tags,
        updatedAt: nowISO,
      };
    }
    editingNoteId = null;
    document.getElementById("note-form-heading").textContent =
      "Create New Note";
    document.getElementById("note-save-btn").textContent = "Save Note";
  } else {
    notes.unshift({
      id: Date.now(),
      title,
      content,
      category,
      tags,
      createdAt: nowISO,
    });
  }

  saveNotes();
  renderNotes();
  clearNoteForm();
}

function editNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  editingNoteId = id;
  document.getElementById("note-title").value = note.title;
  document.getElementById("note-category").value = note.category;
  document.getElementById("note-tags").value = note.tags.join(", ");
  document.getElementById("note-content").innerHTML = note.content;
  document.getElementById("note-form-heading").textContent = "Edit Note";
  document.getElementById("note-save-btn").textContent = "Update Note";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  notes = notes.filter((n) => n.id !== id);
  saveNotes();
  renderNotes();
}

function clearNoteForm() {
  document.getElementById("note-title").value = "";
  document.getElementById("note-category").value = "Study";
  document.getElementById("note-tags").value = "";
  document.getElementById("note-content").innerHTML = "";
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function loadNotes() {
  const saved = localStorage.getItem("notes");
  if (saved) notes = JSON.parse(saved);
}

function renderNotes() {
  const container = document.getElementById("notes-list");
  container.innerHTML = "";
  const searchTerm =
    document.getElementById("note-search")?.value?.toLowerCase() || "";
  const sortOption = document.getElementById("note-sort")?.value || "date-desc";

  let filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm) ||
      n.content.toLowerCase().includes(searchTerm)
  );

  if (sortOption === "date-desc")
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortOption === "date-asc")
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sortOption === "title")
    filtered.sort((a, b) => a.title.localeCompare(b.title));

  filtered.forEach((note) => {
    const el = document.createElement("div");
    el.className = "bg-gray-50 p-4 rounded-md shadow flex flex-col";
    el.innerHTML = `
                    <div class="flex justify-between items-start">
                        <h3 class="font-semibold text-lg">${escapeHtml(
                          note.title
                        )}</h3>
                        <div class="space-x-2">
                            <button onclick="editNote(${
                              note.id
                            })" class="text-sm bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600">Edit</button>
                            <button onclick="deleteNote(${
                              note.id
                            })" class="text-sm bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                    <div class="mt-2 text-sm text-gray-600">${escapeHtml(
                      note.category
                    )} | ${note.tags.join(", ")}</div>
                    <div class="mt-2 text-gray-800">${note.content}</div>
                `;
    container.appendChild(el);
  });
}

document.getElementById("note-search")?.addEventListener("input", renderNotes);
document.getElementById("note-sort")?.addEventListener("change", renderNotes);

// --------------------------
// Products Module
// --------------------------
let products = [];
let editingProductId = null;

function addOrUpdateProduct() {
  const name = document.getElementById("product-name").value.trim();
  const category = document.getElementById("product-category").value;
  const price = parseFloat(document.getElementById("product-price").value);
  const rating = parseFloat(document.getElementById("product-rating").value);
  const description = document
    .getElementById("product-description")
    .value.trim();
  const image =
    document.getElementById("product-image").value.trim() ||
    "https://picsum.photos/600/400";

  if (!name || isNaN(price) || isNaN(rating))
    return alert("Please provide valid name, price, and rating.");

  const nowISO = new Date().toISOString();

  if (editingProductId) {
    const idx = products.findIndex((p) => p.id === editingProductId);
    if (idx !== -1) {
      products[idx] = {
        id: editingProductId,
        name,
        category,
        price,
        rating,
        description,
        image,
        updatedAt: nowISO,
      };
    }
    editingProductId = null;
    document.getElementById("product-form-heading").textContent =
      "Add New Product";
    document.getElementById("product-save-btn").textContent = "Save Product";
  } else {
    const newProduct = {
      id: Date.now(),
      name,
      category,
      price,
      rating,
      description,
      image,
      createdAt: nowISO,
    };
    products.unshift(newProduct);
  }

  saveProducts();
  renderProducts();
  clearProductForm();
}

function clearProductForm() {
  document.getElementById("product-name").value = "";
  document.getElementById("product-category").value = "books";
  document.getElementById("product-price").value = "";
  document.getElementById("product-rating").value = "";
  document.getElementById("product-description").value = "";
  document.getElementById("product-image").value = "";
}

function editProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  editingProductId = id;
  document.getElementById("product-name").value = product.name;
  document.getElementById("product-category").value = product.category;
  document.getElementById("product-price").value = product.price;
  document.getElementById("product-rating").value = product.rating;
  document.getElementById("product-description").value = product.description;
  document.getElementById("product-image").value = product.image;

  document.getElementById("product-form-heading").textContent = "Edit Product";
  document.getElementById("product-save-btn").textContent = "Update Product";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  products = products.filter((p) => p.id !== id);
  saveProducts();
  renderProducts();
}

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function loadProducts() {
  const saved = localStorage.getItem("products");
  if (saved) products = JSON.parse(saved);
}

function renderProducts() {
  const container = document.getElementById("products-list");
  container.innerHTML = "";
  const searchTerm =
    document.getElementById("product-search")?.value?.toLowerCase() || "";
  const categoryFilter =
    document.getElementById("product-category-filter")?.value || "all";
  const sortOption = document.getElementById("product-sort")?.value || "newest";

  let filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm)
  );
  if (categoryFilter !== "all")
    filtered = filtered.filter((p) => p.category === categoryFilter);

  if (sortOption === "newest")
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortOption === "price-asc")
    filtered.sort((a, b) => a.price - b.price);
  else if (sortOption === "price-desc")
    filtered.sort((a, b) => b.price - a.price);
  else if (sortOption === "rating")
    filtered.sort((a, b) => b.rating - a.rating);

  filtered.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.className =
      "bg-gray-50 rounded-lg shadow-md overflow-hidden flex flex-col";
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
                            <div class="flex space-x-2">
                                <button onclick="editProduct(${
                                  product.id
                                })" class="text-sm bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600">Edit</button>
                                <button onclick="deleteProduct(${
                                  product.id
                                })" class="text-sm bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
    container.appendChild(productElement);
  });
}

document
  .getElementById("product-search")
  ?.addEventListener("input", renderProducts);
document
  .getElementById("product-category-filter")
  ?.addEventListener("change", renderProducts);
document
  .getElementById("product-sort")
  ?.addEventListener("change", renderProducts);

// --------------------------
// To-Dos Module
// --------------------------
let todos = [];

function addTodo() {
  const title = document.getElementById("todo-title").value.trim();
  const dueDate = document.getElementById("todo-due-date").value;
  const category = document.getElementById("todo-category").value;

  if (!title || !dueDate) return alert("Title and Due Date required.");

  todos.unshift({ id: Date.now(), title, dueDate, category, completed: false });
  saveTodos();
  renderTodos();
  document.getElementById("todo-title").value = "";
  document.getElementById("todo-due-date").value = "";
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  if (!confirm("Delete this task?")) return;
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  const saved = localStorage.getItem("todos");
  if (saved) todos = JSON.parse(saved);
}

function renderTodos() {
  const container = document.getElementById("todos-list");
  container.innerHTML = "";
  const searchTerm =
    document.getElementById("todo-search")?.value?.toLowerCase() || "";
  const sortOption = document.getElementById("todo-sort")?.value || "newest";

  let filtered = todos.filter((t) =>
    t.title.toLowerCase().includes(searchTerm)
  );

  if (sortOption === "newest") filtered.sort((a, b) => b.id - a.id);
  else if (sortOption === "oldest") filtered.sort((a, b) => a.id - b.id);
  else if (sortOption === "due-soon")
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  filtered.forEach((todo) => {
    const overdue = !todo.completed && new Date(todo.dueDate) < new Date();
    const el = document.createElement("div");
    el.className = `flex justify-between items-center p-3 rounded-md ${
      overdue ? "overdue" : ""
    } bg-gray-50 shadow`;
    el.innerHTML = `
                    <div>
                        <input type="checkbox" ${
                          todo.completed ? "checked" : ""
                        } onclick="toggleTodo(${todo.id})">
                        <span class="ml-2 ${
                          todo.completed ? "line-through text-gray-400" : ""
                        }">${escapeHtml(todo.title)}</span>
                        <span class="ml-2 text-sm text-gray-500">(${
                          todo.category
                        } | ${todo.dueDate})</span>
                    </div>
                    <button onclick="deleteTodo(${
                      todo.id
                    })" class="text-sm bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">Delete</button>
                `;
    container.appendChild(el);
  });
}

document.getElementById("todo-search")?.addEventListener("input", renderTodos);
document.getElementById("todo-sort")?.addEventListener("change", renderTodos);

// --------------------------
// Load all data
// --------------------------
loadNotes();
renderNotes();
loadProducts();
renderProducts();
loadTodos();
renderTodos();
