
import json
import os

source_file = "src/locales/en/calculation.json"
target_dir = "src/locales"

# These are the files we want to update
target_langs = [
    "as", "bn", "bho", "gu", "hi", "hry", "kn", "ml", "mr", "raj", "ta", "te", "ur"
]

def load_json(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def propagate_keys():
    en_data = load_json(source_file)
    if not en_data:
        print(f"Error: Could not load {source_file}")
        return

    en_by_volume = en_data.get("concrete", {}).get("byVolume", {})
    if not en_by_volume:
        print("Error: 'byVolume' key not found in source file")
        return

    for lang in target_langs:
        filepath = os.path.join(target_dir, lang, "calculation.json")
        lang_data = load_json(filepath)
        
        if not lang_data:
            print(f"Warning: Could not load {filepath}, skipping...")
            continue

        # Ensure minimal structure exists
        if "concrete" not in lang_data:
            lang_data["concrete"] = {}
        
        # Check if byVolume exists inside concrete (nested structure) vs separate key
        # The file structure seems to vary. 
        # In en/calculation.json, byVolume is nested inside concrete: concrete -> byVolume (Wait, looking at the viewed file content for en/calculation.json earlier...)
        # Line 167: "concrete": { ... }
        # Line 207: "byVolume": { ... }
        # Actually in en/calculation.json, `byVolume` is inside `concrete` object.

        # Let's check where the keys are in target files.
        # Based on previous edits:
        # "concrete": { ... }, "byVolume": { ... } -> This implies byVolume might be a sibling of concrete in some files or nested?
        
        # In `gu/calculation.json` (viewed earlier):
        # "concrete": { ... },
        # "byVolume": { ... }
        # They seem to be at the root level?
        
        # Let's re-verify en/calculation.json structure from the `view_file` output (Step 321):
        # Line 167: "concrete": {
        # ...
        # Line 207: "byVolume": { ... }
        # }
        # So in ENGLISH, `byVolume` is INSIDE `concrete`.
        
        # However, my previous manual fixes (Step 279 etc) added `byVolume` at what looks like the root level or sibling of concrete?
        # Let's check the diff again.
        # Step 279: 
        # -        "byVolume": {
        # -            "concreteByVolume": "Concrete by Volume"
        # -        },
        # This was deleting it from inside `concrete`? No, let's look at indentation.
        # It was removing a `byVolume` block and adding a new one.
        # The indent assumes it is inside `concrete`?
        
        # Let's trust the structure of `en/calculation.json` as the source of truth.
        # `concrete` -> `byVolume`.
        
        # We need to find `concrete` -> `byVolume` in target files.
        # If the file has `byVolume` at root, we might want to move it or just update it where it is?
        # To be safe, I'll update `concrete.byVolume` if it exists.
        
        target_concrete = lang_data.get("concrete", {})
        if not target_concrete:
             # If concrete key not found, try root level? No, stick to structure.
             pass

        # Ensure concrete exists
        if "concrete" not in lang_data:
            lang_data["concrete"] = {}
            
        # Get or create byVolume
        if "byVolume" not in lang_data["concrete"]:
             lang_data["concrete"]["byVolume"] = {}
             
        target_by_volume = lang_data["concrete"]["byVolume"]
        
        # Merge keys
        changes_count = 0
        for key, value in en_by_volume.items():
            if key not in target_by_volume:
                target_by_volume[key] = value
                changes_count += 1
            # If exists, we keep existing translation (do not overwrite)
            
        if changes_count > 0:
            print(f"Updated {lang}: Added {changes_count} new keys.")
            save_json(filepath, lang_data)
        else:
            print(f"No changes needed for {lang}.")

if __name__ == "__main__":
    propagate_keys()
