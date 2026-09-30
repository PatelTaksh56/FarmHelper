import os
import re
from collections import defaultdict

src_dir = 'src'
import_graph = defaultdict(list)
imported_by = defaultdict(list)

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.ts') or f.endswith('.tsx'):
            path = os.path.join(root, f).replace('\\', '/')
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
            matches = re.findall(r'from\s+[\'"]([^\'"]+)[\'"]', content)
            matches += re.findall(r'import\s+[\'"]([^\'"]+)[\'"]', content)
            for m in matches:
                import_graph[path].append(m)
                imported_by[m].append(path)

print("=== SRC DEPENDENCY GRAPH ===")
for path in sorted(import_graph.keys()):
    print(f"\nFile: {path}")
    print("  Imports:")
    for imp in import_graph[path]:
        print(f"    - {imp}")

print("\n=== REVERSE DEPENDENCY LOOKUP ===")
all_src_files = set(sorted(import_graph.keys()))
for path in sorted(all_src_files):
    # Check how many files import this path
    basename = os.path.basename(path).split('.')[0]
    importers = []
    for f, imps in import_graph.items():
        for imp in imps:
            if basename in imp or path in imp:
                importers.append(f)
    print(f"{path}: Imported by {len(set(importers))} files -> {list(set(importers))}")
