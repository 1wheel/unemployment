import json
input = json.load(open('seriesesRaw.json'))
output = []
for series in input:
	newSeries = {}
	newSeries['age'] = series['age']
	newSeries['id'] = series['id']
	output.append(newSeries)

print output

