import json
import os
import sys

attributes_mapping = {"author_list": ["author", {"@type":"Person"}], 
					  "author": "givenName",
					  "author_id": "identifier",
					  "cites_list": ["citation", {"@type":"CreativeWork"}],
					  "publication": "name",
					  "publication_id": "identifier",
					  "cited_by_list": ["subjectOf", {"@type":"CreativeWork"}],
					  "publication_date_list": ["datePublished", {"@type":"Date"}],
					  "date": "dateCreated",
					  "published_in_list": ["isPartOf", {"@type":"CreativeWorkSeries"}],
					  "journal": "name",
					  "journal_id": "identifier",
					  "language_list": ["inLanguage", {"@type":"Language"}],
					  "language": "name",
					  "language_id": "identifier",
					  "main_subject_list": ["keywords", {"@type":"Text"}],
					  "main_subject": "name",
					  "main_subject_id": "identifier",
					  "resource_list": ["associatedMedia", {"@type":"MediaObject"}],
					  "resource": "contentUrl",
					  "publication_list": ["publication", {"@type":"CreativeWork"}],
					  "resource_type": "learningResourceType"
					  }

annotations_begin = {"@context": "http://schema.org",
 					 "@type": "CreativeWork"}

annotations_itemlist = {"@type": "ListItem",
  						"item": {}
  					   }




def buildJSONLD(content):

	jsonld_results = dict()
	jsonld_results["results"] = list()
	for json_to_convert in content["results"]:		
			
		json_ld = dict()
		json_ld["@context"] = annotations_begin["@context"]
		json_ld["@type"] = annotations_begin["@type"]
		for key in json_to_convert:
			values = attributes_mapping[key]
			if isinstance(values, list):
				name_key_jsonld = values[0]
				type_objects = values[1]["@type"]
				json_ld[name_key_jsonld] = list()
				list_json = json_to_convert[key]
				for elem in list_json:
					d = {}
					d["@type"] = annotations_itemlist["@type"]
					d["item"] = dict()
					d["item"]["@type"] = type_objects
					for kk in elem:
						d["item"][attributes_mapping[kk]] = elem[kk]
					json_ld[name_key_jsonld].append(d)
			else:
				json_ld[values] = json_to_convert[key]
		jsonld_results["results"].append(json_ld)
	return jsonld_results
		


def main():
	f = open("json_input3", "r")
	content = dict()
	content["results"] = list()
	content["results"].append(json.loads(f.read()))		
	results = buildJSONLD(content)

	g = open("json.out", "w")
	g.write(json.dumps(results, indent=4))

if __name__ == '__main__':
	main()

