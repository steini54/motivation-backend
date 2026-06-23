import sys

motivation_css_path = 'c:/Project/CV Generator Client/motivation-backend/frontend/vitagen/motivation/style.css'
lebenslauf_css_path = 'c:/Project/CV Generator Client/motivation-backend/frontend/vitagen/lebenslauf/lstyle.css'

with open(motivation_css_path, 'r', encoding='utf-8') as f:
    lines_src = f.readlines()

with open(lebenslauf_css_path, 'r', encoding='utf-8') as f:
    lines_target = f.readlines()

replace_content = lines_src[247:680]

start_target = -1
end_target = -1

for i, line in enumerate(lines_target):
    if line.startswith('.photo-card {'):
        start_target = i
    if start_target != -1 and line.startswith('.ai-button {'):
        end_target = i
        break

if start_target == -1 or end_target == -1:
    print("Could not find target block bounds")
    sys.exit(1)

new_lines = lines_target[:start_target] + replace_content + lines_target[end_target:]

with open(lebenslauf_css_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Replaced {end_target - start_target} lines with {len(replace_content)} lines.")
