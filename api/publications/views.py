# django http
from django.http import JsonResponse

from sparql_utils.sparql_helper_wikidata import SparqlHelperWikidata
from sparql_utils.sparql_helper_dblp import SparqlHelperDblp


def publication_by_id(request, publication_id):
    if not publication_id.startswith('http://') and publication_id.startswith('http:/'):
        publication_id = publication_id.replace('http:/', 'http://')
    if request.META.get('X-Server-Choice') == 'dblp':
        helper = SparqlHelperDblp()
    else:
        helper = SparqlHelperWikidata()
    return JsonResponse(helper.publication_info(publication_id))
