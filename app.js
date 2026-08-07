"use strict";

const CATEGORY_STORAGE_KEY = "kakeiboCategories";
const TRANSACTION_STORAGE_KEY = "kakeiboTransactions";
const FIXED_STORAGE_KEY = "kakeiboFixedTransactions";

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
const calendarGrid = document.getElementById("calendar-grid");

const historyMonthInput = document.getElementById("history-month");
const summaryMonthInput = document.getElementById("summary-month");
const monthlyIncomeElement = document.getElementById("monthly-income");
const monthlyExpenseElement = document.getElementById("monthly-expense");
const monthlyBalanceElement = document.getElementById("monthly-balance");
const expenseChartContent = document.getElementById(
  "expense-chart-content",
);
const expenseChart = document.getElementById("expense-chart");
const expenseChartLegend = document.getElementById(
  "expense-chart-legend",
);
const expenseChartEmpty = document.getElementById(
  "expense-chart-empty",
);
const incomeChartContent = document.getElementById(
  "income-chart-content",
);
const incomeChart = document.getElementById("income-chart");
const incomeChartLegend = document.getElementById(
  "income-chart-legend",
);
const incomeChartEmpty = document.getElementById(
  "income-chart-empty",
);
const summaryYearSelect = document.getElementById("summary-year");
const yearlyChart = document.getElementById("yearly-chart");
const yearlyChartEmpty = document.getElementById(
  "yearly-chart-empty",
);

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
const backupExportButton = document.getElementById(
  "backup-export-button",
);
const backupImportButton = document.getElementById(
  "backup-import-button",
);
const backupFileInput = document.getElementById("backup-file-input");
const backupMessage = document.getElementById("backup-message");
const csvExportButton = document.getElementById("csv-export-button");
const fixedForm = document.getElementById("fixed-form");
const fixedCategorySelect = document.getElementById("fixed-category");
const fixedNameInput = document.getElementById("fixed-name");
const fixedAmountInput = document.getElementById("fixed-amount");
const fixedDaySelect = document.getElementById("fixed-day");
const fixedStartMonthInput = document.getElementById("fixed-start-month");
const fixedEndMonthInput = document.getElementById("fixed-end-month");
const fixedSubmitButton = document.getElementById("fixed-submit-button");
const fixedCancelButton = document.getElementById("fixed-cancel-button");
const fixedMessage = document.getElementById("fixed-message");
const fixedList = document.getElementById("fixed-list");
const fixedGenerationMonthInput = document.getElementById(
  "fixed-generation-month",
);
const fixedGenerationButton = document.getElementById(
  "fixed-generation-button",
);
const fixedGenerationMessage = document.getElementById(
  "fixed-generation-message",
);
const fixedTypeInputs = document.querySelectorAll(
  'input[name="fixed-type"]',
);

let categories = loadCategories();
let transactions = loadTransactions();
let fixedTransactions = loadFixedTransactions();
let editingTransactionId = null;
let editingFixedId = null;
let selectedMonth = "";
let selectedYear = String(new Date().getFullYear());

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
        ...(typeof transaction.fixedTransactionId === "string" &&
          isValidMonthString(transaction.fixedMonth)
          ? {
              fixedTransactionId: transaction.fixedTransactionId,
              fixedMonth: transaction.fixedMonth,
            }
          : {}),
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

function loadFixedTransactions() {
  const savedFixedTransactions = localStorage.getItem(FIXED_STORAGE_KEY);

  if (!savedFixedTransactions) {
    return [];
  }

  try {
    const parsedFixedTransactions = JSON.parse(savedFixedTransactions);

    if (!Array.isArray(parsedFixedTransactions)) {
      return [];
    }

    return parsedFixedTransactions.filter((item) => {
      return (
        item &&
        typeof item.id === "string" &&
        (item.type === "expense" || item.type === "income") &&
        typeof item.categoryId === "string" &&
        typeof item.name === "string" &&
        Number.isInteger(item.amount) &&
        item.amount > 0 &&
        Number.isInteger(item.day) &&
        item.day >= 1 &&
        item.day <= 31 &&
        isValidMonthString(item.startMonth) &&
        (item.endMonth === "" || isValidMonthString(item.endMonth)) &&
        (item.endMonth === "" || item.endMonth >= item.startMonth) &&
        typeof item.active === "boolean"
      );
    });
  } catch (error) {
    console.error("固定収支の読み込みに失敗しました。", error);
    return [];
  }
}

function saveFixedTransactions() {
  localStorage.setItem(
    FIXED_STORAGE_KEY,
    JSON.stringify(fixedTransactions),
  );
}

/**
 * 現在のデータをJSONファイルとして保存する。
 */
function exportBackup() {
  const backup = {
    version: 2,
    exportedAt: new Date().toISOString(),
    categories,
    transactions,
    fixedTransactions,
  };
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], {
    type: "application/json;charset=utf-8",
  });
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  const today = new Date();
  const date = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  downloadLink.href = downloadUrl;
  downloadLink.download = `kakeibo-backup-${date}.json`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 1000);

  backupMessage.textContent =
    `カテゴリ${categories.length}件、収支${transactions.length}件、固定収支${fixedTransactions.length}件を保存しました。`;
}

/**
 * CSVの1項目を安全な形式へ変換する。
 */
function escapeCsvValue(value, preventFormula = false) {
  let text = String(value ?? "");

  if (preventFormula && /^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/**
 * 全収支記録をCSVファイルとして保存する。
 */
function exportTransactionsCsv() {
  if (transactions.length === 0) {
    backupMessage.textContent =
      "CSVへ出力する収支記録がありません。";
    return;
  }

  const header = ["日付", "種別", "カテゴリ", "名前", "金額"];
  const sortedTransactions = [...transactions].sort((first, second) => {
    const dateComparison = first.date.localeCompare(second.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return first.createdAt.localeCompare(second.createdAt);
  });
  const rows = sortedTransactions.map((transaction) => {
    return [
      escapeCsvValue(transaction.date),
      escapeCsvValue(transaction.type === "income" ? "収入" : "支出"),
      escapeCsvValue(getCategoryName(transaction.categoryId), true),
      escapeCsvValue(transaction.name, true),
      escapeCsvValue(transaction.amount),
    ].join(",");
  });
  const csv = `\uFEFF${[header.join(","), ...rows].join("\r\n")}`;
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  const today = new Date();
  const date = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  downloadLink.href = downloadUrl;
  downloadLink.download = `kakeibo-transactions-${date}.csv`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 1000);

  backupMessage.textContent =
    `収支${transactions.length}件をCSVへ出力しました。`;
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isValidMonthString(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/**
 * 復元データを検証し、アプリで使用する形式に整える。
 */
function validateBackup(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("バックアップの形式が正しくありません。");
  }

  if (data.version !== 1 && data.version !== 2) {
    throw new Error("対応していないバックアップ形式です。");
  }

  if (
    typeof data.exportedAt !== "string" ||
    !Number.isFinite(Date.parse(data.exportedAt))
  ) {
    throw new Error("バックアップの作成日時が正しくありません。");
  }

  if (!Array.isArray(data.categories) || !Array.isArray(data.transactions)) {
    throw new Error("カテゴリまたは収支記録が見つかりません。");
  }

  const categoryIds = new Set();
  const categoryNames = new Set();
  const restoredCategories = data.categories.map((category) => {
    const normalizedName =
      typeof category?.name === "string" ? category.name.trim() : "";
    const categoryNameKey = `${category?.type}:${normalizedName}`;
    const isValid =
      category &&
      typeof category === "object" &&
      typeof category.id === "string" &&
      category.id.trim().length > 0 &&
      normalizedName.length > 0 &&
      normalizedName.length <= 30 &&
      (category.type === "expense" || category.type === "income") &&
      typeof category.active === "boolean";

    if (
      !isValid ||
      categoryIds.has(category.id) ||
      categoryNames.has(categoryNameKey)
    ) {
      throw new Error("カテゴリデータが破損しています。");
    }

    categoryIds.add(category.id);
    categoryNames.add(categoryNameKey);

    return {
      id: category.id,
      name: normalizedName,
      type: category.type,
      active: category.active,
    };
  });

  const categoriesById = new Map(
    restoredCategories.map((category) => [category.id, category]),
  );
  const transactionIds = new Set();
  const restoredTransactions = data.transactions.map((transaction) => {
    const relatedCategory = categoriesById.get(transaction?.categoryId);
    const hasNoFixedSource =
      typeof transaction?.fixedTransactionId === "undefined" &&
      typeof transaction?.fixedMonth === "undefined";
    const hasValidFixedSource =
      typeof transaction?.fixedTransactionId === "string" &&
      transaction.fixedTransactionId.trim().length > 0 &&
      isValidMonthString(transaction.fixedMonth);
    const isValid =
      transaction &&
      typeof transaction === "object" &&
      typeof transaction.id === "string" &&
      transaction.id.trim().length > 0 &&
      isValidDateString(transaction.date) &&
      (transaction.type === "expense" ||
        transaction.type === "income") &&
      typeof transaction.categoryId === "string" &&
      relatedCategory?.type === transaction.type &&
      (typeof transaction.name === "string" ||
        typeof transaction.name === "undefined") &&
      (transaction.name?.length ?? 0) <= 50 &&
      Number.isInteger(transaction.amount) &&
      transaction.amount > 0 &&
      typeof transaction.createdAt === "string" &&
      Number.isFinite(Date.parse(transaction.createdAt)) &&
      (hasNoFixedSource || hasValidFixedSource);

    if (!isValid || transactionIds.has(transaction.id)) {
      throw new Error("収支記録が破損しています。");
    }

    transactionIds.add(transaction.id);

    return {
      id: transaction.id,
      date: transaction.date,
      type: transaction.type,
      categoryId: transaction.categoryId,
      name: transaction.name ?? "",
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      ...(typeof transaction.updatedAt === "string"
        ? { updatedAt: transaction.updatedAt }
        : {}),
      ...(hasValidFixedSource
        ? {
            fixedTransactionId: transaction.fixedTransactionId,
            fixedMonth: transaction.fixedMonth,
          }
        : {}),
    };
  });

  const backupFixedTransactions = data.version === 1
    ? []
    : data.fixedTransactions;

  if (!Array.isArray(backupFixedTransactions)) {
    throw new Error("固定収支データが見つかりません。");
  }

  const fixedIds = new Set();
  const restoredFixedTransactions = backupFixedTransactions.map((item) => {
    const relatedCategory = categoriesById.get(item?.categoryId);
    const isValid =
      item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      item.id.trim().length > 0 &&
      (item.type === "expense" || item.type === "income") &&
      relatedCategory?.type === item.type &&
      typeof item.name === "string" &&
      item.name.trim().length > 0 &&
      item.name.trim().length <= 50 &&
      Number.isInteger(item.amount) &&
      item.amount > 0 &&
      Number.isInteger(item.day) &&
      item.day >= 1 &&
      item.day <= 31 &&
      isValidMonthString(item.startMonth) &&
      (item.endMonth === "" || isValidMonthString(item.endMonth)) &&
      (item.endMonth === "" || item.endMonth >= item.startMonth) &&
      typeof item.active === "boolean";

    if (!isValid || fixedIds.has(item.id)) {
      throw new Error("固定収支データが破損しています。");
    }

    fixedIds.add(item.id);

    return {
      id: item.id,
      type: item.type,
      categoryId: item.categoryId,
      name: item.name.trim(),
      amount: item.amount,
      day: item.day,
      startMonth: item.startMonth,
      endMonth: item.endMonth,
      active: item.active,
      createdAt:
        typeof item.createdAt === "string"
          ? item.createdAt
          : new Date().toISOString(),
    };
  });

  return {
    categories: restoredCategories,
    transactions: restoredTransactions,
    fixedTransactions: restoredFixedTransactions,
  };
}

/**
 * 検証済みバックアップで現在のデータを置き換える。
 */
function restoreBackup(restoredData) {
  const previousCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);
  const previousTransactions = localStorage.getItem(
    TRANSACTION_STORAGE_KEY,
  );
  const previousFixedTransactions = localStorage.getItem(FIXED_STORAGE_KEY);

  try {
    localStorage.setItem(
      CATEGORY_STORAGE_KEY,
      JSON.stringify(restoredData.categories),
    );
    localStorage.setItem(
      TRANSACTION_STORAGE_KEY,
      JSON.stringify(restoredData.transactions),
    );
    localStorage.setItem(
      FIXED_STORAGE_KEY,
      JSON.stringify(restoredData.fixedTransactions),
    );
  } catch (error) {
    if (previousCategories === null) {
      localStorage.removeItem(CATEGORY_STORAGE_KEY);
    } else {
      localStorage.setItem(CATEGORY_STORAGE_KEY, previousCategories);
    }

    if (previousTransactions === null) {
      localStorage.removeItem(TRANSACTION_STORAGE_KEY);
    } else {
      localStorage.setItem(
        TRANSACTION_STORAGE_KEY,
        previousTransactions,
      );
    }

    if (previousFixedTransactions === null) {
      localStorage.removeItem(FIXED_STORAGE_KEY);
    } else {
      localStorage.setItem(FIXED_STORAGE_KEY, previousFixedTransactions);
    }

    throw error;
  }

  categories = restoredData.categories;
  transactions = restoredData.transactions;
  fixedTransactions = restoredData.fixedTransactions;
  editingTransactionId = null;
  editingFixedId = null;

  resetTransactionForm();
  renderCategories();
  resetFixedForm();
  renderFixedTransactions();
  setSelectedMonth(getCurrentMonth());
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
  renderFixedCategorySelect();
}

function getSelectedFixedType() {
  const checkedInput = document.querySelector(
    'input[name="fixed-type"]:checked',
  );

  return checkedInput?.value ?? "expense";
}

function renderFixedCategorySelect() {
  const type = getSelectedFixedType();
  const previousValue = fixedCategorySelect.value;
  const editingItem = fixedTransactions.find((item) => {
    return item.id === editingFixedId;
  });

  fixedCategorySelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "選択してください";
  fixedCategorySelect.appendChild(placeholder);

  const availableCategories = categories.filter((category) => {
    return (
      category.type === type &&
      (category.active || editingItem?.categoryId === category.id)
    );
  });

  availableCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.active
      ? category.name
      : `${category.name}（非表示）`;
    fixedCategorySelect.appendChild(option);
  });

  if (availableCategories.some((category) => category.id === previousValue)) {
    fixedCategorySelect.value = previousValue;
  }
}

function initializeFixedDayOptions() {
  for (let day = 1; day <= 31; day += 1) {
    const option = document.createElement("option");
    option.value = day;
    option.textContent = `${day}日`;
    fixedDaySelect.appendChild(option);
  }
}

function resetFixedForm() {
  fixedForm.reset();
  editingFixedId = null;
  fixedSubmitButton.textContent = "登録";
  fixedCancelButton.classList.add("hidden");
  fixedStartMonthInput.value = getCurrentMonth();
  fixedDaySelect.value = String(new Date().getDate());
  renderFixedCategorySelect();
}

function createFixedItem(item) {
  const article = document.createElement("article");
  article.className = "fixed-item";

  if (!item.active) {
    article.classList.add("inactive");
  }

  const header = document.createElement("div");
  const name = document.createElement("h3");
  const amount = document.createElement("p");
  const details = document.createElement("p");
  const footer = document.createElement("div");
  const status = document.createElement("span");
  const actions = document.createElement("div");

  header.className = "fixed-item-header";
  name.className = "fixed-item-name";
  amount.className = `fixed-item-amount ${item.type}`;
  details.className = "fixed-item-details";
  footer.className = "fixed-item-footer";
  status.className = "fixed-status";
  actions.className = "fixed-item-actions";

  name.textContent = item.name;
  amount.textContent = `${item.type === "income" ? "+" : "-"}${formatAmount(
    item.amount,
  )}円`;
  details.textContent = `${getCategoryName(item.categoryId)} ／ 毎月${item.day}日 ／ ${formatMonth(
    item.startMonth,
  )}から${item.endMonth ? `${formatMonth(item.endMonth)}まで` : "終了月なし"}`;
  status.textContent = item.active ? "有効" : "無効";

  [
    ["edit", "編集"],
    ["toggle", item.active ? "無効にする" : "有効にする"],
    ["delete", "削除"],
  ].forEach(([action, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `fixed-action-button${action === "delete" ? " delete" : ""}`;
    button.dataset.fixedAction = action;
    button.dataset.fixedId = item.id;
    button.textContent = label;
    actions.appendChild(button);
  });

  header.append(name, amount);
  footer.append(status, actions);
  article.append(header, details, footer);
  return article;
}

function renderFixedTransactions() {
  fixedList.replaceChildren();

  if (fixedTransactions.length === 0) {
    const empty = document.createElement("p");
    empty.className = "fixed-empty";
    empty.textContent = "固定収支はまだ登録されていません。";
    fixedList.appendChild(empty);
    return;
  }

  fixedTransactions.forEach((item) => {
    fixedList.appendChild(createFixedItem(item));
  });
}

function startEditingFixedItem(fixedId) {
  const item = fixedTransactions.find((fixedItem) => fixedItem.id === fixedId);

  if (!item) {
    return;
  }

  editingFixedId = item.id;
  fixedTypeInputs.forEach((input) => {
    input.checked = input.value === item.type;
  });
  renderFixedCategorySelect();
  fixedCategorySelect.value = item.categoryId;
  fixedNameInput.value = item.name;
  fixedAmountInput.value = item.amount;
  fixedDaySelect.value = item.day;
  fixedStartMonthInput.value = item.startMonth;
  fixedEndMonthInput.value = item.endMonth;
  fixedSubmitButton.textContent = "更新";
  fixedCancelButton.classList.remove("hidden");
  fixedMessage.textContent = "内容を修正して「更新」を押してください。";
  fixedForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleFixedAction(event) {
  const button = event.target.closest("button[data-fixed-action]");

  if (!button) {
    return;
  }

  const item = fixedTransactions.find((fixedItem) => {
    return fixedItem.id === button.dataset.fixedId;
  });

  if (!item) {
    return;
  }

  if (button.dataset.fixedAction === "edit") {
    startEditingFixedItem(item.id);
    return;
  }

  if (button.dataset.fixedAction === "toggle") {
    item.active = !item.active;
    saveFixedTransactions();
    renderFixedTransactions();
    fixedMessage.textContent = item.active
      ? "固定収支を有効にしました。"
      : "固定収支を無効にしました。";
    return;
  }

  if (
    button.dataset.fixedAction === "delete" &&
    window.confirm(`${item.name}を削除しますか？`)
  ) {
    fixedTransactions = fixedTransactions.filter((fixedItem) => {
      return fixedItem.id !== item.id;
    });
    saveFixedTransactions();
    renderFixedTransactions();

    if (editingFixedId === item.id) {
      resetFixedForm();
    }

    fixedMessage.textContent = "固定収支を削除しました。";
  }
}

function generateFixedTransactionsForMonth(month) {
  if (!isValidMonthString(month)) {
    throw new Error("対象月を選択してください。");
  }

  const applicableItems = fixedTransactions.filter((item) => {
    return (
      item.active &&
      item.startMonth <= month &&
      (item.endMonth === "" || item.endMonth >= month)
    );
  });
  const generatedItems = [];
  let skippedCount = 0;
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();

  applicableItems.forEach((item) => {
    const alreadyGenerated = transactions.some((transaction) => {
      return (
        transaction.fixedTransactionId === item.id &&
        transaction.fixedMonth === month
      );
    });

    if (alreadyGenerated) {
      skippedCount += 1;
      return;
    }

    const day = Math.min(item.day, lastDay);
    generatedItems.push({
      id: createId("transaction"),
      date: `${month}-${String(day).padStart(2, "0")}`,
      type: item.type,
      categoryId: item.categoryId,
      name: item.name,
      amount: item.amount,
      createdAt: new Date().toISOString(),
      fixedTransactionId: item.id,
      fixedMonth: month,
    });
  });

  if (generatedItems.length > 0) {
    transactions.push(...generatedItems);

    try {
      saveTransactions();
    } catch (error) {
      transactions.splice(-generatedItems.length, generatedItems.length);
      throw error;
    }
  }

  setSelectedMonth(month);

  return {
    generatedCount: generatedItems.length,
    skippedCount,
    applicableCount: applicableItems.length,
  };
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
 * 現在の年月をYYYY-MM形式で取得する。
 */
function getCurrentMonth() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(
    2,
    "0",
  );

  return `${year}-${month}`;
}

/**
 * YYYY-MMを日本語の年月へ変換する。
 */
function formatMonth(monthString) {
  const [year, month] = monthString.split("-");

  if (!year || !month) {
    return monthString;
  }

  return `${Number(year)}年${Number(month)}月`;
}

/**
 * 選択月に含まれる収支だけ取得する。
 */
function getTransactionsForSelectedMonth() {
  return transactions.filter((transaction) => {
    return transaction.date.slice(0, 7) === selectedMonth;
  });
}

/**
 * 対象月を変更し、履歴と集計を更新する。
 */
function setSelectedMonth(month) {
  const validMonth = /^\d{4}-\d{2}$/.test(month)
    ? month
    : getCurrentMonth();

  selectedMonth = validMonth;

  historyMonthInput.value = selectedMonth;
  summaryMonthInput.value = selectedMonth;
  selectedYear = selectedMonth.slice(0, 4);

  renderCalendar();
  renderHistory();
  renderMonthlySummary();
  renderCategoryCharts();
  renderYearOptions();
  renderYearlyChart();
}

/**
 * 選択月の日別収入・支出をカレンダーに表示する。
 */
function renderCalendar() {
  calendarGrid.replaceChildren();

  const [year, month] = selectedMonth.split("-").map(Number);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthlyTransactions = getTransactionsForSelectedMonth();
  const dailyTotals = new Map();

  monthlyTransactions.forEach((transaction) => {
    const day = Number(transaction.date.slice(8, 10));
    const totals = dailyTotals.get(day) ?? {
      income: 0,
      expense: 0,
    };

    totals[transaction.type] += transaction.amount;
    dailyTotals.set(day, totals);
  });

  for (let index = 0; index < firstWeekday; index += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day calendar-day-empty";
    emptyCell.setAttribute("aria-hidden", "true");
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const totals = dailyTotals.get(day) ?? {
      income: 0,
      expense: 0,
    };
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day";
    dayCell.setAttribute(
      "aria-label",
      `${day}日、収入${formatAmount(totals.income)}円、支出${formatAmount(
        totals.expense,
      )}円`,
    );

    const dayNumber = document.createElement("span");
    dayNumber.className = "calendar-day-number";
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

    if (totals.income > 0) {
      const incomeElement = document.createElement("span");
      incomeElement.className = "calendar-amount income";
      incomeElement.textContent = `+${formatAmount(totals.income)}`;
      dayCell.appendChild(incomeElement);
    }

    if (totals.expense > 0) {
      const expenseElement = document.createElement("span");
      expenseElement.className = "calendar-amount expense";
      expenseElement.textContent = `-${formatAmount(totals.expense)}`;
      dayCell.appendChild(expenseElement);
    }

    calendarGrid.appendChild(dayCell);
  }
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

  if (transaction.fixedTransactionId) {
    const fixedLabel = document.createElement("span");
    fixedLabel.className = "history-fixed-label";
    fixedLabel.textContent = "固定収支";
    detailsElement.appendChild(fixedLabel);
  }
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

  const monthlyTransactions =
    getTransactionsForSelectedMonth();

  if (monthlyTransactions.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "history-empty-message";
    emptyMessage.textContent =
      `${formatMonth(selectedMonth)}の収支はまだ登録されていません。`;

    historyList.appendChild(emptyMessage);
    return;
  }

  const sortedTransactions = [...monthlyTransactions].sort(
    (first, second) => {
      const dateComparison = second.date.localeCompare(
        first.date,
      );

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return second.createdAt.localeCompare(
        first.createdAt,
      );
    },
  );

  sortedTransactions.forEach((transaction) => {
    historyList.appendChild(
      createHistoryItem(transaction),
    );
  });
}

/**
 * 選択月の収入・支出・収支を表示する。
 */
function renderMonthlySummary() {
  const monthlyTransactions =
    getTransactionsForSelectedMonth();

  const monthlyIncome = monthlyTransactions
    .filter((transaction) => {
      return transaction.type === "income";
    })
    .reduce((total, transaction) => {
      return total + transaction.amount;
    }, 0);

  const monthlyExpense = monthlyTransactions
    .filter((transaction) => {
      return transaction.type === "expense";
    })
    .reduce((total, transaction) => {
      return total + transaction.amount;
    }, 0);

  const monthlyBalance =
    monthlyIncome - monthlyExpense;

  monthlyIncomeElement.textContent =
    `${formatAmount(monthlyIncome)}円`;

  monthlyExpenseElement.textContent =
    `${formatAmount(monthlyExpense)}円`;

  const balancePrefix =
    monthlyBalance > 0
      ? "+"
      : monthlyBalance < 0
        ? "-"
        : "";

  monthlyBalanceElement.textContent =
    `${balancePrefix}${formatAmount(
      Math.abs(monthlyBalance),
    )}円`;
}

/**
 * 選択月の収支をカテゴリ別に集計して円グラフを表示する。
 */
function renderCategoryChart(type, elements) {
  const categoryTotals = new Map();

  getTransactionsForSelectedMonth()
    .filter((transaction) => {
      return transaction.type === type;
    })
    .forEach((transaction) => {
      const currentTotal =
        categoryTotals.get(transaction.categoryId) ?? 0;

      categoryTotals.set(
        transaction.categoryId,
        currentTotal + transaction.amount,
      );
    });

  const chartData = [...categoryTotals.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      name: getCategoryName(categoryId),
      amount,
    }))
    .sort((first, second) => second.amount - first.amount);

  elements.chart.replaceChildren();
  elements.legend.replaceChildren();

  if (chartData.length === 0) {
    elements.content.classList.add("hidden");
    elements.empty.classList.remove("hidden");
    elements.empty.textContent =
      `${formatMonth(selectedMonth)}の${elements.label}データはありません。`;
    return;
  }

  elements.content.classList.remove("hidden");
  elements.empty.classList.add("hidden");

  const totalAmount = chartData.reduce((total, item) => {
    return total + item.amount;
  }, 0);
  const svgNamespace = "http://www.w3.org/2000/svg";
  const backgroundCircle = document.createElementNS(
    svgNamespace,
    "circle",
  );

  backgroundCircle.setAttribute("class", "pie-chart-background");
  backgroundCircle.setAttribute("cx", "110");
  backgroundCircle.setAttribute("cy", "110");
  backgroundCircle.setAttribute("r", "72");
  elements.chart.appendChild(backgroundCircle);

  let cumulativePercentage = 0;

  chartData.forEach((item, index) => {
    const percentage = (item.amount / totalAmount) * 100;
    const color = elements.colors[index % elements.colors.length];
    const segment = document.createElementNS(svgNamespace, "circle");

    segment.setAttribute("class", "pie-chart-segment");
    segment.setAttribute("cx", "110");
    segment.setAttribute("cy", "110");
    segment.setAttribute("r", "72");
    segment.setAttribute("pathLength", "100");
    segment.setAttribute(
      "stroke-dasharray",
      `${percentage} ${100 - percentage}`,
    );
    segment.setAttribute(
      "stroke-dashoffset",
      String(-cumulativePercentage),
    );
    segment.setAttribute("stroke", color);
    elements.chart.appendChild(segment);

    const legendItem = document.createElement("li");
    const legendLabel = document.createElement("span");
    const colorMarker = document.createElement("span");
    const categoryName = document.createElement("span");
    const categoryAmount = document.createElement("strong");

    legendLabel.className = "chart-legend-label";
    colorMarker.className = "chart-color-marker";
    colorMarker.style.backgroundColor = color;
    categoryName.textContent = item.name;
    categoryAmount.textContent = `${formatAmount(item.amount)}円（${Math.round(
      percentage,
    )}%）`;

    legendLabel.append(colorMarker, categoryName);
    legendItem.append(legendLabel, categoryAmount);
    elements.legend.appendChild(legendItem);

    cumulativePercentage += percentage;
  });

  const totalLabel = document.createElementNS(svgNamespace, "text");
  const totalAmountText = document.createElementNS(svgNamespace, "text");

  totalLabel.setAttribute("class", "pie-chart-total-label");
  totalLabel.setAttribute("x", "110");
  totalLabel.setAttribute("y", "103");
  totalLabel.textContent = `${elements.label}合計`;

  totalAmountText.setAttribute("class", "pie-chart-total-amount");
  totalAmountText.setAttribute("x", "110");
  totalAmountText.setAttribute("y", "126");
  totalAmountText.textContent = `${formatAmount(totalAmount)}円`;

  elements.chart.append(totalLabel, totalAmountText);
  elements.chart.setAttribute(
    "aria-label",
    `${formatMonth(selectedMonth)}の${elements.label}カテゴリグラフ。合計${formatAmount(
      totalAmount,
    )}円`,
  );
}

function renderCategoryCharts() {
  renderCategoryChart("expense", {
    content: expenseChartContent,
    chart: expenseChart,
    legend: expenseChartLegend,
    empty: expenseChartEmpty,
    label: "支出",
    colors: [
      "#df5b5b",
      "#4f8fcf",
      "#e29a45",
      "#8abf5a",
      "#a678c2",
      "#4fb5ad",
      "#d27c9b",
      "#7e9fd1",
      "#c5a55a",
      "#9a9a9a",
    ],
  });

  renderCategoryChart("income", {
    content: incomeChartContent,
    chart: incomeChart,
    legend: incomeChartLegend,
    empty: incomeChartEmpty,
    label: "収入",
    colors: [
      "#42a85f",
      "#4fb5ad",
      "#7e9fd1",
      "#8abf5a",
      "#e29a45",
      "#a678c2",
      "#5bbf8a",
      "#73a95b",
      "#68a6c9",
      "#9a9a9a",
    ],
  });
}

/**
 * 年間グラフで選択できる年を更新する。
 */
function renderYearOptions() {
  const availableYears = new Set([
    String(new Date().getFullYear()),
    selectedYear,
  ]);

  transactions.forEach((transaction) => {
    availableYears.add(transaction.date.slice(0, 4));
  });

  summaryYearSelect.replaceChildren();

  [...availableYears]
    .sort((first, second) => Number(second) - Number(first))
    .forEach((year) => {
      const option = document.createElement("option");

      option.value = year;
      option.textContent = `${Number(year)}年`;
      summaryYearSelect.appendChild(option);
    });

  summaryYearSelect.value = selectedYear;
}

/**
 * 選択年の月別収入・支出を棒グラフで表示する。
 */
function renderYearlyChart() {
  const monthlyTotals = Array.from({ length: 12 }, () => ({
    income: 0,
    expense: 0,
  }));

  transactions
    .filter((transaction) => {
      return transaction.date.slice(0, 4) === selectedYear;
    })
    .forEach((transaction) => {
      const monthIndex = Number(transaction.date.slice(5, 7)) - 1;

      if (monthIndex < 0 || monthIndex > 11) {
        return;
      }

      monthlyTotals[monthIndex][transaction.type] += transaction.amount;
    });

  const maximumAmount = monthlyTotals.reduce((maximum, totals) => {
    return Math.max(maximum, totals.income, totals.expense);
  }, 0);

  yearlyChart.replaceChildren();
  yearlyChart.setAttribute(
    "aria-label",
    `${Number(selectedYear)}年の月別収入・支出棒グラフ`,
  );

  yearlyChartEmpty.classList.toggle("hidden", maximumAmount > 0);
  yearlyChartEmpty.textContent =
    `${Number(selectedYear)}年の収支データはありません。`;

  monthlyTotals.forEach((totals, index) => {
    const monthGroup = document.createElement("div");
    const bars = document.createElement("div");
    const incomeBar = document.createElement("div");
    const expenseBar = document.createElement("div");
    const monthLabel = document.createElement("span");
    const incomeHeight = maximumAmount > 0
      ? (totals.income / maximumAmount) * 100
      : 0;
    const expenseHeight = maximumAmount > 0
      ? (totals.expense / maximumAmount) * 100
      : 0;

    monthGroup.className = "yearly-month";
    bars.className = "yearly-bars";
    incomeBar.className = "yearly-bar income";
    expenseBar.className = "yearly-bar expense";
    monthLabel.className = "yearly-month-label";

    incomeBar.style.height = `${incomeHeight}%`;
    expenseBar.style.height = `${expenseHeight}%`;
    incomeBar.title = `${index + 1}月の収入 ${formatAmount(
      totals.income,
    )}円`;
    expenseBar.title = `${index + 1}月の支出 ${formatAmount(
      totals.expense,
    )}円`;
    incomeBar.setAttribute("aria-label", incomeBar.title);
    expenseBar.setAttribute("aria-label", expenseBar.title);
    monthLabel.textContent = `${index + 1}月`;

    bars.append(incomeBar, expenseBar);
    monthGroup.append(bars, monthLabel);
    yearlyChart.appendChild(monthGroup);
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
  renderCalendar();
  renderHistory();
  renderMonthlySummary();
  renderCategoryCharts();
  renderYearOptions();
  renderYearlyChart();

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
  renderCategoryCharts();
  renderFixedTransactions();
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
 * 履歴画面で対象月を変更する。
 */
historyMonthInput.addEventListener(
  "change",
  (event) => {
    setSelectedMonth(event.target.value);
  },
);

/**
 * 集計画面で対象月を変更する。
 */
summaryMonthInput.addEventListener(
  "change",
  (event) => {
    setSelectedMonth(event.target.value);
  },
);

summaryYearSelect.addEventListener("change", (event) => {
  selectedYear = event.target.value;
  renderYearlyChart();
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

fixedTypeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    fixedCategorySelect.value = "";
    renderFixedCategorySelect();
  });
});

fixedForm.addEventListener("submit", (event) => {
  event.preventDefault();
  fixedMessage.textContent = "";

  const type = getSelectedFixedType();
  const categoryId = fixedCategorySelect.value;
  const name = fixedNameInput.value.trim();
  const amount = Number(fixedAmountInput.value);
  const day = Number(fixedDaySelect.value);
  const startMonth = fixedStartMonthInput.value;
  const endMonth = fixedEndMonthInput.value;
  const selectedCategory = categories.find((category) => {
    return category.id === categoryId && category.type === type;
  });

  if (!selectedCategory || (!selectedCategory.active && !editingFixedId)) {
    fixedMessage.textContent = "カテゴリを確認してください。";
    return;
  }

  if (!name) {
    fixedMessage.textContent = "名前を入力してください。";
    return;
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    fixedMessage.textContent = "1円以上の整数を入力してください。";
    return;
  }

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    fixedMessage.textContent = "毎月の日付を確認してください。";
    return;
  }

  if (!isValidMonthString(startMonth)) {
    fixedMessage.textContent = "開始月を選択してください。";
    return;
  }

  if (endMonth && !isValidMonthString(endMonth)) {
    fixedMessage.textContent = "終了月を確認してください。";
    return;
  }

  if (endMonth && endMonth < startMonth) {
    fixedMessage.textContent = "終了月は開始月以降にしてください。";
    return;
  }

  if (editingFixedId) {
    const index = fixedTransactions.findIndex((item) => {
      return item.id === editingFixedId;
    });

    if (index === -1) {
      fixedMessage.textContent = "更新する固定収支が見つかりません。";
      return;
    }

    fixedTransactions[index] = {
      ...fixedTransactions[index],
      type,
      categoryId,
      name,
      amount,
      day,
      startMonth,
      endMonth,
      updatedAt: new Date().toISOString(),
    };
    saveFixedTransactions();
    resetFixedForm();
    renderFixedTransactions();
    fixedMessage.textContent = "固定収支を更新しました。";
    return;
  }

  fixedTransactions.push({
    id: createId("fixed"),
    type,
    categoryId,
    name,
    amount,
    day,
    startMonth,
    endMonth,
    active: true,
    createdAt: new Date().toISOString(),
  });
  saveFixedTransactions();
  resetFixedForm();
  renderFixedTransactions();
  fixedMessage.textContent = "固定収支を登録しました。";
});

fixedCancelButton.addEventListener("click", () => {
  resetFixedForm();
  fixedMessage.textContent = "編集をキャンセルしました。";
});

fixedList.addEventListener("click", handleFixedAction);

fixedGenerationButton.addEventListener("click", () => {
  fixedGenerationMessage.textContent = "";

  try {
    const result = generateFixedTransactionsForMonth(
      fixedGenerationMonthInput.value,
    );

    if (result.applicableCount === 0) {
      fixedGenerationMessage.textContent =
        "この月に該当する有効な固定収支はありません。";
      return;
    }

    if (result.generatedCount === 0) {
      fixedGenerationMessage.textContent =
        "この月の固定収支はすべて反映済みです。";
      return;
    }

    fixedGenerationMessage.textContent =
      `${result.generatedCount}件を履歴へ反映しました。${
        result.skippedCount > 0
          ? `反映済み${result.skippedCount}件はスキップしました。`
          : ""
      }`;
  } catch (error) {
    console.error("固定収支の反映に失敗しました。", error);
    fixedGenerationMessage.textContent =
      error.message || "固定収支を反映できませんでした。";
  }
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

backupExportButton.addEventListener("click", () => {
  backupMessage.textContent = "";

  try {
    exportBackup();
  } catch (error) {
    console.error("バックアップの作成に失敗しました。", error);
    backupMessage.textContent =
      "バックアップを作成できませんでした。";
  }
});

backupImportButton.addEventListener("click", () => {
  backupMessage.textContent = "";
  backupFileInput.value = "";
  backupFileInput.click();
});

csvExportButton.addEventListener("click", () => {
  backupMessage.textContent = "";

  try {
    exportTransactionsCsv();
  } catch (error) {
    console.error("CSVの出力に失敗しました。", error);
    backupMessage.textContent = "CSVを出力できませんでした。";
  }
});

backupFileInput.addEventListener("change", async () => {
  const [file] = backupFileInput.files;

  if (!file) {
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    backupMessage.textContent =
      "ファイルが大きすぎます。5MB以下のJSONを選択してください。";
    return;
  }

  try {
    const parsedBackup = JSON.parse(await file.text());
    const restoredData = validateBackup(parsedBackup);
    const shouldRestore = window.confirm(
      `カテゴリ${restoredData.categories.length}件、収支${restoredData.transactions.length}件、固定収支${restoredData.fixedTransactions.length}件で現在のデータを置き換えますか？`,
    );

    if (!shouldRestore) {
      backupMessage.textContent = "復元をキャンセルしました。";
      return;
    }

    restoreBackup(restoredData);
    backupMessage.textContent =
      `カテゴリ${categories.length}件、収支${transactions.length}件、固定収支${fixedTransactions.length}件を復元しました。`;
  } catch (error) {
    console.error("バックアップの復元に失敗しました。", error);
    backupMessage.textContent = error instanceof SyntaxError
      ? "JSONファイルを読み込めませんでした。"
      : error.message || "バックアップを復元できませんでした。";
  } finally {
    backupFileInput.value = "";
  }
});

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

    setSelectedMonth(date.slice(0, 7));

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

  setSelectedMonth(date.slice(0, 7));

  resetTransactionForm();

  formMessage.textContent = "登録しました。";
});

/**
 * 初期表示。
 */
setToday();
initializeFixedDayOptions();
resetFixedForm();
fixedGenerationMonthInput.value = getCurrentMonth();
renderCategories();
renderFixedTransactions();
setSelectedMonth(getCurrentMonth());
