import os
import time
import pickle
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import wraps
from SPARQLWrapper import SPARQLWrapper, JSON

from config.settings import DEFAULT_ENDPOINT, DEFAULT_PREFIXES, DISCOVER_PROPERTY, PROPERTIES, REQUIRED_PAPER_INFO, \
    PUBLICATION_TYPES, DISCOVER_PUBLICATION, RETURNS_PUBLICATIONS, CACHE_LOCATION_WIKIDATA, SIMPLE_SEARCH, \
    ATTRIBUTE_MAPPING, ANNOTATIONS_BEGIN, ANNOTATIONS_ITEM_LIST, LABEL_SEARCH, TYPE_SEARCH, AUTHOR_SEARCH, \
    SUBJECT_SEARCH


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
        self._endpoint = endpoints or DEFAULT_ENDPOINT
        self._sparql = SPARQLWrapper(self._endpoint)
        self._prefixes = prefixes or DEFAULT_PREFIXES
        self._prefix_text = self._get_prefix_text(self._prefixes)
        self._header = ''
        self._select = []
        self._body = ''
        self._offset = 0
        self._limit = 500000
        self._distinct = False

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

    def distinct(self):
        self._distinct = True

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
            pattern += '\n?{object} {instance_of} ?{object}_type .\n' \
                       'filter({allowed_types})\n' \
                       '?{object}_type http://www.w3.org/2000/01/rdf-schema#label ?{object}_type_label .\n' \
                       'filter(lang(?{object}_type_label) = \'en\')' \
                .format(object=entity, instance_of=self._property_cache['instance of'],
                        allowed_types=' || '.join('?{}_type = {}'.format(entity, self._publications_cache[allowed])
                                                  for allowed in PUBLICATION_TYPES))
            self.add_select(entity + '_type_label')
        self._body += pattern + '\n' if not optional else 'optional {{\n{}\n}}\n'.format(pattern)

    def _prepare_query(self):
        self._replace_prefixes()

    def get_query(self):
        prepared_select = ' '.join('?' + item for item in self._select)
        return '{header}\nselect {distinct}{select} where {{\n{body}\n}}\noffset {offset}\nlimit {limit}'.format(
            header=self._header, distinct=' ' if not self._distinct else 'distinct ',
            select=prepared_select, body=self._body, offset=self._offset, limit=self._limit)

    def execute(self):
        self._prepare_query()
        self._sparql.setQuery(self.get_query())
        self._sparql.setReturnFormat(JSON)
        return self._sparql.query().convert()['results']['bindings']


class SparqlHelperWikidata:
    def __init__(self):
        if not os.path.isfile(CACHE_LOCATION_WIKIDATA):
            self._property_cache = {}
            self._discover_properties(PROPERTIES)
            self._publication_cache = {}
            self._discover_publications(PUBLICATION_TYPES)
            with open(CACHE_LOCATION_WIKIDATA, 'wb') as handle:
                handle.write(pickle.dumps((self._property_cache, self._publication_cache)))
        else:
            with open(CACHE_LOCATION_WIKIDATA, 'rb') as handle:
                self._property_cache, self._publication_cache = pickle.loads(handle.read())

    @_timed
    def _discover_properties(self, properties):
        for item in properties:
            sparql_query = SparqlQuery()
            sparql_query.add_body(DISCOVER_PROPERTY.format(property=item))
            sparql_query.add_select('property')
            sparql_query.set_limit(1)
            result = sparql_query.execute()[0]
            self._property_cache[item] = result['property']['value']

    @_timed
    def _discover_publications(self, publications):
        for item in publications:
            sparql_query = SparqlQuery()
            sparql_query.add_body(DISCOVER_PUBLICATION.format(entity=item))
            sparql_query.add_select('publication')
            sparql_query.set_limit(1)
            result = sparql_query.execute()[0]
            self._publication_cache[item] = result['publication']['value']

    @_timed
    @_annotate_json_ld
    def publication_info(self, publication_id):
        # build and execute query
        sparql_query = SparqlQuery(self._property_cache, self._publication_cache)
        sparql_query.add_body('{} http://www.w3.org/2000/01/rdf-schema#label ?this_label .\n'
                              'filter(lang(?this_label) = \'en\')'.format(publication_id))
        sparql_query.add_select('this_label')
        for info in REQUIRED_PAPER_INFO:
            parsed_property = info['property']
            for key, value in self._property_cache.items():
                if key in parsed_property:
                    parsed_property = parsed_property.replace(key, value)
                    break
            returns_publication = info['property'] in RETURNS_PUBLICATIONS
            sparql_query.add_pattern(publication_id, parsed_property, info['name'],
                                     label=info['label'], optional=info['optional'], is_publication=returns_publication)
        results = sparql_query.execute()

        # deduplicate results
        parsed_results = {}
        author_set = set()
        author_name_set = set()
        cites_set = set()
        cited_by_set = set()
        publication_date_set = set()
        published_in_set = set()
        language_set = set()
        main_subject_set = set()
        resource_set = set()

        parsed_results['publication'] = results[0]['this_label']['value']
        parsed_results['publication_id'] = publication_id
        parsed_results['resource_type'] = results[0]['type_label']['value']
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
                    author_name_set.add(value)
                    parsed_results['author_list'].append({'author': value, 'author_id': value_id})
            if 'author_name' in result:
                value = result['author_name']['value']
                if value not in author_name_set:
                    author_name_set.add(value)
                    parsed_results['author_list'].append({'author': value})
            if 'cites' in result:
                value = result['cites_label']['value']
                value_id = result['cites']['value']
                value_type = result['cites_type_label']['value']
                if (value_id, value, value_type) not in cites_set:
                    cites_set.add((value_id, value, value_type))
                    parsed_results['cites_list'].append({'publication': value, 'publication_id': value_id,
                                                         'resource_type': value_type})
            if 'cited_by' in result:
                value = result['cited_by_label']['value']
                value_id = result['cited_by']['value']
                value_type = result['cited_by_type_label']['value']
                if (value_id, value, value_type) not in cited_by_set:
                    cited_by_set.add((value_id, value, value_type))
                    parsed_results['cited_by_list'].append({'publication': value, 'publication_id': value_id,
                                                            'resource_type': value_type})
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
            if 'language' in result:
                value = result['language_label']['value']
                value_id = result['language']['value']
                if (value_id, value) not in language_set:
                    language_set.add((value_id, value))
                    parsed_results['language_list'].append({'language': value, 'language_id': value_id})
            if 'main_subject' in result:
                value = result['main_subject_label']['value']
                value_id = result['main_subject']['value']
                if (value_id, value) not in main_subject_set:
                    main_subject_set.add((value_id, value))
                    parsed_results['main_subject_list'].append({'main_subject': value, 'main_subject_id': value_id})
            if 'resource' in result:
                value = result['resource']['value']
                if (value_id, value) not in resource_set:
                    resource_set.add((value_id, value))
                    parsed_results['resource_list'].append({'resource': value})
        return {'results': [parsed_results]}

    @_timed
    @_annotate_json_ld
    def author_info(self, author_id):
        # build and execute query
        sparql_query = SparqlQuery(self._property_cache, self._publication_cache)
        sparql_query.add_body('{} http://www.w3.org/2000/01/rdf-schema#label ?this_label .\n'
                              'filter(lang(?this_label) = \'en\')'.format(author_id))
        sparql_query.add_select('this_label')
        parsed_property = '^author'
        for key, value in self._property_cache.items():
            if key in parsed_property:
                parsed_property = parsed_property.replace(key, value)
                break
        sparql_query.add_pattern(author_id, parsed_property, 'publication',
                                 label=True, optional=False, is_publication=True)
        results = sparql_query.execute()

        # parse results
        parsed_results = {
            'author': results[0]['this_label']['value'],
            'author_id': author_id
        }
        parsed_results.update({'publication_list': [
            {'publication': result['publication_label']['value'],
             'publication_id': result['publication']['value'],
             'resource_type': result['publication_type_label']['value']}
            for result in results]
        })
        return {'results': [parsed_results]}

    @_timed
    @_annotate_json_ld
    def journal_info(self, journal_id):
        # build and execute query
        sparql_query = SparqlQuery(self._property_cache, self._publication_cache)
        sparql_query.add_body('{} http://www.w3.org/2000/01/rdf-schema#label ?this_label .\n'
                              'filter(lang(?this_label) = \'en\')'.format(journal_id))
        sparql_query.add_select('this_label')
        parsed_property = '^published in'
        for key, value in self._property_cache.items():
            if key in parsed_property:
                parsed_property = parsed_property.replace(key, value)
                break
        sparql_query.add_pattern(journal_id, parsed_property, 'publication',
                                 label=True, optional=False, is_publication=True)
        results = sparql_query.execute()

        # parse results
        parsed_results = {
            'journal': results[0]['this_label']['value'],
            'journal_id': journal_id
        }
        parsed_results.update({'publication_list': [
            {'publication': result['publication_label']['value'],
             'publication_id': result['publication']['value'],
             'resource_type': result['publication_type_label']['value']}
            for result in results]
        })
        return {'results': [parsed_results]}

    @_timed
    def publication_simple_search(self, query, page=1, size=10):
        # build and execute query
        sparql_query = SparqlQuery(self._property_cache, self._publication_cache)
        sparql_query.add_body(SIMPLE_SEARCH.format(query=query))
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
        sparql_query = SparqlQuery(self._property_cache, self._publication_cache)
        sparql_query.add_select('publication')

        if not types:
            types = PUBLICATION_TYPES
        sparql_query.add_body(TYPE_SEARCH.format(types=' || '.join(
            '?publication_type = {}'.format(self._publication_cache[item]) for item in types)))

        if title:
            sparql_query.add_body(LABEL_SEARCH.format(title=title))

        if authors:
            sparql_query.add_body(AUTHOR_SEARCH.format(author='|'.join(authors)))

        if topics:
            sparql_query.add_body(SUBJECT_SEARCH.format(subjects='|'.join(topics)))

        if after or before:
            sparql_query.add_body('\n?publication wdt:P577 ?publication_date .')
        if after:
            sparql_query.add_body('\nfilter(?publication_date > "{year}-{month:02d}-{day:02d}'
                                  'T00:00:00+00:00"^^xsd:dateTime)'.format(year=after[0], month=after[1], day=after[2]))
        if before:
            sparql_query.add_body('\nfilter(?publication_date < "{year}-{month:02d}-{day:02d}'
                                  'T00:00:00+00:00"^^xsd:dateTime)'.format(year=before[0], month=before[1],
                                                                           day=before[2]))

        sparql_query.set_offset((page - 1) * size)
        sparql_query.set_limit(size)
        sparql_query.distinct()
        results = sparql_query.execute()

        parsed_results = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(self.publication_info, result['publication']['value']) for result in results]
            for future in as_completed(futures):
                result = future.result()
                parsed_results.append(result['results'][0])
        return {'results': parsed_results}
