#################
# SPARQL settings
#################

DEFAULT_ENDPOINT = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'

DEFAULT_PREFIXES = {
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'wd': 'http://www.wikidata.org/entity/',
    'wdt': 'http://www.wikidata.org/prop/direct/',
    'wikibase': 'http://wikiba.se/ontology#',
}

PROPERTIES = ['instance of', 'author', 'cites', 'publication date', 'published in', 'language of work or name',
              'main subject', 'full work available at']

DISCOVER_PROPERTY = '''
  ?entity http://www.w3.org/2000/01/rdf-schema#label "{property}"@en.
  ?entity http://wikiba.se/ontology#directClaim ?property
'''

# maybe: 'diploma thesis', 'academic writing', 'reference work', 'patent', 'thesis', 'technical report'

PUBLICATION_TYPES = ['scientific article', 'science book', 'academic journal article',
                     'report', 'textbook', 'doctoral thesis', 'publication']

DISCOVER_PUBLICATION = '''
  ?publication http://www.w3.org/2000/01/rdf-schema#label "{entity}"@en
'''


REQUIRED_PAPER_INFO = [
    {'name': 'author', 'property': 'author', 'label': True, 'optional': True},
    {'name': 'cites', 'property': 'cites', 'label': True, 'optional': True},
    {'name': 'cited_by', 'property': '^cites', 'label': True, 'optional': True},
    {'name': 'publication_date', 'property': 'publication date', 'label': False, 'optional': True},
    {'name': 'published_in', 'property': 'published in', 'label': True, 'optional': True},
    {'name': 'language', 'property': 'language of work or name', 'label': True, 'optional': True},
    {'name': 'main_subject', 'property': 'main subject', 'label': True, 'optional': True},
    {'name': 'resource', 'property': 'full work available at', 'label': False, 'optional': True},
]
