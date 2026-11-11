import json

# Check that every area in CHESTS_DATA (35 areas) has either real or schematic entry
with open("tools/chests_extracted.json", "r", encoding="utf-8") as f:
    chests = json.load(f)
with open("tools/chest_map_assets.json", "r", encoding="utf-8") as f:
    assets = json.load(f)

areas_in_chests = set(c["area"] for c in chests)
real_areas = set(assets["real"].keys())
schematic_areas = set(assets["schematic"].keys())

print(f"Total areas in chests: {len(areas_in_chests)}")
print(f"Real areas: {len(real_areas)} -> {sorted(list(real_areas))}")
print(f"Schematic areas: {len(schematic_areas)}")

missing = areas_in_chests - (real_areas | schematic_areas)
print(f"Missing areas: {len(missing)}")
if missing:
    print("Missing:", missing)
else:
    print("ALL 35 AREAS ARE 100% COVERED!")
