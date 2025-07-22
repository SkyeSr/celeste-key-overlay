from pynput import keyboard
import json

SPECIAL_KEYS = {
    keyboard.Key.space: " ",
    keyboard.Key.ctrl_l: "control",
    keyboard.Key.ctrl_r: "control",
    keyboard.Key.left: "arrowleft",
    keyboard.Key.right: "arrowright",
    keyboard.Key.up: "arrowup",
    keyboard.Key.down: "arrowdown",
}

pressed_keys = set()

def emit(event_type, key_str):
    message = json.dumps({"type": event_type, "key": key_str})
    print(message, flush=True)
    
def key_to_str(key):
    if key in SPECIAL_KEYS:
        return SPECIAL_KEYS[key]

    try:
        if key.char:
            # Convert control characters like '\x03' -> 'c'
            if ord(key.char) < 32:
                return chr(ord(key.char) + 96)
            return key.char.lower()
    except AttributeError:
        pass

    return str(key).replace("Key.", "").lower()

def on_press(key):
    key_str = key_to_str(key)
    if key_str in pressed_keys:
        return
    pressed_keys.add(key_str)
    emit("down", key_str)

def on_release(key):
    key_str = key_to_str(key)
    if key_str in pressed_keys:
        pressed_keys.remove(key_str)
        emit("up", key_str)

listener = keyboard.Listener(on_press=on_press, on_release=on_release)
listener.start()
listener.join()

print(listener)