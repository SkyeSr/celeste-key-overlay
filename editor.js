let bindings = {};

fetch("keyBinds.json")
  .then(res => res.json())
  .then(data => {
    bindings = data;
    populateEditor();
  });

function populateEditor() {
  const container = document.getElementById("editor");
  container.innerHTML = "";

  const idToKeys = {};

  for (const [key, id] of Object.entries(bindings)) {
    if (!idToKeys[id]) idToKeys[id] = [];
    idToKeys[id].push(key);
  }

  for (const [id, keys] of Object.entries(idToKeys)) {
    const div = document.createElement("div");
    div.classList.add("binding");

    const label = document.createElement("label");
    label.textContent = `${id}: `;

    const input = document.createElement("input");
    input.type = "text";
    input.value = keys.join(", ");
    input.dataset.id = id;

    const button = document.createElement("button");
    button.textContent = "Set Key(s)";
    button.onclick = () => captureKeys(input);

    div.appendChild(label);
    div.appendChild(input);
    div.appendChild(button);
    container.appendChild(div);
  }
}

function save() {
  const inputs = document.querySelectorAll("#editor input");
  const newBindings = {};

  inputs.forEach(input => {
    const keys = input.value.split(",").map(k => k.trim().toLowerCase());
    const id = input.dataset.id;
    keys.forEach(k => {
      if (k) {
        // Convert 'space' to actual space character " "
        if (k === 'space') {
          k = ' ';
        }
        newBindings[k] = id;
      }
    });
  });

  window.electronAPI.saveKeyBinds(newBindings);
}


let isCapturing = false;
let currentHandler = null;

function captureKeys(input) {
  if (isCapturing) {
    stopCapturing();
    input.placeholder = "";
    return;
  }

  input.value = ""; // Clear current value
  input.focus();
  input.placeholder = "Press key(s)... (Enter = done, Esc = cancel)";
  isCapturing = true;

  const captured = new Set();

  currentHandler = function (e) {
    e.preventDefault();
    const key = normalizeKey(e.key);

    if (key === 'enter') {
      finish();
      return;
    }

    if (key === 'escape') {
      stopCapturing();
      input.value = ""; // Clear on cancel
      input.placeholder = "";
      return;
    }

    if (key && !captured.has(key)) {
      captured.add(key);
      input.value = Array.from(captured).join(", ");
    }
  };

  window.addEventListener('keydown', currentHandler);
}

function finish() {
  stopCapturing();
}

function stopCapturing() {
  if (currentHandler) {
    window.removeEventListener('keydown', currentHandler);
    currentHandler = null;
  }
  isCapturing = false;
}

function normalizeKey(key) {
  const map = {
    ' ': 'space',
    'arrowup': 'arrowup',
    'arrowdown': 'arrowdown',
    'arrowleft': 'arrowleft',
    'arrowright': 'arrowright',
    'ctrl': 'control',
    'control': 'control',
  };

  const lower = key.toLowerCase();
  return map[lower] || lower;
}
