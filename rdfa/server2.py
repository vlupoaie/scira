import cherrypy
import random
import json

class Root(object):
	@cherrypy.expose
	@cherrypy.tools.json_out()
	def index(self):
		d = open("jsonld_input", "r").read()
		d = json.loads(d)
		return d

if __name__ == '__main__':
	conf = {
		'/': {
			'tools.response_headers.on': True,
			'tools.response_headers.headers': [('Content-Type', 'application/json'), ('Access-Control-Allow-Origin', '*')],
			'server.socket_host': '127.0.0.1',
			'server.socket_port': 8080
		}
	}
	cherrypy.quickstart(Root(), '/', conf)