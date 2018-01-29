from SPARQLWrapper import SPARQLWrapper, JSON

from config.settings import DEFAULT_ENDPOINT, DEFAULT_PREFIXES, DISCOVER_PROPERTY, PROPERTIES, REQUIRED_PAPER_INFO, \
    PUBLICATION_TYPES, DISCOVER_PUBLICATION


class SPARQLQuery:
    def __init__(self, endpoints=None, prefixes=None):
        self._endpoint = endpoints or DEFAULT_ENDPOINT
        self._sparql = SPARQLWrapper(self._endpoint)
        self._prefixes = prefixes or DEFAULT_PREFIXES
        self._prefix_text = self._get_prefix_text(self._prefixes)
        self._header = ''
        self._select = []
        self._body = ''
        self._offset = 0
        self._limit = 100000

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

    def add_pattern(self, subject, edge, entity, label=False, optional=False):
        if not label:
            pattern = '{subject} {property} ?{object} .'.format(subject=subject, property=edge, object=entity)
            self.add_select(entity)
        else:
            pattern = '{subject} {property} ?{object} .\n' \
                      '?{object} http://www.w3.org/2000/01/rdf-schema#label ?{object}_label .\n' \
                      'filter(lang(?{object}_label) = \'en\')'.format(subject=subject, property=edge, object=entity)
            self.add_select(entity)
            self.add_select(entity + '_label')
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


class SPARQLHelper:
    def __init__(self):
        self._property_cache = {}
        self._discover_properties(PROPERTIES)
        self._publication_cache = {}
        self._discover_publications(PUBLICATION_TYPES)
        print(self._property_cache)
        print(self._publication_cache)

    def _discover_properties(self, properties):
        for item in properties:
            sparql_query = SPARQLQuery()
            sparql_query.add_body(DISCOVER_PROPERTY.format(property=item))
            sparql_query.add_select('property')
            sparql_query.set_limit(1)
            result = sparql_query.execute()[0]
            self._property_cache[item] = result['property']['value']

    def _discover_publications(self, publications):
        for item in publications:
            print(item)
            sparql_query = SPARQLQuery()
            sparql_query.add_body(DISCOVER_PUBLICATION.format(entity=item))
            sparql_query.add_select('publication')
            sparql_query.set_limit(1)
            result = sparql_query.execute()[0]
            self._publication_cache[item] = result['publication']['value']

    def publication_info(self, publication_id):
        # build and execute query
        sparql_query = SPARQLQuery()
        for info in REQUIRED_PAPER_INFO:
            parsed_property = info['property']
            for key, value in self._property_cache.items():
                if key in parsed_property:
                    parsed_property = parsed_property.replace(key, value)
                    break
            sparql_query.add_pattern(publication_id, parsed_property, info['name'],
                                     label=info['label'], optional=info['optional'])
        results = sparql_query.execute()

        # deduplicate results
        parsed_results = {}
        author_set = set()
        cites_set = set()
        cited_by_set = set()
        publication_date_set = set()
        published_in_set = set()
        language_set = set()
        main_subject_set = set()
        resource_set = set()

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
            if 'cites' in result:
                value = result['cites_label']['value']
                value_id = result['cites']['value']
                if (value_id, value) not in cites_set:
                    cites_set.add((value_id, value))
                    parsed_results['cites_list'].append({'publication': value, 'publication_id': value_id})
            if 'cited_by' in result:
                value = result['cited_by_label']['value']
                value_id = result['cited_by']['value']
                if (value_id, value) not in cited_by_set:
                    cited_by_set.add((value_id, value))
                    parsed_results['cited_by_list'].append({'publication': value, 'publication_id': value_id})
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
        return parsed_results

    def author_info(self, author_id):
        # build and execute query
        sparql_query = SPARQLQuery()
        parsed_property = '^author'
        for key, value in self._property_cache.items():
            if key in parsed_property:
                parsed_property = parsed_property.replace(key, value)
                break
        sparql_query.add_pattern(author_id, parsed_property, 'publication', label=True, optional=False)
        results = sparql_query.execute()

        parsed_results = {'publication_list': [
            {'publication': result['publication_label']['value'], 'publication_id': result['publication']['value']}
            for result in results]
        }
        return parsed_results

    def journal_info(self, journal_id):
        # build and execute query
        sparql_query = SPARQLQuery()
        parsed_property = '^published in'
        for key, value in self._property_cache.items():
            if key in parsed_property:
                parsed_property = parsed_property.replace(key, value)
                break
        sparql_query.add_pattern(journal_id, parsed_property, 'publication', label=True, optional=False)
        results = sparql_query.execute()

        parsed_results = {'publication_list': [
            {'publication': result['publication_label']['value'], 'publication_id': result['publication']['value']}
            for result in results]
        }
        return parsed_results

    def publication_search(self):
        pass
