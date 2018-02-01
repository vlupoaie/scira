import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import wraps
from SPARQLWrapper import SPARQLWrapper, JSON

from config.settings import DBLP_ENDPOINT, DEFAULT_PREFIXES, ANNOTATIONS_BEGIN, ANNOTATIONS_ITEM_LIST, \
    ATTRIBUTE_MAPPING, SIMPLE_SEARCH_DBLP, LABEL_SEARCH_DBLP, AUTHOR_SEARCH_DBLP, SUBJECT_SEARCH_DBLP


def _timed(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        start = time.time()
        content = func(self, *args, **kwargs)
        print('Query took: {:.3f} seconds ({})'.format(time.time() - start, func.__name__))
        return content

    return wrapper


def _annotate_json_ld(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        content = func(self, *args, **kwargs)
        json_ld_results = {"results": list()}
        for json_to_convert in content["results"]:
            json_ld = {"@context": ANNOTATIONS_BEGIN["@context"],
                       "@type": ANNOTATIONS_BEGIN["@type"]}
            for key in json_to_convert:
                values = ATTRIBUTE_MAPPING[key]
                if isinstance(values, list):
                    name_key_json_ld = values[0]
                    type_objects = values[1]["@type"]
                    json_ld[name_key_json_ld] = list()
                    list_json = json_to_convert[key]
                    for elem in list_json:
                        d = {"@type": ANNOTATIONS_ITEM_LIST["@type"],
                             "item": {'@type': type_objects}}
                        for kk in elem:
                            d["item"][ATTRIBUTE_MAPPING[kk]] = elem[kk]
                        json_ld[name_key_json_ld].append(d)
                else:
                    json_ld[values] = json_to_convert[key]
            json_ld_results["results"].append(json_ld)
        return json_ld_results

    return wrapper


class SparqlQuery:
    def __init__(self, property_cache=None, publications_cache=None, endpoints=None, prefixes=None):
        self._property_cache = property_cache
        self._publications_cache = publications_cache
        self._endpoint = endpoints or DBLP_ENDPOINT
        self._sparql = SPARQLWrapper(self._endpoint)
        self._prefixes = prefixes or DEFAULT_PREFIXES
        self._prefix_text = self._get_prefix_text(self._prefixes)
        self._header = ''
        self._select = []
        self._body = ''
        self._offset = 0
        self._limit = 500000

    def __str__(self):
        return self.get_query()

    @staticmethod
    def _get_prefix_text(prefixes):
        return '\n'.join('prefix {}: <{}>'.format(key, value) for key, value in prefixes.items()) + '\n'

    def _replace_prefixes(self):
        for key, value in self._prefixes.items():
            self._body = self._body.replace(value, key + ':')
        self._header = self._prefix_text + self._header

    def set_limit(self, limit):
        self._limit = limit

    def set_offset(self, offset):
        self._offset = offset

    def add_select(self, items):
        self._select.extend(items if type(items) in {list, tuple} else [items])

    def add_header(self, content):
        self._header += content + '\n'

    def add_body(self, content):
        self._body += content + '\n'

    def add_pattern(self, subject, edge, entity, label=False, optional=False, is_publication=False):
        if not label:
            pattern = '{subject} {property} ?{object} .'.format(subject=subject, property=edge, object=entity)
            self.add_select(entity)
        else:
            pattern = '{subject} {property} ?{object} .\n' \
                      '?{object} http://www.w3.org/2000/01/rdf-schema#label ?{object}_label .\n' \
                      'filter(lang(?{object}_label) = \'en\')'.format(subject=subject, property=edge, object=entity)
            self.add_select(entity)
            self.add_select(entity + '_label')
        if is_publication:
            pattern += '\n?{object} rdf:type swrc:Article .\n' \
                       '?{object}_type http://www.w3.org/2000/01/rdf-schema#label ?{object}_type_label .\n' \
                       'filter(lang(?{object}_type_label) = \'en\')'.format(object=entity)
            self.add_select(entity + '_type_label')
        self._body += pattern + '\n' if not optional else 'optional {{\n{}\n}}\n'.format(pattern)

    def _prepare_query(self):
        self._replace_prefixes()

    def get_query(self):
        prepared_select = ' '.join('?' + item for item in self._select)
        return '{header}\nselect {select} where {{\n{body}\n}}\noffset {offset}\nlimit {limit}'.format(
            header=self._header, select=prepared_select, body=self._body, offset=self._offset, limit=self._limit)

    def execute(self):
        self._prepare_query()
        self._sparql.setQuery(self.get_query())
        self._sparql.setReturnFormat(JSON)
        return self._sparql.query().convert()['results']['bindings']


class SparqlHelperDblp:
    @_timed
    @_annotate_json_ld
    def publication_info(self, publication_id):
        # build and execute query
        sparql_query = SparqlQuery()

        # title
        sparql_query.add_body('<{}> dc:title ?title .'.format(publication_id))
        sparql_query.add_select('title')

        # authors
        sparql_query.add_body('<{}> dc:creator ?author .\n?author rdfs:label ?author_label .'.format(publication_id))
        sparql_query.add_select('author')
        sparql_query.add_select('author_label')

        # published date
        sparql_query.add_body('optional{{\n<{}> dcterms:issued ?publication_date .\n}}'.format(publication_id))
        sparql_query.add_select('publication_date')

        # main subject
        sparql_query.add_body('optional{{\n<{}> dc:subject ?main_subject .\n}}'.format(publication_id))
        sparql_query.add_select('main_subject')

        # published in
        sparql_query.add_body('optional{{\n<{}> swrc:journal ?published_in .\n'
                              '?published_in rdfs:label ?published_in_label .\n}}'.format(publication_id))
        sparql_query.add_select('published_in')
        sparql_query.add_select('published_in_label')

        results = sparql_query.execute()

        # deduplicate results
        parsed_results = {}
        author_set = set()
        publication_date_set = set()
        published_in_set = set()
        main_subject_set = set()

        parsed_results['publication'] = results[0]['title']['value']
        parsed_results['publication_id'] = publication_id
        parsed_results['resource_type'] = 'scientific article'
        parsed_results['author_list'] = []
        parsed_results['cites_list'] = []
        parsed_results['cited_by_list'] = []
        parsed_results['publication_date_list'] = []
        parsed_results['published_in_list'] = []
        parsed_results['language_list'] = []
        parsed_results['main_subject_list'] = []
        parsed_results['resource_list'] = []
        for result in results:
            if 'author' in result:
                value = result['author_label']['value']
                value_id = result['author']['value']
                if (value_id, value) not in author_set:
                    author_set.add((value_id, value))
                    parsed_results['author_list'].append({'author': value, 'author_id': value_id})
            if 'publication_date' in result:
                value = result['publication_date']['value']
                if value not in publication_date_set:
                    publication_date_set.add(value)
                    parsed_results['publication_date_list'].append({'date': value})
            if 'published_in' in result:
                value = result['published_in_label']['value']
                value_id = result['published_in']['value']
                if (value_id, value) not in published_in_set:
                    published_in_set.add((value_id, value))
                    parsed_results['published_in_list'].append({'journal': value, 'journal_id': value_id})
            if 'main_subject' in result:
                value = result['main_subject']['value']
                if value not in main_subject_set:
                    main_subject_set.add(value)
                    parsed_results['main_subject_list'].append({'main_subject': value})
        return {'results': [parsed_results]}

    @_timed
    @_annotate_json_ld
    def author_info(self, author_id):
        # build and execute query
        sparql_query = SparqlQuery()

        # author name
        sparql_query.add_body('<{}> rdfs:label ?author_name.'.format(author_id))
        sparql_query.add_select('author_name')

        # publications from author
        sparql_query.add_body('?publication dc:creator <{}> .'.format(author_id))
        sparql_query.add_select('publication')

        # title
        sparql_query.add_body('?publication dc:title ?title .')
        sparql_query.add_select('title')

        results = sparql_query.execute()

        # parse results
        parsed_results = {
            'author': results[0]['author_name']['value'],
            'author_id': author_id
        }
        parsed_results.update({'publication_list': [
            {'publication': result['title']['value'],
             'publication_id': result['publication']['value'],
             'resource_type': 'scientific article'}
            for result in results]
        })
        return {'results': [parsed_results]}

    @_timed
    @_annotate_json_ld
    def journal_info(self, journal_id):
        # build and execute query
        sparql_query = SparqlQuery()

        # author name
        sparql_query.add_body('<{}> rdfs:label ?journal_name.'.format(journal_id))
        sparql_query.add_select('journal_name')

        # publications from author
        sparql_query.add_body('?publication swrc:journal <{}> .'.format(journal_id))
        sparql_query.add_select('publication')

        # title
        sparql_query.add_body('?publication dc:title ?title .')
        sparql_query.add_select('title')

        results = sparql_query.execute()

        # parse results
        parsed_results = {
            'journal': results[0]['journal_name']['value'],
            'journal_id': journal_id
        }
        parsed_results.update({'publication_list': [
            {'publication': result['title']['value'],
             'publication_id': result['publication']['value'],
             'resource_type': 'scientific article'}
            for result in results]
        })
        return {'results': [parsed_results]}

    @_timed
    def publication_simple_search(self, query, page=1, size=10):
        # build and execute query
        sparql_query = SparqlQuery()
        sparql_query.add_body(SIMPLE_SEARCH_DBLP.format(query=query))
        sparql_query.add_select('publication')
        sparql_query.set_offset((page - 1) * size)
        sparql_query.set_limit(size)
        results = sparql_query.execute()

        parsed_results = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(self.publication_info, result['publication']['value']) for result in results]
            for future in as_completed(futures):
                result = future.result()
                parsed_results.append(result['results'][0])
        return {'results': parsed_results}

    @_timed
    def publication_advanced_search(self, title=None, authors=None, topics=None, types=None,
                                    after=None, before=None, page=1, size=10):
        # build and execute query
        sparql_query = SparqlQuery()
        sparql_query.add_select('publication')
        sparql_query.add_body('?publication rdf:type swrc:Article .')

        if title:
            sparql_query.add_body(LABEL_SEARCH_DBLP.format(title=title))

        if authors:
            sparql_query.add_body(AUTHOR_SEARCH_DBLP.format(author='|'.join(authors)))

        if topics:
            sparql_query.add_body(SUBJECT_SEARCH_DBLP.format(subjects='|'.join(topics)))

        # if after or before:
        #     sparql_query.add_body('\n?publication dcterms:issued ?publication_date .')
        # if after:
        #     sparql_query.add_body('\nfilter(?publication_date > "{year}"^^xsd:gYear)'.format(year=after[2]))
        # if before:
        #     sparql_query.add_body('\nfilter(?publication_date < "{year}"^^xsd:gYear)'.format(year=before[2]))

        sparql_query.set_offset((page - 1) * size)
        sparql_query.set_limit(size)
        results = sparql_query.execute()

        parsed_results = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(self.publication_info, result['publication']['value']) for result in results]
            for future in as_completed(futures):
                result = future.result()
                parsed_results.append(result['results'][0])
        return {'results': parsed_results}
