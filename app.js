"use strict";

const CATEGORY_STORAGE_KEY = "kakeiboCategories";

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

const transactionForm = document.getElementById(
  "transaction-form",
);
const formMessage = document.getElementById("form-message");
const dateInput = document.getElementById("date");
const categorySelect = document.getElementById("category");

const transactionTypeInputs = document.querySelectorAll(
  'input[name="transaction-type"]',
);

const categoryAddForm = document.getElementById(
  "category-add-form",
);
const categoryTypeInput =
  document.getElementById("category-type");
const categoryNameInput =
  document.getElementById("category-name");
const categoryMessage =
  document.getElementById("category-message");

const expenseCategoryList = document.getElementById(
  "expense-category-list",
);
const incomeCategoryList = document.getElementById(
  "income-category-list",
);

let categories = loadCategories();

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
  const savedCategories = localStorage.getItem(
    CATEGORY_STORAGE_KEY,
  );

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
          (category.type === "expense" ||
            category.type === "income")
        );
      })
      .map((category) => ({
        id: category.id,
        name: category.name,
        type: category.type,
        active: category.active !== false,
      }));
  } catch (error) {
    console.error(
      "カテゴリの読み込みに失敗しました。",
      error,
    );

    return getDefaultCategories();
  }
}

/**
 * カテゴリをlocalStorageへ保存する。
 */
function saveCategories() {
  localStorage.setItem(
    CATEGORY_STORAGE_KEY,
    JSON.stringify(categories),
  );
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
 * 入力画面のカテゴリ選択肢を更新する。
 */
function renderCategorySelect() {
  const transactionType = getSelectedTransactionType();
  const previousValue = categorySelect.value;

  categorySelect.replaceChildren();

  const placeholderOption =
    document.createElement("option");

  placeholderOption.value = "";
  placeholderOption.textContent = "選択してください";

  categorySelect.appendChild(placeholderOption);

  const availableCategories = categories.filter(
    (category) => {
      return (
        category.type === transactionType &&
        category.active
      );
    },
  );

  availableCategories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category.id;
    option.textContent = category.name;

    categorySelect.appendChild(option);
  });

  const previousCategoryStillExists =
    availableCategories.some((category) => {
      return category.id === previousValue;
    });

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
  activeButton.textContent = category.active
    ? "非表示"
    : "再表示";

  actionArea.append(renameButton, activeButton);
  listItem.append(categoryName, actionArea);

  return listItem;
}

/**
 * 支出または収入カテゴリの一覧を表示する。
 */
function renderCategoryList(type, listElement) {
  listElement.replaceChildren();

  const filteredCategories = categories.filter(
    (category) => category.type === type,
  );

  if (filteredCategories.length === 0) {
    const emptyMessage = document.createElement("li");

    emptyMessage.className = "category-empty-message";
    emptyMessage.textContent =
      "カテゴリが登録されていません。";

    listElement.appendChild(emptyMessage);
    return;
  }

  filteredCategories.forEach((category) => {
    listElement.appendChild(
      createCategoryItem(category),
    );
  });
}

/**
 * 設定画面のカテゴリ一覧を更新する。
 */
function renderCategorySettings() {
  renderCategoryList(
    "expense",
    expenseCategoryList,
  );

  renderCategoryList("income", incomeCategoryList);
}

/**
 * カテゴリ関連の画面をすべて更新する。
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
 * カテゴリ用の一意なIDを作成する。
 */
function createCategoryId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `category-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

/**
 * 初期表示の日付を今日にする。
 */
function setToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(today.getDate()).padStart(
    2,
    "0",
  );

  dateInput.value = `${year}-${month}-${day}`;
}

/**
 * 表示する画面を切り替える。
 */
function showPage(pageId) {
  pages.forEach((page) => {
    page.classList.toggle(
      "active",
      page.id === pageId,
    );
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
 * 名称変更または表示状態変更を処理する。
 */
function handleCategoryAction(event) {
  const actionButton = event.target.closest(
    "button[data-action]",
  );

  if (!actionButton) {
    return;
  }

  const categoryId = actionButton.dataset.categoryId;
  const category = categories.find(
    (item) => item.id === categoryId,
  );

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
      window.alert(
        "カテゴリ名を入力してください。",
      );
      return;
    }

    if (
      categoryNameExists(
        trimmedName,
        category.type,
        category.id,
      )
    ) {
      window.alert(
        "同じ名前のカテゴリがすでにあります。",
      );
      return;
    }

    category.name = trimmedName;
  }

  if (actionButton.dataset.action === "toggle") {
    category.active = !category.active;
  }

  saveCategories();
  renderCategories();
}

/**
 * 下部タブの処理。
 */
navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

/**
 * 支出・収入が変わったらカテゴリ選択肢も変える。
 */
transactionTypeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    categorySelect.value = "";
    renderCategorySelect();
  });
});

/**
 * カテゴリ追加処理。
 */
categoryAddForm.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    const name = categoryNameInput.value.trim();
    const type = categoryTypeInput.value;

    categoryMessage.textContent = "";

    if (!name) {
      categoryMessage.textContent =
        "カテゴリ名を入力してください。";
      return;
    }

    if (categoryNameExists(name, type)) {
      categoryMessage.textContent =
        "同じ名前のカテゴリがすでにあります。";
      return;
    }

    categories.push({
      id: createCategoryId(),
      name,
      type,
      active: true,
    });

    saveCategories();
    renderCategories();

    categoryNameInput.value = "";

    categoryMessage.textContent =
      "カテゴリを追加しました。";
  },
);

/**
 * カテゴリ一覧のボタン処理。
 */
expenseCategoryList.addEventListener(
  "click",
  handleCategoryAction,
);

incomeCategoryList.addEventListener(
  "click",
  handleCategoryAction,
);

/**
 * 登録ボタンの仮処理。
 */
transactionForm.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    formMessage.textContent =
      "入力内容を確認しました。保存機能は次の段階で追加します。";
  },
);

setToday();
renderCategories();