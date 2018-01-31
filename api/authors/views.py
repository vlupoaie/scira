# django http
from django.http import JsonResponse

from sparql_utils.sparql_helper_wikidata import SparqlHelperWikidata
from sparql_utils.sparql_helper_dblp import SparqlHelperDblp


def publications_by_author(request, author_id):
    if not author_id.startswith('http://') and author_id.startswith('http:/'):
        author_id = author_id.replace('http:/', 'http://')
    if request.META.get('X-Server-Choice') == 'dblp':
        helper = SparqlHelperDblp()
    else:
        helper = SparqlHelperWikidata()
    return JsonResponse(helper.author_info(author_id))
