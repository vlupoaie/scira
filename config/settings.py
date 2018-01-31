import os

##################
# General settings
##################

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))

CACHE_LOCATION_WIKIDATA = os.path.join(ROOT_DIR, 'cache_wikidata')

CACHE_LOCATION_DBLP = os.path.join(ROOT_DIR, 'cache_dblp')

#################
# Sparql settings
#################

DEFAULT_ENDPOINT = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'

DEFAULT_PREFIXES = {
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'wd': 'http://www.wikidata.org/entity/',
    'wdt': 'http://www.wikidata.org/prop/direct/',
    'wikibase': 'http://wikiba.se/ontology#',
}

PROPERTIES = ['instance of', 'author name string', 'author', 'cites', 'publication date', 'published in',
              'language of work or name', 'main subject', 'full work available at']

RETURNS_PUBLICATIONS = {'cites', '^cites'}

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
    {'name': 'type', 'property': 'instance of', 'label': True, 'optional': False},
    {'name': 'author', 'property': 'author', 'label': True, 'optional': True},
    {'name': 'author_name', 'property': 'author name string', 'label': False, 'optional': True},
    {'name': 'cites', 'property': 'cites', 'label': True, 'optional': True},
    {'name': 'cited_by', 'property': '^cites', 'label': True, 'optional': True},
    {'name': 'publication_date', 'property': 'publication date', 'label': False, 'optional': True},
    {'name': 'published_in', 'property': 'published in', 'label': True, 'optional': True},
    {'name': 'language', 'property': 'language of work or name', 'label': True, 'optional': True},
    {'name': 'main_subject', 'property': 'main subject', 'label': True, 'optional': True},
    {'name': 'resource', 'property': 'full work available at', 'label': False, 'optional': True},
]

SIMPLE_SEARCH = r'''
?publication wdt:P31 ?publication_type .
filter(?publication_type = wd:Q13442814)

?publication rdfs:label ?publication_label .
filter(lang(?publication_label) = 'en')
filter(regex(?publication_label, "(\\W|^){query}(\\W|$)"))'''

TYPE_SEARCH = r'''
?publication wdt:P31 ?publication_type .
filter({types})'''

LABEL_SEARCH = r'''
?publication rdfs:label ?publication_label .
filter(lang(?publication_label) = 'en')
filter(regex(?publication_label, '{title}', 'i'))'''

AUTHOR_SEARCH = r'''
?publication wdt:P50 ?publication_author .
?publication_author rdfs:label ?author_label .
filter(lang(?author_label) = 'en') .
filter(regex(?author_label, '{author}', 'i'))'''

SUBJECT_SEARCH = r'''
?publication wdt:P921 ?publication_subject .
?publication_subject rdfs:label ?subject_label .
filter(regex(?subject_label, '{subjects}', 'i'))'''

##################
# JSON-LD settings
##################

ATTRIBUTE_MAPPING = {
    "author_list": ["author", {"@type": "Person"}],
    "author": "name",
    "author_id": "identifier",
    "cites_list": ["citation", {"@type": "CreativeWork"}],
    "publication": "name",
    "publication_id": "identifier",
    "cited_by_list": ["subjectOf", {"@type": "CreativeWork"}],
    "publication_date_list": ["datePublished", {"@type": "Date"}],
    "date": "dateCreated",
    "published_in_list": ["isPartOf", {"@type": "CreativeWorkSeries"}],
    "journal": "name",
    "journal_id": "identifier",
    "language_list": ["inLanguage", {"@type": "Language"}],
    "language": "name",
    "language_id": "identifier",
    "main_subject_list": ["keywords", {"@type": "Text"}],
    "main_subject": "name",
    "main_subject_id": "identifier",
    "resource_list": ["associatedMedia", {"@type": "MediaObject"}],
    "resource": "contentUrl",
    "publication_list": ["publication", {"@type": "CreativeWork"}],
    "resource_type": "learningResourceType"
}

ANNOTATIONS_BEGIN = {
    "@context": "http://schema.org",
    "@type": "CreativeWork"}

ANNOTATIONS_ITEM_LIST = {
    "@type": "ListItem",
    "item": {}
}
