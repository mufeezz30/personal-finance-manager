document.addEventListener("DOMContentLoaded", () => {
    const descriptionInput = document.getElementById("transaction-description");
    const amountInput = document.getElementById("transaction-amount");
    const categorySelect = document.getElementById("transaction-category");
    const addTransactionBtn = document.getElementById("add-transaction-btn");
    const totalIncomeElem = document.getElementById("total-income");
    const totalExpenseElem = document.getElementById("total-expense");
    const balanceElem = document.getElementById("balance");
    const transactionListUl = document.getElementById("transaction-list-ul");
    const transactionChart = document.getElementById("transaction-chart");

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // Function to update the summary
    function updateSummary() {
        const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expense;

        totalIncomeElem.textContent = income.toFixed(2);
        totalExpenseElem.textContent = expense.toFixed(2);
        balanceElem.textContent = balance.toFixed(2);

        updateChart();
    }

    // Function to update the chart
    function updateChart() {
        const categories = ["Salary", "Food", "Entertainment", "Rent", "Others"];
        const categoryAmounts = categories.map(category => {
            return transactions.filter(t => t.category === category).reduce((sum, t) => sum + t.amount, 0);
        });

        const ctx = transactionChart.getContext("2d");
        if (window.barChart) window.barChart.destroy(); // Clear previous chart if exists
        window.barChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: categories,
                datasets: [{
                    label: "Expenses & Income",
                    data: categoryAmounts,
                    backgroundColor: "#4CAF50",
                    borderColor: "#388E3C",
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Function to render the transaction list
    function renderTransactions() {
        transactionListUl.innerHTML = "";
        transactions.forEach(transaction => {
            const li = document.createElement("li");

            const descriptionSpan = document.createElement("span");
            descriptionSpan.textContent = transaction.description;
            li.appendChild(descriptionSpan);

            const amountSpan = document.createElement("span");
            amountSpan.textContent = `${transaction.type === "income" ? "+" : "-"}$${transaction.amount.toFixed(2)}`;
            li.appendChild(amountSpan);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => {
                transactions = transactions.filter(t => t !== transaction);
                localStorage.setItem("transactions", JSON.stringify(transactions));
                renderTransactions();
                updateSummary();
            });
            li.appendChild(deleteBtn);

            transactionListUl.appendChild(li);
        });
    }

    // Function to add a transaction
    addTransactionBtn.addEventListener("click", () => {
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;

        if (description && !isNaN(amount)) {
            const type = amount > 0 ? "income" : "expense";
            const newTransaction = { description, amount: Math.abs(amount), category, type };

            transactions.push(newTransaction);
            localStorage.setItem("transactions", JSON.stringify(transactions));

            descriptionInput.value = "";
            amountInput.value = "";
            categorySelect.value = "Salary";

            renderTransactions();
            updateSummary();
        }
    });

    renderTransactions();
    updateSummary();
});
