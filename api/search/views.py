# django http
from django.http import JsonResponse

from config.settings import PUBLICATION_TYPES

from sparql_utils.sparql_helper_wikidata import SparqlHelperWikidata
from sparql_utils.sparql_helper_dblp import SparqlHelperDblp


def simple_search(request):
    if request.META.get('X-Server-Choice') == 'dblp':
        helper = SparqlHelperDblp()
    else:
        helper = SparqlHelperWikidata()
    query = request.GET.get('query')
    page = int(request.GET.get('page', 1))
    if not query:
        return JsonResponse({})
    else:
        return JsonResponse(helper.publication_simple_search(query=query, page=page))


def advanced_search(request):
    if request.META.get('X-Server-Choice') == 'dblp':
        helper = SparqlHelperDblp()
    else:
        helper = SparqlHelperWikidata()
    title = request.GET.get('title')
    authors = [item.strip() for item in [x for x in (request.GET.get('author', '').split(',') +
               request.GET.get('coauthor', '').split(',')) if x.strip()]]
    topics = [item.strip() for item in request.GET.get('topic', '').split(',')]
    types = [item for item in PUBLICATION_TYPES if request.GET.get(item)]
    after = request.GET.get('after')
    if after:
        after = map(int, after.split('-'))
    before = request.GET.get('before')
    if before:
        before = map(int, before.split('-'))
    page = int(request.GET.get('page', 1))
    if not any([title, authors, topics, types, after, before]):
        return JsonResponse({})
    else:
        return JsonResponse(helper.publication_advanced_search(title=title, authors=authors, topics=topics, types=types,
                                                               after=after, before=before, page=page))
