import sys
import json
from sparql_helper_wikidata import SparqlHelperWikidata

pub = 'http://www.wikidata.org/entity/Q38287400'
aut = 'http://www.wikidata.org/entity/Q5777626'
jur = 'http://www.wikidata.org/entity/Q15614164'
query1 = 'computer vision'
query2 = 'machine learning'
query3 = 'technology'
query4 = 'web'
query5 = 'python'
query6 = 'java'

h = SparqlHelperWikidata()
#x = h.publication_info(pub)
#x = h.author_info(aut)
#x = h.journal_info(jur)
#x = h.publication_simple_search(query6)
#x = h.publication_advanced_search(authors=['Jack', 'Paul'], types=['scientific article', 'science book'])
x = h.publication_advanced_search(after=(2010, 4), before=(2010, 8))
with open(sys.argv[1], 'w') as handle:
    handle.write(json.dumps(x, indent=4))
