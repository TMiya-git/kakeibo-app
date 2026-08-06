"use strict";

const CATEGORY_STORAGE_KEY = "kakeiboCategories";
const TRANSACTION_STORAGE_KEY = "kakeiboTransactions";

const defaultCategories = [
  {
    id: "expense-food",
    name: "食費",
    type: "expense",
    active: true,
  },
  {
    id: "expense-daily",
    name: "日用品",
    type: "expense",
    active: true,
  },
  {
    id: "expense-transport",
    name: "交通費",
    type: "expense",
    active: true,
  },
  {
    id: "expense-housing",
    name: "住居費",
    type: "expense",
    active: true,
  },
  {
    id: "expense-communication",
    name: "通信費",
    type: "expense",
    active: true,
  },
  {
    id: "expense-utilities",
    name: "水道光熱費",
    type: "expense",
    active: true,
  },
  {
    id: "expense-entertainment",
    name: "娯楽",
    type: "expense",
    active: true,
  },
  {
    id: "expense-medical",
    name: "医療",
    type: "expense",
    active: true,
  },
  {
    id: "expense-education",
    name: "教育・研究",
    type: "expense",
    active: true,
  },
  {
    id: "expense-other",
    name: "その他",
    type: "expense",
    active: true,
  },
  {
    id: "income-scholarship",
    name: "奨学金・奨励金",
    type: "income",
    active: true,
  },
  {
    id: "income-salary",
    name: "給与",
    type: "income",
    active: true,
  },
  {
    id: "income-part-time",
    name: "アルバイト",
    type: "income",
    active: true,
  },
  {
    id: "income-temporary",
    name: "臨時収入",
    type: "income",
    active: true,
  },
  {
    id: "income-refund",
    name: "返金",
    type: "income",
    active: true,
  },
  {
    id: "income-other",
    name: "その他",
    type: "income",
    active: true,
  },
];

const navButtons = document.querySelectorAll(".nav-button");
const pages = document.querySelectorAll(".page");

const transactionForm = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const categorySelect = document.getElementById("category");
const transactionNameInput = document.getElementById("transaction-name");
const formMessage = document.getElementById("form-message");
const historyList = document.getElementById("history-list");

const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById(
  "cancel-edit-button",
);

const transactionTypeInputs = document.querySelectorAll(
  'input[name="transaction-type"]',
);

const categoryAddForm = document.getElementById("category-add-form");
const categoryTypeInput = document.getElementById("category-type");
const categoryNameInput = document.getElementById("category-name");
const categoryMessage = document.getElementById("category-message");

const expenseCategoryList = document.getElementById(
  "expense-category-list",
);
const incomeCategoryList = document.getElementById("income-category-list");

let categories = loadCategories();
let transactions = loadTransactions();
let editingTransactionId = null;

/**
 * 初期カテゴリを複製する。
 */
function getDefaultCategories() {
  return defaultCategories.map((category) => ({
    ...category,
  }));
}

/**
 * localStorageからカテゴリを読み込む。
 */
function loadCategories() {
  const savedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);

  if (!savedCategories) {
    return getDefaultCategories();
  }

  try {
    const parsedCategories = JSON.parse(savedCategories);

    if (!Array.isArray(parsedCategories)) {
      return getDefaultCategories();
    }

    return parsedCategories
      .filter((category) => {
        return (
          typeof category.id === "string" &&
          typeof category.name === "string" &&
          (category.type === "expense" || category.type === "income")
        );
      })
      .map((category) => ({
        id: category.id,
        name: category.name,
        type: category.type,
        active: category.active !== false,
      }));
  } catch (error) {
    console.error("カテゴリの読み込みに失敗しました。", error);
    return getDefaultCategories();
  }
}

/**
 * カテゴリをlocalStorageへ保存する。
 */
function saveCategories() {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}

/**
 * localStorageから収支記録を読み込む。
 */
function loadTransactions() {
  const savedTransactions = localStorage.getItem(TRANSACTION_STORAGE_KEY);

  if (!savedTransactions) {
    return [];
  }

  try {
    const parsedTransactions = JSON.parse(savedTransactions);

    if (!Array.isArray(parsedTransactions)) {
      return [];
    }

    return parsedTransactions
      .filter((transaction) => {
        return (
          typeof transaction.id === "string" &&
          typeof transaction.date === "string" &&
          (transaction.type === "expense" ||
            transaction.type === "income") &&
          typeof transaction.categoryId === "string" &&
          typeof transaction.amount === "number" &&
          Number.isFinite(transaction.amount) &&
          transaction.amount > 0
        );
      })
      .map((transaction) => ({
        id: transaction.id,
        date: transaction.date,
        type: transaction.type,
        categoryId: transaction.categoryId,
        name:
          typeof transaction.name === "string" ? transaction.name : "",
        amount: transaction.amount,
        createdAt:
          typeof transaction.createdAt === "string"
            ? transaction.createdAt
            : new Date().toISOString(),
      }));
  } catch (error) {
    console.error("収支記録の読み込みに失敗しました。", error);
    return [];
  }
}

/**
 * 収支記録をlocalStorageへ保存する。
 */
function saveTransactions() {
  localStorage.setItem(
    TRANSACTION_STORAGE_KEY,
    JSON.stringify(transactions),
  );
}

/**
 * 一意なIDを作成する。
 */
function createId(prefix) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

/**
 * 現在選択されている収支種別を取得する。
 */
function getSelectedTransactionType() {
  const checkedInput = document.querySelector(
    'input[name="transaction-type"]:checked',
  );

  return checkedInput?.value ?? "expense";
}

/**
 * カテゴリIDからカテゴリ名を取得する。
 */
function getCategoryName(categoryId) {
  const category = categories.find((item) => item.id === categoryId);

  return category?.name ?? "不明なカテゴリ";
}

/**
 * 入力画面のカテゴリ選択肢を更新する。
 */
function renderCategorySelect() {
  const transactionType = getSelectedTransactionType();
  const previousValue = categorySelect.value;

  const editingTransaction = transactions.find((transaction) => {
    return transaction.id === editingTransactionId;
  });

  categorySelect.replaceChildren();

  const placeholderOption = document.createElement("option");

  placeholderOption.value = "";
  placeholderOption.textContent = "選択してください";

  categorySelect.appendChild(placeholderOption);

  const availableCategories = categories.filter((category) => {
    const isCurrentEditingCategory =
      editingTransaction?.categoryId === category.id;

    return (
      category.type === transactionType &&
      (category.active || isCurrentEditingCategory)
    );
  });

  availableCategories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category.id;
    option.textContent = category.active
      ? category.name
      : `${category.name}（非表示）`;

    categorySelect.appendChild(option);
  });

  const previousCategoryStillExists = availableCategories.some(
    (category) => {
      return category.id === previousValue;
    },
  );

  if (previousCategoryStillExists) {
    categorySelect.value = previousValue;
  }
}

/**
 * カテゴリ一覧の1行を作成する。
 */
function createCategoryItem(category) {
  const listItem = document.createElement("li");

  listItem.className = "category-item";

  if (!category.active) {
    listItem.classList.add("inactive");
  }

  const categoryName = document.createElement("span");

  categoryName.className = "category-name";
  categoryName.textContent = category.name;

  const actionArea = document.createElement("div");

  actionArea.className = "category-actions";

  const renameButton = document.createElement("button");

  renameButton.type = "button";
  renameButton.className = "category-action-button";
  renameButton.dataset.action = "rename";
  renameButton.dataset.categoryId = category.id;
  renameButton.textContent = "名称変更";

  const activeButton = document.createElement("button");

  activeButton.type = "button";
  activeButton.className = "category-action-button";
  activeButton.dataset.action = "toggle";
  activeButton.dataset.categoryId = category.id;
  activeButton.textContent = category.active ? "非表示" : "再表示";

  actionArea.append(renameButton, activeButton);
  listItem.append(categoryName, actionArea);

  return listItem;
}

/**
 * 支出または収入カテゴリの一覧を表示する。
 */
function renderCategoryList(type, listElement) {
  listElement.replaceChildren();

  const filteredCategories = categories.filter((category) => {
    return category.type === type;
  });

  if (filteredCategories.length === 0) {
    const emptyMessage = document.createElement("li");

    emptyMessage.className = "category-empty-message";
    emptyMessage.textContent = "カテゴリが登録されていません。";

    listElement.appendChild(emptyMessage);
    return;
  }

  filteredCategories.forEach((category) => {
    listElement.appendChild(createCategoryItem(category));
  });
}

/**
 * 設定画面のカテゴリ一覧を更新する。
 */
function renderCategorySettings() {
  renderCategoryList("expense", expenseCategoryList);
  renderCategoryList("income", incomeCategoryList);
}

/**
 * カテゴリ関連の画面を更新する。
 */
function renderCategories() {
  renderCategorySelect();
  renderCategorySettings();
}

/**
 * 重複するカテゴリ名が存在するか確認する。
 */
function categoryNameExists(name, type, ignoredId = null) {
  return categories.some((category) => {
    return (
      category.id !== ignoredId &&
      category.type === type &&
      category.name.trim() === name.trim()
    );
  });
}

/**
 * YYYY-MM-DDを日本語の日付へ変換する。
 */
function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");

  if (!year || !month || !day) {
    return dateString;
  }

  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}

/**
 * 金額を3桁区切りにする。
 */
function formatAmount(amount) {
  return new Intl.NumberFormat("ja-JP").format(amount);
}

/**
 * 履歴の1件分を作成する。
 */
function createHistoryItem(transaction) {
  const article = document.createElement("article");

  article.className = "history-item";

  const mainArea = document.createElement("div");

  mainArea.className = "history-main";

  const categoryName = getCategoryName(transaction.categoryId);

  const nameElement = document.createElement("p");

  nameElement.className = "history-name";
  nameElement.textContent = transaction.name || categoryName;

  const detailsElement = document.createElement("p");

  detailsElement.className = "history-details";

  const dateElement = document.createElement("span");

  dateElement.textContent = formatDate(transaction.date);

  const categoryElement = document.createElement("span");

  categoryElement.className = "history-category";
  categoryElement.textContent = categoryName;

  detailsElement.append(dateElement, categoryElement);
  mainArea.append(nameElement, detailsElement);

  const rightArea = document.createElement("div");

  rightArea.className = "history-right";

  const amountElement = document.createElement("p");

  amountElement.className = `history-amount ${transaction.type}`;

  if (transaction.type === "income") {
    amountElement.textContent =
      `+${formatAmount(transaction.amount)}円`;
  } else {
    amountElement.textContent =
      `-${formatAmount(transaction.amount)}円`;
  }

  const actionArea = document.createElement("div");

  actionArea.className = "history-actions";

  const editButton = document.createElement("button");

  editButton.type = "button";
  editButton.className = "history-action-button";
  editButton.dataset.transactionAction = "edit";
  editButton.dataset.transactionId = transaction.id;
  editButton.textContent = "編集";

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";
  deleteButton.className = "history-action-button delete";
  deleteButton.dataset.transactionAction = "delete";
  deleteButton.dataset.transactionId = transaction.id;
  deleteButton.textContent = "削除";

  actionArea.append(editButton, deleteButton);
  rightArea.append(amountElement, actionArea);

  article.append(mainArea, rightArea);

  return article;
}

/**
 * 履歴画面を更新する。
 */
function renderHistory() {
  historyList.replaceChildren();

  if (transactions.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "history-empty-message";
    emptyMessage.textContent = "まだ収支が登録されていません。";

    historyList.appendChild(emptyMessage);
    return;
  }

  const sortedTransactions = [...transactions].sort((first, second) => {
    const dateComparison = second.date.localeCompare(first.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return second.createdAt.localeCompare(first.createdAt);
  });

  sortedTransactions.forEach((transaction) => {
    historyList.appendChild(createHistoryItem(transaction));
  });
}

/**
 * 今日の日付を日付欄へ設定する。
 */
function setToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  dateInput.value = `${year}-${month}-${day}`;
}

/**
 * 入力フォームを登録後の状態に戻す。
 */
function resetTransactionForm() {
  transactionForm.reset();

  editingTransactionId = null;

  submitButton.textContent = "登録";
  cancelEditButton.classList.add("hidden");

  setToday();
  renderCategorySelect();
}

function startEditingTransaction(transactionId) {
  const transaction = transactions.find((item) => {
    return item.id === transactionId;
  });

  if (!transaction) {
    window.alert("編集する記録が見つかりません。");
    return;
  }

  editingTransactionId = transaction.id;

  amountInput.value = transaction.amount;
  dateInput.value = transaction.date;
  transactionNameInput.value = transaction.name;

  transactionTypeInputs.forEach((input) => {
    input.checked = input.value === transaction.type;
  });

  renderCategorySelect();
  categorySelect.value = transaction.categoryId;

  submitButton.textContent = "更新";
  cancelEditButton.classList.remove("hidden");

  formMessage.textContent =
    "内容を修正して「更新」を押してください。";

  showPage("input-page");
  amountInput.focus();
}

function deleteTransaction(transactionId) {
  const transaction = transactions.find((item) => {
    return item.id === transactionId;
  });

  if (!transaction) {
    window.alert("削除する記録が見つかりません。");
    return;
  }

  const categoryName = getCategoryName(transaction.categoryId);
  const displayName = transaction.name || categoryName;

  const shouldDelete = window.confirm(
    `${displayName}（${formatAmount(
      transaction.amount,
    )}円）を削除しますか？`,
  );

  if (!shouldDelete) {
    return;
  }

  transactions = transactions.filter((item) => {
    return item.id !== transactionId;
  });

  saveTransactions();
  renderHistory();

  if (editingTransactionId === transactionId) {
    resetTransactionForm();
    formMessage.textContent = "";
  }
}

function handleHistoryAction(event) {
  const actionButton = event.target.closest(
    "button[data-transaction-action]",
  );

  if (!actionButton) {
    return;
  }

  const transactionId = actionButton.dataset.transactionId;
  const action = actionButton.dataset.transactionAction;

  if (action === "edit") {
    startEditingTransaction(transactionId);
  }

  if (action === "delete") {
    deleteTransaction(transactionId);
  }
}

/**
 * 表示する画面を切り替える。
 */
function showPage(pageId) {
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });

  navButtons.forEach((button) => {
    const isActive = button.dataset.page === pageId;

    button.classList.toggle("active", isActive);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/**
 * カテゴリの名称変更または表示状態変更を処理する。
 */
function handleCategoryAction(event) {
  const actionButton = event.target.closest("button[data-action]");

  if (!actionButton) {
    return;
  }

  const categoryId = actionButton.dataset.categoryId;

  const category = categories.find((item) => {
    return item.id === categoryId;
  });

  if (!category) {
    return;
  }

  if (actionButton.dataset.action === "rename") {
    const newName = window.prompt(
      "新しいカテゴリ名を入力してください。",
      category.name,
    );

    if (newName === null) {
      return;
    }

    const trimmedName = newName.trim();

    if (!trimmedName) {
      window.alert("カテゴリ名を入力してください。");
      return;
    }

    if (categoryNameExists(trimmedName, category.type, category.id)) {
      window.alert("同じ名前のカテゴリがすでにあります。");
      return;
    }

    category.name = trimmedName;
  }

  if (actionButton.dataset.action === "toggle") {
    category.active = !category.active;
  }

  saveCategories();
  renderCategories();
  renderHistory();
}

/**
 * 下部タブを押したときの処理。
 */
navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

/**
 * 支出・収入を変更したとき、カテゴリ選択肢も変更する。
 */
transactionTypeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    categorySelect.value = "";
    renderCategorySelect();
  });
});

/**
 * カテゴリを追加する。
 */
categoryAddForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = categoryNameInput.value.trim();
  const type = categoryTypeInput.value;

  categoryMessage.textContent = "";

  if (!name) {
    categoryMessage.textContent = "カテゴリ名を入力してください。";
    return;
  }

  if (categoryNameExists(name, type)) {
    categoryMessage.textContent =
      "同じ名前のカテゴリがすでにあります。";
    return;
  }

  categories.push({
    id: createId("category"),
    name,
    type,
    active: true,
  });

  saveCategories();
  renderCategories();

  categoryNameInput.value = "";
  categoryMessage.textContent = "カテゴリを追加しました。";
});

/**
 * カテゴリ一覧のボタン処理。
 */
expenseCategoryList.addEventListener("click", handleCategoryAction);
incomeCategoryList.addEventListener("click", handleCategoryAction);

historyList.addEventListener("click", handleHistoryAction);

cancelEditButton.addEventListener("click", () => {
  resetTransactionForm();
  formMessage.textContent = "編集をキャンセルしました。";
});

/**
 * 収支を登録する。
 */
transactionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  formMessage.textContent = "";

  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const type = getSelectedTransactionType();
  const categoryId = categorySelect.value;
  const name = transactionNameInput.value.trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    formMessage.textContent =
      "0円より大きい金額を入力してください。";
    return;
  }

  if (!Number.isInteger(amount)) {
    formMessage.textContent =
      "金額は整数で入力してください。";
    return;
  }

  if (!date) {
    formMessage.textContent = "日付を選択してください。";
    return;
  }

  if (!categoryId) {
    formMessage.textContent =
      "カテゴリを選択してください。";
    return;
  }

  const selectedCategory = categories.find((category) => {
    return (
      category.id === categoryId &&
      category.type === type
    );
  });

  if (
    !selectedCategory ||
    (!selectedCategory.active &&
      editingTransactionId === null)
  ) {
    formMessage.textContent =
      "選択したカテゴリを確認してください。";

    renderCategorySelect();
    return;
  }

  if (editingTransactionId !== null) {
    const transactionIndex = transactions.findIndex(
      (transaction) => {
        return transaction.id === editingTransactionId;
      },
    );

    if (transactionIndex === -1) {
      formMessage.textContent =
        "更新する記録が見つかりません。";
      return;
    }

    const originalTransaction =
      transactions[transactionIndex];

    transactions[transactionIndex] = {
      ...originalTransaction,
      date,
      type,
      categoryId,
      name,
      amount,
      updatedAt: new Date().toISOString(),
    };

    saveTransactions();
    renderHistory();
    resetTransactionForm();

    formMessage.textContent = "更新しました。";
    return;
  }

  const transaction = {
    id: createId("transaction"),
    date,
    type,
    categoryId,
    name,
    amount,
    createdAt: new Date().toISOString(),
  };

  transactions.push(transaction);

  saveTransactions();
  renderHistory();
  resetTransactionForm();

  formMessage.textContent = "登録しました。";
});

/**
 * 初期表示。
 */
setToday();
renderCategories();
renderHistory();