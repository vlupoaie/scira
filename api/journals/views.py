# django http
from django.http import JsonResponse

from sparql_utils.sparql_helper_wikidata import SparqlHelperWikidata
from sparql_utils.sparql_helper_dblp import SparqlHelperDblp


def publications_by_journal(request, journal_id):
    if not journal_id.startswith('http://') and journal_id.startswith('http:/'):
        journal_id = journal_id.replace('http:/', 'http://')
    if request.META.get('X-Server-Choice') == 'dblp':
        helper = SparqlHelperDblp()
    else:
        helper = SparqlHelperWikidata()
    return JsonResponse(helper.journal_info(journal_id))
