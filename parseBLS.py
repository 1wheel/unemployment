import json
import sys
from sys import stdout

#takes a series id, returning an object containing its attributes iff the series has info about race, education, age, and/or sex
def parseSeriesId(l):			
	series = {}
	l = l.split('\t')
	if (int(l[1]) == 40 and l[2] == 'M' and int(l[5]) == 0 and int(l[17]) == 0 and int(l[31]) == 0 and int(l[29]) == 0 and int(l[7]) == 0 and int(l[14]) == 0 and int(l[19]) == 0):
		orgin = int(l[20])
		if (orgin == 0):
			race = int(l[22])
		elif (orgin == 1):
			race = 5
		else:
			race = 6
		age = int(l[6])
		education = int(l[9])
		id = l[0]
		if ((age == 10 or age == 28) and (race < 7) and (education != 34) and l[0][2] == 'U'):
			series['id'] = l[0].strip()
			series['description'] = l[3]
			series['age'] = age
			series['edu'] = education
			series['sex'] = int(l[27])
			series['race'] = race			
			series['data'] = []
	return series

#short list of series without ages saved ahead of time in order to more easily exclude all none 16-24 & 25+ series
serieses = [];
validIds = [];
ageLess = json.load(open('ageLess.json'))
for default in ageLess:
	serieses.append(default)
	validIds.append(default['id'])

#looks through list of every series, creating an array of objects returned from parseSeriesId
f = open('ln.series')
lines = f.readlines()
for l in lines:
	series = parseSeriesId(l)
	if 'id' in series:
		serieses.append(series)
		validIds.append(series['id'])

#scans every BLS data point, recording those that match one of the previosly found series
f = open('ln.data.1.AllData')
lines = f.readlines()
for i in range(4180000, len(lines)):  		#first useful entry starts after line 4000000
	line = lines[i].split('\t')
	stdout.write("\r%d" % i)
	stdout.flush()
	i = i + 1

	id = line[0].strip()
	#saves the data on the line if it has a valid id, is after 2001, and not a year adverage
	if id in validIds and int(line[1])>1990 and int(line[2][1:3]) != 13:
		index = validIds.index(id)
		temp = {}
		temp['t'] = line[1] + line[2][1:3]	#time of entry
		temp['v'] = float(line[3].strip())	#data value of entry
 		serieses[index]['data'].append(temp)
print len(serieses)

#saves the result to disk
json.dump(serieses, open('serieses.json', 'wb'))