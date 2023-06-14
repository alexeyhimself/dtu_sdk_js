import json
import os

MINIMUM_COVERAGE_PERCENT = 60

test_run_exit_code = os.system('npx jest --coverage')
if test_run_exit_code != 0:
	exit(test_run_exit_code)

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

msg = "Test coverage is: {0}%"
print(msg.format(coverage))

if coverage < MINIMUM_COVERAGE_PERCENT:
	msg = "This is less than {0}% minimum threshold, so I fail CI whith exit 1"
	print(msg.format(MINIMUM_COVERAGE_PERCENT))
	exit(1)
