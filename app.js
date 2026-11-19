const LS_CHARS = "fe3h_characters_v2";
const LS_SUPPORTS = "fe3h_supports_v2";
const LS_VERSION = "fe3h_data_version";

const LS_ITEMS = "fe3h_items_v1";

function loadItems() {
  const raw = localStorage.getItem(LS_ITEMS);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  const items = JSON.parse(JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(LS_ITEMS, JSON.stringify(items));
  return items;
}

function saveItems(items) {
  localStorage.setItem(LS_ITEMS, JSON.stringify(items));
}

async function loadData() {
  const cachedVersion = localStorage.getItem(LS_VERSION);
  const cachedChars = localStorage.getItem(LS_CHARS);
  const cachedSupports = localStorage.getItem(LS_SUPPORTS);

  if (cachedVersion === DATA_VERSION && cachedChars && cachedSupports) {
    return {
      characters: JSON.parse(cachedChars),
      supports: JSON.parse(cachedSupports)
    };
  }

  const characters = INITIAL_CHARACTERS;
  const supports = INITIAL_SUPPORTS;

  localStorage.setItem(LS_CHARS, JSON.stringify(characters));
  localStorage.setItem(LS_SUPPORTS, JSON.stringify(supports));
  localStorage.setItem(LS_VERSION, DATA_VERSION);

  return { characters, supports };
}

function saveCharacters(characters) {
  localStorage.setItem(LS_CHARS, JSON.stringify(characters));
}

function saveSupports(supports) {
  localStorage.setItem(LS_SUPPORTS, JSON.stringify(supports));
}

function getCharacter(id, characters) {
  return characters.find(c => c.id === id);
}

function pairKey(pair) {
  return [...pair].sort().join("|");
}

const RANK_ORDER = ["C", "C+", "B", "B+", "A", "A+", "S"];

const HOUSE_COLORS = {
  "黑鹫": "#8d332d",
  "青狮": "#2b306a",
  "金鹿": "#877a24",
  "教会": "#696969",
  "灰狼": "#5f5a6f"
};

function getSupportBadge(characterId, supports) {
  const pairs = supports.filter(s => s.pair.includes(characterId));
  if (!pairs.length) return "无支援记录";

  const total = pairs.length;
  const done = pairs.filter(s =>
    s.ranks.every(r => s.completed.includes(r))
  ).length;

  return `支援完成 ${done}/${total} 人`;
}

function renderHome(data) {
  const grid = document.getElementById("characterGrid");
  const filters = document.getElementById("houseFilters");

  const iconMap = {
    "黑鹫": "🦅",
    "青狮": "🦁",
    "青狮子": "🦁",
    "金鹿": "🦌",
    "教会": "⛪",
    "灰狼": "🐺"
  };

  const houses = [...new Set(data.characters.map(c => c.house))];
  let activeHouse = null;
  const filterButtons = [];

  filters.innerHTML = "";
  houses.forEach(house => {
    const sample = data.characters.find(c => c.house === house);
    const btn = document.createElement("button");
    btn.className = "house-filter";
    btn.dataset.house = house;
    btn.style.setProperty("--house-color", sample.houseColor);
    btn.textContent = `${iconMap[house] || "🏳️"} ${house}`;

    btn.addEventListener("click", () => {
      activeHouse = activeHouse === house ? null : house;

      filterButtons.forEach(b => {
        b.classList.toggle("active", b.dataset.house === activeHouse);
      });

      grid.querySelectorAll(".character-card").forEach(card => {
        const show = !activeHouse || card.dataset.house === activeHouse;
        card.style.display = show ? "" : "none";
        card.draggable = !activeHouse;
      });
    });

    filterButtons.push(btn);
    filters.appendChild(btn);
  });

  grid.innerHTML = data.characters.map(c => `
    <a class="character-card"
       href="character.html?id=${encodeURIComponent(c.id)}"
       data-id="${c.id}"
       data-house="${c.house}"
       draggable="true"
       style="--house-color:${c.houseColor}">
      <span class="recruit-badge">${c.recruited ? "已挖角" : "未挖角"}</span>
      <img class="avatar" src="${c.portrait || fallbackAvatar(c.name, c.houseColor)}" alt="${c.name}" data-fallback="${fallbackAvatar(c.name, c.houseColor)}" onerror="this.src=this.dataset.fallback">
      <span class="name">${c.name}</span>
      <span class="support-badge">${getSupportBadge(c.id, data.supports)}</span>
    </a>
  `).join("");

  const indicator = document.createElement("div");
  indicator.className = "drop-indicator";
  grid.appendChild(indicator);

  let draggedId = null;
  let draggedEl = null;
  let insertIndex = -1;

  function visibleCards() {
    return [...grid.querySelectorAll(".character-card")].filter(
      c => c.style.display !== "none" && c !== draggedEl
    );
  }

  function computeInsertIndex(mx, my) {
    const cards = visibleCards();
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      if (my < r.top) return i;
      if (my >= r.top && my <= r.bottom) {
        if (mx < r.left + r.width / 2) return i;
      }
    }
    return cards.length;
  }

  function showIndicator(idx) {
    const cards = visibleCards();
    if (!cards.length) {
      indicator.style.display = "none";
      return;
    }
    const gr = grid.getBoundingClientRect();
    let x, y, h;

    if (idx < cards.length) {
      const r = cards[idx].getBoundingClientRect();
      x = r.left - gr.left - 8;
      y = r.top - gr.top;
      h = r.height;
    } else {
      const r = cards[cards.length - 1].getBoundingClientRect();
      x = r.right - gr.left + 8;
      y = r.top - gr.top;
      h = r.height;
    }

    x = Math.max(0, Math.min(grid.clientWidth - 4, x));
    indicator.style.left = x + "px";
    indicator.style.top = y + "px";
    indicator.style.height = h + "px";
    indicator.style.display = "block";
  }

  grid.ondragover = (e) => {
    if (!draggedId || activeHouse) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    insertIndex = computeInsertIndex(e.clientX, e.clientY);
    showIndicator(insertIndex);
  };

  grid.ondragleave = (e) => {
    if (!grid.contains(e.relatedTarget)) {
      indicator.style.display = "none";
    }
  };

  grid.ondrop = (e) => {
    if (!draggedId) return;
    e.preventDefault();
    indicator.style.display = "none";

    const fromIdx = data.characters.findIndex(c => c.id === draggedId);
    if (fromIdx === -1) {
      draggedId = null;
      draggedEl = null;
      return;
    }

    const cards = visibleCards();
    let targetId = null;
    if (insertIndex >= 0 && insertIndex < cards.length) {
      targetId = cards[insertIndex].dataset.id;
    }

    const [moved] = data.characters.splice(fromIdx, 1);
    let toIdx = targetId
      ? data.characters.findIndex(c => c.id === targetId)
      : data.characters.length;
    if (toIdx === -1) toIdx = data.characters.length;
    data.characters.splice(toIdx, 0, moved);

    saveCharacters(data.characters);
    draggedId = null;
    draggedEl = null;
    renderHome(data);
  };

  grid.querySelectorAll(".character-card").forEach(card => {
    card.addEventListener("dragstart", e => {
      if (activeHouse) {
        e.preventDefault();
        return;
      }
      draggedId = card.dataset.id;
      draggedEl = card;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      indicator.style.display = "none";
      draggedId = null;
      draggedEl = null;
    });
  });
}

function renderCharacter(data) {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const c = getCharacter(id, data.characters);
  const detail = document.getElementById("characterDetail");

  if (!c) {
    detail.innerHTML = "<h1>没有找到这个角色</h1><p><a href='index.html'>返回首页</a></p>";
    return;
  }

  detail.innerHTML = `
    <section class="profile" style="--house-color:${c.houseColor}">
      <img class="profile-avatar" src="${c.portrait || fallbackAvatar(c.name, c.houseColor)}" alt="${c.name}" data-fallback="${fallbackAvatar(c.name, c.houseColor)}" onerror="this.src=this.dataset.fallback">
      <div>
        <h1>${c.name}</h1>
        <p>阵营：${c.house}</p>
        <label class="recruit-toggle">
          <input type="checkbox" id="recruitedToggle" ${c.recruited ? "checked" : ""}>
          已挖角
        </label>
      </div>
    </section>
    <div class="toolbar">
      <button id="editCharacterBtn" class="primary-btn">编辑档案</button>
    </div>

    <section class="info-grid">
      <div class="info-box">
        <h2>失物</h2>
        <ul>${c.lostItems.map(item => `<li>${item}</li>`).join("")}</ul>
      </div>
      <div class="info-box">
        <h2>喜欢的茶叶</h2>
        <ul>${c.favoriteTeas.map(tea => `<li>${tea}</li>`).join("")}</ul>
      </div>
      <div class="info-box">
        <h2>喜欢的礼物</h2>
        <ul>${(c.favoritegifts || []).map(gift => `<li>${gift}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="support-section">
      <div class="support-head">
        <h2>支援进度</h2>
        <button id="addSupportBtn">＋ 添加支援对象</button>
      </div>
      <p class="hint">勾选代表已完成。已完成的条目会自动排到下方。</p>
      <div id="supportList"></div>
    </section>
        <!-- 新增：喜欢的话题 -->
    <section class="info-box" style="margin-top: 18px;">
      <h2>喜欢的话题</h2>
      <div class="topic-list">
        ${(c.favoriteTopics || []).length 
          ? (c.favoriteTopics || []).map(t => `<span class="topic-item">${escapeAttr(t)}</span>`).join("") 
          : '<span class="item-empty">暂无记录</span>'}
      </div>
    </section>
    <!-- 新增：茶会结束时对话 -->
    <section class="info-box" style="margin-top: 18px;">
      <h2>茶会结束时对话</h2>
      <div class="dialog-list">
        ${(c.teaPartyDialogs || []).length 
          ? (c.teaPartyDialogs || []).map(d => `
              <div class="dialog-box">
                <div class="dialog-char">“${escapeAttr(d.line)}”</div>
                <div class="dialog-options">
                  ${(d.answers || []).map(a => `<span class="dialog-option">${escapeAttr(a)}</span>`).join("")}
                </div>
              </div>
            `).join("") 
          : '<span class="item-empty">暂无记录</span>'}
      </div>
    </section>
  `;

  document.getElementById("recruitedToggle").addEventListener("change", e => {
    c.recruited = e.target.checked;
    saveCharacters(data.characters);
  });
  document.getElementById("editCharacterBtn").addEventListener("click", () => {
    openCharacterEditor(data, id);
  });
  document.getElementById("addSupportBtn").addEventListener("click", () => {
    openSupportEditor(data, id);
  });

  renderSupportList(data, id);
}

function renderSupportList(data, characterId) {
  const list = document.getElementById("supportList");
  if (!list) return;

  const iconMap = {
    "黑鹫": "🦅",
    "青狮": "🦁",
    "青狮子": "🦁",
    "金鹿": "🦌",
    "教会": "⛪",
    "灰狼": "🐺"
  };

  const myPairs = data.supports.filter(s => s.pair.includes(characterId));

  if (!myPairs.length) {
    list.innerHTML = "<p>暂无支援记录。</p>";
    return;
  }

  // 未全部完成的在上，全部完成的在下
  myPairs.sort((a, b) => {
    const aDone = a.ranks.every(r => a.completed.includes(r)) ? 1 : 0;
    const bDone = b.ranks.every(r => b.completed.includes(r)) ? 1 : 0;
    return aDone - bDone;
  });

  list.innerHTML = myPairs.map(s => {
    const otherId = s.pair.find(x => x !== characterId);
    const other = getCharacter(otherId, data.characters);
    const otherName = other ? other.name : otherId;
    const otherHouse = other ? other.house : "";
    const houseIcon = iconMap[otherHouse] || "🏳️";
    const fallback = fallbackAvatar(otherName, other ? other.houseColor : "#888");
    const src = other && other.portrait ? other.portrait : fallback;
    const allDone = s.ranks.every(r => s.completed.includes(r));

    const ranksHtml = s.ranks.map(rank => {
      const done = s.completed.includes(rank);
      return `
        <label class="rank-item ${done ? "done" : ""}">
          <input type="checkbox"
                 data-pair="${pairKey(s.pair)}"
                 data-rank="${rank}"
                 ${done ? "checked" : ""}>
          <span>${rank}</span>
        </label>
      `;
    }).join("");

    return `
      <div class="support-card ${allDone ? "all-done" : ""}">
        <img class="support-avatar" src="${src}" alt="${otherName}"
             data-fallback="${fallback}"
             onerror="this.src=this.dataset.fallback">
        <div class="support-meta">
          <span class="support-house">${houseIcon}</span>
          <span class="support-name">${otherName}</span>
        </div>
        <div class="support-ranks">${ranksHtml}</div>
        <div class="support-actions">
          <button class="support-edit" data-pair="${pairKey(s.pair)}" data-other="${escapeAttr(otherName)}">修改</button>
          <button class="support-del" data-pair="${pairKey(s.pair)}" data-other="${escapeAttr(otherName)}">删除</button>
        </div>
      </div>
    `;
  }).join("");

  list.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", () => {
      const s = data.supports.find(x => pairKey(x.pair) === cb.dataset.pair);
      if (!s) return;

      const rank = cb.dataset.rank;

      if (cb.checked) {
        if (!s.completed.includes(rank)) s.completed.push(rank);
      } else {
        s.completed = s.completed.filter(r => r !== rank);
      }

      saveSupports(data.supports);
      renderSupportList(data, characterId);
    });
  });

  list.querySelectorAll(".support-del").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.pair;
      const other = btn.dataset.other;
      if (!confirm(`确定删除与「${other}」的所有支援记录？`)) return;
      data.supports = data.supports.filter(s => pairKey(s.pair) !== key);
      saveSupports(data.supports);
      renderSupportList(data, characterId);
    });
  });
    list.querySelectorAll(".support-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      openSupportRankEditor(data, characterId, btn.dataset.pair, btn.dataset.other);
    });
  });
}

function initSearch(data) {
  const input = document.getElementById("globalSearch");
  const results = document.getElementById("searchResults");
  if (!input || !results) return;

  const index = [];

  data.characters.forEach(c => {
    index.push({ type: "角色", text: c.name, id: c.id });
    index.push({ type: "阵营", text: `${c.house} · ${c.name}`, id: c.id });
    c.lostItems.forEach(item => index.push({ type: "失物", text: item, id: c.id }));
    c.favoriteTeas.forEach(tea => index.push({ type: "茶叶", text: tea, id: c.id }));
    (c.favoritegifts || []).forEach(gift => index.push({ type: "礼物", text: gift, id: c.id }));
  });

  data.supports.forEach(s => {
    s.ranks.forEach(r => {
      const a = getCharacter(s.pair[0], data.characters);
      const b = getCharacter(s.pair[1], data.characters);
      if (!a || !b) return;
      index.push({
        type: "支援",
        text: `${a.name} × ${b.name} — 支援 ${r}`,
        id: a.id
      });
    });
  });

  function escRe(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(text, q) {
    if (!q) return text;
    const re = new RegExp(`(${escRe(q)})`, "ig");
    return text.replace(re, "<mark>$1</mark>");
  }

  input.addEventListener("input", () => {
    const raw = input.value.trim();
    const q = raw.toLowerCase();

    if (!q) {
      results.style.display = "none";
      results.innerHTML = "";
      return;
    }

    const matches = index
      .filter(item => item.text.toLowerCase().includes(q))
      .slice(0, 12);

    if (!matches.length) {
      results.innerHTML = `<div class="search-empty">没有结果</div>`;
      results.style.display = "block";
      return;
    }

    results.innerHTML = matches.map(m => `
      <a href="character.html?id=${encodeURIComponent(m.id)}">
        <span class="search-text">${highlight(m.text, raw)}</span>
        <small>${m.type}</small>
      </a>
    `).join("");

    results.style.display = "block";
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap")) {
      results.style.display = "none";
    }
  });
}

// ===== 编辑功能 =====

function escapeAttr(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function splitList(str) {
  return str.split(/[，,、]/).map(x => x.trim()).filter(Boolean);
}

function fallbackAvatar(name, color) {
  const initial = (name || "?").trim().charAt(0) || "?";
  const bg = color || "#888";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="64" fill="${bg}"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" fill="#fff" font-size="56" font-family="sans-serif">${initial}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function openModal(innerHtml) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal-box">${innerHtml}</div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.remove();
  });
  return overlay;
}

function openCharacterEditor(data, existingId) {
  const existing = existingId ? data.characters.find(c => c.id === existingId) : null;
  const isNew = !existing;
  const c = existing ? { ...existing } : {
    id: "", name: "", house: "黑鹫",
    lostItems: [], favoriteTeas: [], favoritegifts: [], portrait: "", recruited: false
  };

  // 旧数据里的“蓝狮”“青狮子”都映射到“青狮”
  const initialHouse = HOUSE_COLORS[c.house]
    ? c.house
    : (c.house === "蓝狮" || c.house === "青狮子" ? "青狮" : "黑鹫");

  const overlay = openModal(`
    <h2>${isNew ? "添加角色" : "编辑角色"}</h2>
    <label>姓名<input id="f_name" value="${escapeAttr(c.name)}"></label>
    <label>ID（唯一，英文小写，用于支援关系）<input id="f_id" value="${escapeAttr(c.id)}" ${isNew ? "" : "disabled"}></label>
    <label>阵营
      <select id="f_house">
        ${Object.keys(HOUSE_COLORS).map(h =>
          `<option value="${h}" ${h === initialHouse ? "selected" : ""}>${h}</option>`
        ).join("")}
      </select>
    </label>
    <label>头像路径<input id="f_portrait" value="${escapeAttr(c.portrait)}" placeholder="portraits/xxx.png"></label>
    <label>失物（逗号分隔）<textarea id="f_lost">${escapeAttr(c.lostItems.join("，"))}</textarea></label>
    <div class="field-label">喜欢茶叶</div>
    <div class="item-picker" id="picker_teas"></div>
    <div class="field-label">喜欢礼物</div>
    <div class="item-picker" id="picker_gifts"></div>
    <label>喜欢的话题（逗号或顿号分隔）<textarea id="f_topics">${escapeAttr((c.favoriteTopics || []).join("，"))}</textarea></label>
    <label>茶会结束时对话（每行一个，格式：台词 | 选项1, 选项2）<textarea id="f_teadialogs" style="min-height:120px;" placeholder="例如：能和你一起喝茶，真的很开心。| 我也是, 希望还能有下次">${escapeAttr((c.teaPartyDialogs || []).map(d => `${d.line} | ${d.answers.join(", ")}`).join("\n"))}</textarea></label>
    <label class="inline"><input type="checkbox" id="f_recruited" ${c.recruited ? "checked" : ""}> 已挖角</label>
    <div class="modal-actions">
      ${isNew ? "" : '<button id="mDelete" class="danger-btn">删除角色</button>'}
      <button id="mCancel">取消</button>
      <button id="mSave" class="primary-btn">保存</button>
    </div>
  `);

  const allItems = loadItems();
  const pickedTeas = [...(c.favoriteTeas || [])];
  const pickedGifts = [...(c.favoritegifts || [])];
  initItemPicker(overlay.querySelector("#picker_teas"), "teas", pickedTeas, allItems);
  initItemPicker(overlay.querySelector("#picker_gifts"), "gifts", pickedGifts, allItems);

  overlay.querySelector("#mCancel").onclick = () => overlay.remove();
  if (!isNew) {
    overlay.querySelector("#mDelete").onclick = () => {
      if (!confirm(`确定删除「${c.name}」？`)) return;
      if (!confirm("这会同时删除该角色参与的所有支援关系，确定继续？")) return;

      const idx = data.characters.findIndex(x => x.id === existingId);
      if (idx !== -1) data.characters.splice(idx, 1);

      data.supports = data.supports.filter(s => !s.pair.includes(existingId));

      saveCharacters(data.characters);
      saveSupports(data.supports);
      location.href = "index.html";
    };
  }

  overlay.querySelector("#mSave").onclick = () => {
    const name = overlay.querySelector("#f_name").value.trim();
    const id = overlay.querySelector("#f_id").value.trim();
    if (!name || !id) { alert("姓名和 ID 不能为空"); return; }
    if (isNew && data.characters.some(x => x.id === id)) { alert("这个 ID 已被占用"); return; }
    if (isNew && !/^[a-z0-9_]+$/.test(id)) { alert("ID 只能用小写字母、数字、下划线"); return; }

    const house = overlay.querySelector("#f_house").value;
    
    // 解析茶会对话
    const dialogText = overlay.querySelector("#f_teadialogs").value;
    const parsedDialogs = dialogText.split("\n").map(line => {
      line = line.trim();
      if (!line) return null;
      // 支持半角竖线 | 和全角竖线 ｜
      const parts = line.split(/[|｜]/); 
      const charLine = parts[0].trim();
      const answers = parts[1] ? splitList(parts[1]) : [];
      return charLine ? { line: charLine, answers } : null;
    }).filter(Boolean); // 过滤掉空行

    const updated = {
      id,
      name,
      house,
      houseColor: HOUSE_COLORS[house],
      portrait: overlay.querySelector("#f_portrait").value.trim(),
      lostItems: splitList(overlay.querySelector("#f_lost").value),
      favoriteTeas: getPickerValues(overlay.querySelector("#picker_teas")),
      favoritegifts: getPickerValues(overlay.querySelector("#picker_gifts")),
      favoriteTopics: splitList(overlay.querySelector("#f_topics").value), // 新加
      teaPartyDialogs: parsedDialogs, // 新加
      recruited: overlay.querySelector("#f_recruited").checked
    };

    if (isNew) {
      data.characters.push(updated);
    } else {
      const idx = data.characters.findIndex(x => x.id === existingId);
      data.characters[idx] = updated;
    }

    saveCharacters(data.characters);
    location.reload();
  };
}

function openSupportEditor(data, characterId) {
  const me = data.characters.find(c => c.id === characterId);
  const existingPairs = data.supports.map(s => pairKey(s.pair));
  const candidates = data.characters.filter(o =>
    o.id !== characterId && !existingPairs.includes(pairKey([characterId, o.id]))
  );

  if (!candidates.length) {
    alert("没有可添加的支援对象了（可能都已建立过记录）");
    return;
  }

  const overlay = openModal(`
    <h2>为 ${me.name} 添加支援对象</h2>
    <label>对象
      <select id="s_other">
        ${candidates.map(o => `<option value="${o.id}">${o.name}</option>`).join("")}
      </select>
    </label>
    <fieldset>
      <legend>该配对存在的支援等级</legend>
      ${RANK_ORDER.map(r =>
        `<label class="inline"><input type="checkbox" value="${r}" ${["C","B","A"].includes(r) ? "checked" : ""}> ${r}</label>`
      ).join("")}
    </fieldset>
    <div class="modal-actions">
      <button id="mCancel">取消</button>
      <button id="mSave" class="primary-btn">保存</button>
    </div>
  `);

  overlay.querySelector("#mCancel").onclick = () => overlay.remove();
  overlay.querySelector("#mSave").onclick = () => {
    const otherId = overlay.querySelector("#s_other").value;
    const checked = [...overlay.querySelectorAll("fieldset input:checked")].map(x => x.value);
    if (!checked.length) { alert("至少选一个支援等级"); return; }
    data.supports.push({
      pair: [characterId, otherId],
      ranks: RANK_ORDER.filter(r => checked.includes(r)),
      completed: []
    });
    saveSupports(data.supports);
    location.reload();
  };
}

function openSupportRankEditor(data, characterId, key, otherName) {
  const s = data.supports.find(x => pairKey(x.pair) === key);
  if (!s) return;

  const overlay = openModal(`
    <h2>修改与「${escapeAttr(otherName)}」的支援</h2>
    <p class="hint" style="margin-top:-10px;">勾选这对角色实际存在的支援等级。取消勾选会移除该等级及其完成记录。</p>
    <fieldset>
      <legend>包含的支援等级</legend>
      ${RANK_ORDER.map(r =>
        `<label class="inline"><input type="checkbox" value="${r}" ${s.ranks.includes(r) ? "checked" : ""}> ${r}</label>`
      ).join("")}
    </fieldset>
    <div class="modal-actions">
      <button id="mCancel">取消</button>
      <button id="mSave" class="primary-btn">保存</button>
    </div>
  `);

  overlay.querySelector("#mCancel").onclick = () => overlay.remove();
  overlay.querySelector("#mSave").onclick = () => {
    const checked = [...overlay.querySelectorAll("fieldset input:checked")].map(x => x.value);
    if (!checked.length) { alert("至少保留一个支援等级"); return; }
    
    // 重新排序生成新的 ranks 列表
    s.ranks = RANK_ORDER.filter(r => checked.includes(r));
    
    // 清理：如果某个等级被取消了，那么它的完成记录也应该被删掉
    s.completed = s.completed.filter(r => s.ranks.includes(r));

    saveSupports(data.supports);
    overlay.remove();
    renderSupportList(data, characterId); // 局部刷新，体验更丝滑
  };
}

function exportBackup(data) {
  const payload = {
    characters: data.characters,
    supports: data.supports,
    items: loadItems()
  };
  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: "application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "fe3h-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      if (!Array.isArray(obj.characters) || !Array.isArray(obj.supports)) {
        throw new Error("文件格式不对");
      }
      localStorage.setItem(LS_CHARS, JSON.stringify(obj.characters));
      localStorage.setItem(LS_SUPPORTS, JSON.stringify(obj.supports));

      if (obj.items && Array.isArray(obj.items.teas) && Array.isArray(obj.items.gifts)) {
        localStorage.setItem(LS_ITEMS, JSON.stringify(obj.items));
      }

      localStorage.setItem(LS_VERSION, DATA_VERSION);
      location.reload();
    } catch (e) {
      alert("导入失败：" + e.message);
    }
  };
  reader.readAsText(file);
}

// ===== 物品选择器 =====

function renderItemPicker(container, kind, selected, items) {
  const all = items[kind] || [];
  const available = all.filter(x => !selected.includes(x));
  const label = kind === "teas" ? "茶叶" : "礼物";

  container.innerHTML = `
    <div class="item-selected">
      ${selected.length
        ? selected.map(x =>
            `<span class="item-tag" data-value="${escapeAttr(x)}">${escapeAttr(x)}<button type="button" class="item-remove">×</button></span>`
          ).join("")
        : '<span class="item-empty">尚未选择</span>'}
    </div>
    <div class="item-controls">
      <select class="item-select">
        <option value="">从库中选择${label}…</option>
        ${available.map(x => `<option value="${escapeAttr(x)}">${escapeAttr(x)}</option>`).join("")}
      </select>
      <input class="item-new-input" placeholder="新建${label}">
      <button type="button" class="item-new-btn">＋</button>
    </div>
  `;

  container.querySelectorAll(".item-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.parentElement.dataset.value;
      const idx = selected.indexOf(val);
      if (idx !== -1) selected.splice(idx, 1);
      renderItemPicker(container, kind, selected, items);
    });
  });

  const select = container.querySelector(".item-select");
  select.addEventListener("change", () => {
    if (!select.value) return;
    if (!selected.includes(select.value)) selected.push(select.value);
    renderItemPicker(container, kind, selected, items);
  });

  const newInput = container.querySelector(".item-new-input");
  const newBtn = container.querySelector(".item-new-btn");

  function addNew() {
    const val = newInput.value.trim();
    if (!val) return;
    if (!items[kind].includes(val)) {
      items[kind].push(val);
      saveItems(items);
    }
    if (!selected.includes(val)) selected.push(val);
    renderItemPicker(container, kind, selected, items);
  }

  newBtn.addEventListener("click", addNew);
  newInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNew();
    }
  });
}

function initItemPicker(container, kind, selected, items) {
  if (!container) return;
  renderItemPicker(container, kind, selected, items);
}

function getPickerValues(container) {
  if (!container) return [];
  return [...container.querySelectorAll(".item-tag")].map(x => x.dataset.value);
}
