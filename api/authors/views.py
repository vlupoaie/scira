# django http
from django.http import JsonResponse

from sparql_utils.sparql_helper_wikidata import SparqlHelperWikidata
from sparql_utils.sparql_helper_dblp import SparqlHelperDblp


def publications_by_author(request, author_id):
    if request.META.get('X-Server-Choice') == 'dblp':
        helper = SparqlHelperDblp()
    else:
        helper = SparqlHelperWikidata()
    return JsonResponse(helper.author_info(author_id))
