// Fetching the keybinds for the buttons
let keyBinds = {};

fetch("keyBinds.json")
  .then(response => response.json())
  .then(data => {
    for (const [key, id] of Object.entries(data)) {
        const keyElement = document.getElementById(id);
        if (keyElement) keyBinds[key] = keyElement;
    }
});

// Button listener and animation with python via preload
if (window.keyEvents) {
  window.keyEvents.onKey(({ type, key }) => {
    const element = keyBinds[key];
    if (!element) return;

    const img = element.querySelector("img");
    if (!img) return;

    if (type === "down") {
      img.classList.add("pressed");
    } else if (type === "up") {
      img.classList.remove("pressed");
    }
  });
}

// Handling the reload after saving new key binds
if (window.electronAPI?.onKeybindReload) {
  window.electronAPI.onKeybindReload((newBindings) => {
    keyBinds = {}; // Clear current bindings

    for (const [key, id] of Object.entries(newBindings)) {
      const element = document.getElementById(id);
      if (element) {
        keyBinds[key] = element;
      }
    }

    console.log("Keybinds reloaded.");
  });
}
