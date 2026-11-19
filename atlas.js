"use strict";
const NT = JSON.parse(document.getElementById("ntData").textContent);
const currentFile = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nt-navlink").forEach((a) => {
  if (a.getAttribute("href") === "./" + currentFile)
    a.setAttribute("aria-current", "page");
});
const tabEls = [...document.querySelectorAll(".tab")],
  allowed = new Set(tabEls.map((t) => t.dataset.tab));
function switchSection() {
  const hash = decodeURIComponent(location.hash.slice(1));
  const active = allowed.has(hash) ? hash : "circuits";
  tabEls.forEach((t) => {
    const on = t.dataset.tab === active;
    t.setAttribute("aria-current", on ? "page" : "false");
    t.setAttribute("aria-selected", String(on));
  });
  document.querySelectorAll(".section").forEach((s) => {
    const on = s.id === active;
    s.classList.toggle("active", on);
    s.hidden = !on;
  });
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", switchSection);
tabEls.forEach((t) =>
  t.addEventListener("click", () => {
    if (location.hash === "#" + t.dataset.tab) switchSection();
  }),
);
switchSection();
const cb = document.getElementById("circuitButtons"),
  cd = document.getElementById("circuitDetails");
function renderCircuit(index) {
  const c = NT.circuits[index];
  cd.replaceChildren();
  const heading = document.createElement("div");
  heading.className = "details-title";
  heading.style.color = "var(--nt-accent)";
  heading.textContent = c[0];
  cd.append(heading);
  for (const [label, value] of [
    ["المنشأ", c[1]],
    ["الهدف", c[2]],
    ["الوظيفة", c[3]],
    ["الارتباط السريري وحدود التفسير", c[4]],
  ]) {
    const box = document.createElement("div");
    box.className = "fact";
    const title = document.createElement("strong");
    title.textContent = label;
    box.append(title, document.createTextNode(value));
    cd.append(box);
  }
  cb.querySelectorAll("button").forEach((b, i) =>
    b.classList.toggle("active", i === index),
  );
}
NT.circuits.forEach((c, i) => {
  const b = document.createElement("button");
  b.className = "path-btn";
  b.style.setProperty("--sel", "var(--nt-accent)");
  const dot = document.createElement("span");
  dot.className = "dot";
  b.append(dot, document.createTextNode(c[0]));
  b.addEventListener("click", () => renderCircuit(i));
  cb.append(b);
});
renderCircuit(0);
const filterBox = document.getElementById("regionFilters"),
  regionList = document.getElementById("regionList");
const cats = ["الكل", ...new Set(NT.regions.map((r) => r[2]))];
let cat = "الكل";
cats.forEach((c) => {
  const b = document.createElement("button");
  b.className = "filter";
  b.textContent = c;
  b.addEventListener("click", () => {
    cat = c;
    renderRegions();
  });
  filterBox.append(b);
});
function renderRegions() {
  const q = document.getElementById("regionSearch").value.trim().toLowerCase();
  const found = NT.regions.filter(
    (r) =>
      (cat === "الكل" || r[2] === cat) && r.join(" ").toLowerCase().includes(q),
  );
  regionList.replaceChildren();
  filterBox
    .querySelectorAll("button")
    .forEach((b) => b.classList.toggle("active", b.textContent === cat));
  found.forEach((r) => {
    const d = document.createElement("details");
    d.className = "region";
    const summary = document.createElement("summary");
    const b = document.createElement("b");
    b.textContent = r[0] + " (" + r[1] + ")";
    const pill = document.createElement("span");
    pill.className = "pill " + r[5];
    pill.textContent = r[5];
    summary.append(b, pill);
    const body = document.createElement("div");
    body.className = "body";
    for (const [label, txt] of [
      ["الوظيفة", r[3]],
      ["الارتباط أو التحفظ", r[4]],
    ]) {
      const line = document.createElement("p"),
        strong = document.createElement("strong");
      strong.textContent = label + ": ";
      line.append(strong, document.createTextNode(txt));
      body.append(line);
    }
    d.append(summary, body);
    regionList.append(d);
  });
  document.getElementById("regionCount").textContent =
    "عدد النتائج: " + found.length + " من أصل " + NT.regions.length;
}
document
  .getElementById("regionSearch")
  .addEventListener("input", renderRegions);
document
  .getElementById("expandAll")
  .addEventListener("click", () =>
    regionList.querySelectorAll("details").forEach((d) => (d.open = true)),
  );
document
  .getElementById("collapseAll")
  .addEventListener("click", () =>
    regionList.querySelectorAll("details").forEach((d) => (d.open = false)),
  );
renderRegions();
let qi = 0,
  score = 0,
  locked = false;
function quizRender() {
  locked = false;
  const [q, answers, correct, explain] = NT.quiz[qi];
  document.getElementById("progress").textContent =
    "السؤال " + (qi + 1) + " من " + NT.quiz.length + " • النتيجة: " + score;
  document.getElementById("question").textContent = q;
  document.getElementById("feedback").textContent = "";
  document.getElementById("next").classList.add("hidden");
  document.getElementById("restart").classList.add("hidden");
  const box = document.getElementById("answers");
  box.replaceChildren();
  answers.forEach((a, i) => {
    const b = document.createElement("button");
    b.className = "answer";
    b.textContent = a;
    b.addEventListener("click", () => {
      if (locked) return;
      locked = true;
      if (i === correct) score++;
      box.querySelectorAll("button").forEach((x, j) => {
        if (j === correct) x.classList.add("correct");
        else if (j === i) x.classList.add("wrong");
      });
      document.getElementById("feedback").textContent =
        (i === correct ? "إجابة صحيحة. " : "الإجابة غير صحيحة. ") + explain;
      const next = document.getElementById("next");
      next.textContent =
        qi === NT.quiz.length - 1 ? "عرض النتيجة" : "السؤال التالي";
      next.classList.remove("hidden");
    });
    box.append(b);
  });
}
document.getElementById("next").addEventListener("click", () => {
  qi++;
  if (qi < NT.quiz.length) quizRender();
  else {
    document.getElementById("progress").textContent = "اكتمل الاختبار";
    document.getElementById("question").textContent =
      "النتيجة: " + score + " / " + NT.quiz.length;
    document.getElementById("answers").replaceChildren();
    document.getElementById("feedback").textContent =
      "يمكنك مراجعة الأقسام ثم إعادة الاختبار.";
    document.getElementById("next").classList.add("hidden");
    document.getElementById("restart").classList.remove("hidden");
  }
});
document.getElementById("restart").addEventListener("click", () => {
  qi = 0;
  score = 0;
  quizRender();
});
quizRender();
