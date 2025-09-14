const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Initialize Charts
const pieCtx = document.getElementById("pieChart");
const barCtx = document.getElementById("barChart");

let pieChart, barChart;

const filterCategory = document.getElementById("filter-category");
const filterMonth = document.getElementById("filter-month");
const clearFiltersBtn = document.getElementById("clear-filters");
const sortBy = document.getElementById("sort-by");

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function renderExpenses() {
  list.innerHTML = "";
  let total = 0;

  // Apply filters
  let filteredExpenses = expenses.filter(exp => {
    let categoryMatch = filterCategory.value === "" || exp.category === filterCategory.value;
    let monthMatch = filterMonth.value === "" || exp.date.startsWith(filterMonth.value);
    return categoryMatch && monthMatch;
  });

  // Apply sorting
  const sortBy = document.getElementById("sort-by").value;
  if (sortBy) {
    filteredExpenses.sort((a, b) => {
      if (sortBy === "date-asc") return a.date.localeCompare(b.date);
      if (sortBy === "date-desc") return b.date.localeCompare(a.date);
      if (sortBy === "amount-asc") return a.amount - b.amount;
      if (sortBy === "amount-desc") return b.amount - a.amount;
      return 0;
    });
  }

  filteredExpenses.forEach((exp, index) => {
    total += exp.amount;
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${exp.title}</td>
      <td>₹${exp.amount}</td>
      <td>${exp.category}</td>
      <td>${exp.date}</td>
      <td><button onclick="deleteExpense(${index})">❌</button></td>
    `;
    list.appendChild(row);
  });
  document.getElementById("total-expense").textContent = total.toFixed(2);
  updateCharts(filteredExpenses);
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  saveExpenses();
  renderExpenses();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const newExp = {
    title: document.getElementById("title").value,
    amount: parseFloat(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    date: document.getElementById("date").value
  };
  expenses.push(newExp);
  saveExpenses();
  renderExpenses();
  form.reset();
});

// Add event listeners for filters and sorting
filterCategory.addEventListener("change", renderExpenses);
filterMonth.addEventListener("change", renderExpenses);
sortBy.addEventListener("change", renderExpenses);
clearFiltersBtn.addEventListener("click", () => {
  filterCategory.value = "";
  filterMonth.value = "";
  sortBy.value = "";
  renderExpenses();
});

function updateCharts() {
  let categoryTotals = {};
  let monthlyTotals = {};

  expenses.forEach(exp => {
    // Category totals
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;

    // Monthly totals
    let month = exp.date.slice(0, 7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
  });

  // Pie Chart
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ["#f87171","#60a5fa","#34d399","#fbbf24","#a78bfa"]
      }]
    }
  });

  // Bar Chart
  if (barChart) barChart.destroy();
  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: Object.keys(monthlyTotals),
      datasets: [{
        label: "Monthly Expenses",
        data: Object.values(monthlyTotals),
        backgroundColor: "#60a5fa"
      }]
    }
  });
}

// Initial Render
renderExpenses();