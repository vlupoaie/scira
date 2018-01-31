# django http
from django.http import JsonResponse

from sparql_helper_wikidata import SparqlHelperWikidata
from sparql_helper_dblp import SparqlHelperDblp


def publication_by_id(request, publication_id):
    if request.META.get('X-Server-Choice') == 'dblp':
        helper = SparqlHelperDblp()
    else:
        helper = SparqlHelperWikidata()
    return JsonResponse(helper.publication_info(publication_id))
