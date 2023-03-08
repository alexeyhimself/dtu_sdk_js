import json

f = open('coverage/coverage-final.json')
data = json.load(f)
tested_file_path = list(data.keys())[0]
values = data[tested_file_path]
each_line_report = values.get('s')

total_lines = 0
covered_lines = 0
for each_line, coverage in each_line_report.items():
	if coverage != 0:
		covered_lines += 1
	total_lines += 1

coverage = round(covered_lines * 100 / total_lines, 1)

if coverage < 100:
	msg = "Test coverage is less than 100%: {0}%"
	print(msg.format(coverage))
	exit(1)
