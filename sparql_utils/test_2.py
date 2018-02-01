import sys
import json
from sparql_helper_dblp import SparqlHelperDblp

pub = 'http://dblp.l3s.de/d2r/resource/publications/journals/4or/AminiSK16'
pub2 = 'http://dblp.l3s.de/d2r/resource/publications/conf/www/BeszteriV07'
aut = 'http://dblp.l3s.de/d2r/resource/authors/Keyvan_Amini'
jur = 'http://dblp.l3s.de/d2r/resource/journals/4or'
query1 = 'computer vision'
query2 = 'machine learning'
query3 = 'technology'
query4 = 'web'
query5 = 'python'
query6 = 'java'

h = SparqlHelperDblp()
#x = h.publication_info(pub2)
#x = h.author_info(aut)
#x = h.journal_info(jur)
#x = h.publication_simple_search(query3)
#x = h.publication_advanced_search(authors=['Jack', 'Paul'], types=['scientific article', 'science book'])
x = h.publication_advanced_search(after=(4, 1, 2000), before=(8, 15, 2017))
with open(sys.argv[1], 'w') as handle:
    handle.write(json.dumps(x, indent=4))
