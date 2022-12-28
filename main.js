const input = document.querySelector(".wrapper__search");
const state = document.querySelector(".wrapper__status");
const resultsContainer = document.querySelector(".wrapper__results");
const reposContainer = document.querySelector(".wrapper__repos");
const debRep = debounce(getRepos, 500);
let controller;
let signal;

input.addEventListener("input", async () => {
  removeTxt();
  controller = new AbortController();
  signal = controller.signal;
  if (input.value.length == 0) controller.abort();
  state.textContent = input.value.length == 0 ? `` : `Ожидание`;
  await debRep(input.value)
    .then((res) => {
      if (input.value == "") return;
      state.textContent = `${
        res.length != 0
          ? `Показано ${res.length} репозиториев`
          : `Репозиторий не найден!`
      }`;
      removeTxt();
      listener(res);
    })
    .catch((e) => {
      if (e.name === "AbortError") {
        alert(`я отменяю запрос на сервер`);
      } else {
        alert("Ошибка API");
      }
    });
});

async function getRepos(name) {
  const repos = await fetch(
    `https://api.github.com/search/repositories?q=${name}&per_page=5`,
    { signal }
  );
  let response = await repos.json();
  return response["items"];
}

/// Создание предложения для выбора
function createTxt(text) {
  let txtcont = document.createElement("div");
  txtcont.textContent = text;
  txtcont.classList.add("results__txt");
  resultsContainer.appendChild(txtcont);
  return txtcont;
}

function removeTxt() {
  const cards = document.querySelectorAll(".results__txt");
  for (let el of cards) {
    el.remove();
  }
}

function createRepo(name, owner, stars) {
  const block = document.createElement("div");
  const content = document.createElement("div");
  const button = document.createElement("button");
  content.textContent = `Name: ${name} 
  Owner: ${owner} 
  Stars: ${stars}`;
  block.classList.add("result__content");
  block.classList.add("result__block");
  button.classList.add("repos__button");
  content.classList.add("test");
  block.append(content, button);
  reposContainer.appendChild(block);
  button.addEventListener("click", function () {
    button.removeEventListener("click", arguments.callee);
    block.remove();
  });
}

function listener() {
  for (let el of res) {
    const txt = createTxt(el.name);
    const { owner, name, stargazers_count: stars } = el;
    txt.addEventListener("click", function () {
      txt.removeEventListener("click", arguments.callee);
      createRepo(name, owner.login, stars);
      removeTxt();
      input.value = "";
      state.textContent = "";
    });
  }
}
/// Debouce
function debounce(fn, ms) {
  let timeout;
  return (arg) => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(fn(arg)), ms);
    });
  };
}
