# import cherrypy
#
# from api.wsgi import application
#
#
# cherrypy.tree.graft(application, '/')
# cherrypy.config.update({
#     'log.screen': True,
#     'server.socket_host': '0.0.0.0',
#     'server.socket_port': 8080,
#     'server.thread_pool': 50
# })
#
# try:
#     cherrypy.engine.start()
# except KeyboardInterrupt:
#     cherrypy.engine.stop()

import cherrypy

from api.wsgi import application


cherrypy.tree.graft(application, '/')
cherrypy.tree.mount(None, '/static', {'/': {
    'tools.staticdir.debug': True,
    'tools.staticdir.on': True,
    'tools.staticdir.dir': r'D:\Facultate\Evaluator\server\static_files\\'
}})

try:
    cherrypy.engine.start()
    cherrypy.engine.block()
except KeyboardInterrupt:
    cherrypy.engine.stop()

