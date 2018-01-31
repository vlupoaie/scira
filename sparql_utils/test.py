import sys
import json
from sparql_helper import SparqlHelper

pub = 'http://www.wikidata.org/entity/Q38287400'
aut = 'http://www.wikidata.org/entity/Q5777626'
jur = 'http://www.wikidata.org/entity/Q15614164'
query1 = 'computer vision'
query2 = 'machine learning'
query3 = 'technology'
query4 = 'web'
query5 = 'python'

h = SparqlHelper()
#x = h.publication_info(pub)
#x = h.author_info(aut)
#x = h.journal_info(jur)
x = h.publication_simple_search(query5)
with open(sys.argv[1], 'w') as handle:
    handle.write(json.dumps(x, indent=4))
