import json
from sparql_helper import SparqlHelper

pub = 'http://www.wikidata.org/entity/Q38287400'
aut = 'http://www.wikidata.org/entity/Q5777626'
jur = 'http://www.wikidata.org/entity/Q15614164'
query = 'computer vision'

h = SparqlHelper()
#x = h.publication_info(pub)
#x = h.author_info(aut)
#x = h.journal_info(jur)
x = h.publication_simple_search(query)
print(json.dumps(x, indent=4))
