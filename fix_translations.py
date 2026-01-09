
import os
import re
import glob

print("Script started.", flush=True)

# Keys to add
new_keys = {
    "unit": "Unit",
    "length_L": "Length - L",
    "width_W": "Width - W",
    "depth_D": "Depth - D",
    "thickness_T": "Thickness - T",
    "height_H": "Height - H",
    "rise_R": "Rise - R",
    "tread_T": "Tread - T",
    "baseDepth_D1": "Base Depth - D1",
    "midDepth_D2": "Mid Depth - D2",
    "topDepth_D3": "Top Depth - D3",
    "length_L1": "Length - L1",
    "length_L2": "Length - L2",
    "length_L3": "Length - L3",
    "totalSteps_N": "Total Steps - N",
    "depth_D3": "Depth - D3"
}

def update_file(filepath):
    print(f"Processing {filepath}...", flush=True)
    
    if "en\\calculation.json" in filepath or "en/calculation.json" in filepath:
        print(f"Skipping {filepath} (already updated)", flush=True)
        return

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}", flush=True)
        return

    # Step 1: Find and extract concreteByVolume from the first block
    pattern = r'"byVolume":\s*\{\s*"concreteByVolume":\s*"(.*?)"\s*\},'
    match = re.search(pattern, content, re.DOTALL)
    
    translation = "Concrete by Volume"
    if match:
        translation = match.group(1)
        print(f"  Found translation: {translation}", flush=True)
        # Remove the first block
        content = content.replace(match.group(0), "", 1)
    else:
        print("  First byVolume block not found or already merged.", flush=True)

    # Step 2: Find the main byVolume block
    block_start = content.find('"byVolume": {')
    if block_start == -1:
        print("  Error: Could not find byVolume block.", flush=True)
        return

    # Check if length_L is already in this block
    if '"length_L"' in content[block_start:]:
        print("  Files seem to be already updated.", flush=True)
        return
        
    # Prepare insertion string
    # We insert at the beginning of the object
    # Check if concreteByVolume is already there
    insertion = ""
    if '"concreteByVolume"' not in content[block_start:]:
         insertion += f'\n            "concreteByVolume": "{translation}",'
         
    for k, v in new_keys.items():
        insertion += f'\n            "{k}": "{v}",'
    
    insert_pos = block_start + 13
    
    new_content = content[:insert_pos] + insertion + content[insert_pos:]
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("  Updated.", flush=True)
    except Exception as e:
        print(f"Error writing {filepath}: {e}", flush=True)

# Get all calculation.json files
files = glob.glob('src/locales/*/calculation.json')
print(f"Found {len(files)} files via glob.", flush=True)

if len(files) == 0:
    # Try absolute path or loose search
    print("Trying walk...", flush=True)
    for root, dirs, files in os.walk("src/locales"):
        for file in files:
            if file == "calculation.json":
                update_file(os.path.join(root, file))
else:
    for file in files:
        update_file(file)

print("Script finished.", flush=True)
