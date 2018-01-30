import json
import os
import sys

attributes_mapping = {"author_list": ["author", {"@type":"Person"}], 
					  "author": "givenName",
					  "author_id": "identifier",
					  "cites_list": ["citation", {"@type":"CreativeWork"}],
					  "publication": "name",
					  "publication_id": "identifier",
					  "cited_by": ["subjectOf", {"@type":"CreativeWork"}],
					  "publication_date": ["datePublished", {"@type":"Date"}],
					  "date": "dateCreated",
					  "published_in": ["isPartOf", {"@type":"CreativeWorkSeries"}],
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
					  "id_publication": "identifier",
					  "name_publication": "name",
					  "publication_list": ["publication", {"@type":"CreativeWork"}]
					  }

annotations_begin = {"@context": "http://schema.org",
 					 "@type": "CreativeWork"}

annotations_itemlist = {"@type": "ListItem",
  						"item": {}
  					   }



class JsonLD:

	def __init__(self, json_list):
		
		self.json_list = json_list
		self.jsonld_list = []


	def buildJSONLD(self):

		for j in self.json_list:		
			
			json_to_convert = json.loads(j.decode("utf-8"))
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
			
			self.jsonld_list.append(json_ld)

	def getJSONLD(self):
		return self.jsonld_list


def main():
	f = open("json_input", "rb")
	content = [f.read()]
	conv = JsonLD(content)
	conv.buildJSONLD()
	jsonld_list = conv.getJSONLD()
	g = open("json.out", "w")
	g.write(json.dumps(jsonld_list[0], indent=4))
		
	

if __name__ == '__main__':
	main()

