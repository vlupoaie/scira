const NO_PARSE = ["@context", "@type", "identifier", "name", "learningResourceType"];
var max_map = {};
var canvas_dict = {};
var maping_dict = {};
var diag_objects = {};
function parseJSON(divname, diagram) {
    var json_data = canvas_dict[divname]
    if (!(divname in max_map)){
        max_map[divname] = 1;
    }
    var root_node = json_data['identifier'];
    diagram = diag_objects[divname];
    diagram.startTransaction("a");


    var node = diagram.findNodeForKey(maping_dict[divname][root_node]['id']);
    node.expandTree(2);

    var k = 1
    for (var key in json_data) {
        if (NO_PARSE.indexOf(key) > -1) {
            continue;
        }
        k += 1;
        var i = 1
        for (var dest_node in json_data[key]) {
            if (i > 5) break;
            dest_node = json_data[key][dest_node];
            //console.log(dest_node);
            var identifier = 'name';
            if ('identifier' in dest_node['item'])
                identifier = 'identifier';

            identifier = dest_node['item'][identifier];
            if (identifier in maping_dict[divname]) {
                continue;
            }
            i += 1
            max_map[divname] += 1;
            maping_dict[divname][identifier] = {
                'id': max_map[divname],
                'clicked': false
            };
            if (key == "author" || key == "isPartOf")
                categ = dest_node['item']['@type'];
            else
                categ = dest_node['item']['learningResourceType'];

            var new_node = {
                text: dest_node['item']['name'],
                category: categ,
                key: max_map[divname]
            };
            var new_link = {
                from: maping_dict[divname][root_node]['id'],
                to: maping_dict[divname][identifier]['id'],
                text: key
            };
            model = diagram.model;
            model.addLinkData(new_link);
            model.addNodeData(new_node);
        }
    }

    diagram.commitTransaction("a");
    for (var i = k * 20; i >= 0; i--) {
        diagram.startTransaction("CollapseExpandTree");
        node.expandTree(2);
        diagram.commitTransaction("CollapseExpandTree");
    }
    diagram.zoomToFit()
}


function get(divname, pub_id , diagram) {
    var x;
    if (pub_id == canvas_dict[divname]['identifier']){
        setTimeout(function(){parseJSON(divname,diagram);},0);
    }else{

        $.get("http://scira.tk/api/publications/"+pub_id, function(data) {
            //canvas_dict[divname] = $.extend(canvas_dict[divname], data['results'][0]);
            canvas_dict[divname] = data['results'][0];
            canvas_dict[divname]['identifier'] = pub_id;
            parseJSON(divname, diagram);
        }, "json");
    }
}
function showConnections(node) {
    var diagram = node.diagram;
    diagram.startTransaction("highlight");
    // remove any previous highlighting
    diagram.clearHighlighteds();
    // for each Link coming out of the Node, set Link.isHighlighted
    node.findLinksOutOf().each(function(l) {
        l.isHighlighted = true;
    });
    node.findLinksInto().each(function(l) {
        l.isHighlighted = true;
    });
    // for each Node destination for the Node, set Node.isHighlighted
    node.findNodesOutOf().each(function(n) {
        n.isHighlighted = true;
    });
    node.findNodesInto().each(function(n) {
        n.isHighlighted = true;
    });
    diagram.commitTransaction("highlight");
}

function setupDiagram(divname) {

    var $ = go.GraphObject.make;
    var myDiagram = $(go.Diagram, divname, {
        initialAutoScale: go.Diagram.UniformToFill,
        contentAlignment: go.Spot.Center,
        layout: $(go.ForceDirectedLayout),
        "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
        "draggingTool.isGridSnapEnabled": true,
        "draggingTool.dragsTree": true, // dragging for both move and copy
        "commandHandler.copiesTree": true, // for the copy command                  
    });


    // Node template for scientific article
    var article_template =
        $(go.Node, "Auto", {
                click: function(e, node) {
                    showConnections(node);
                }
            }, new go.Binding("visible", "visible"),
            $(go.Shape, "Ellipse", {
                fill: "lightblue"
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.TextBlock, {
                    margin: 1,
                    font: "11px sans-serif",
                    name: "Label",
                    width: 100,
                    wrap: go.TextBlock.WrapFit,
                    isMultiline: true,
                    overflow: go.TextBlock.OverflowEllipsis
                },
                new go.Binding("text", "text"))
        );

    // Node template for science book
    var science_book_template =
        $(go.Node, "Auto", {
                click: function(e, node) {
                    showConnections(node);
                }
            }, new go.Binding("visible", "visible"),
            $(go.Shape, "Ellipse", {
                fill: "lightblue"
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.TextBlock, {
                    margin: 1,
                    font: "11px sans-serif",
                    name: "Label",
                    width: 100,
                    wrap: go.TextBlock.WrapFit,
                    isMultiline: true,
                    overflow: go.TextBlock.OverflowEllipsis
                },
                new go.Binding("text", "text"))
        );

    // Node template for academic journal article
    var academic_journal_template =
        $(go.Node, "Auto", {
                click: function(e, node) {
                    showConnections(node);
                }
            }, new go.Binding("visible", "visible"),
            $(go.Shape, "Ellipse", {
                fill: "pink"
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.TextBlock, {
                    margin: 1,
                    font: "11px sans-serif",
                    name: "Label",
                    width: 100,
                    wrap: go.TextBlock.WrapFit,
                    isMultiline: true,
                    overflow: go.TextBlock.OverflowEllipsis
                },
                new go.Binding("text", "text"))
        );

    // Node template for report
    var report_template =
        $(go.Node, "Auto", {
                click: function(e, node) {
                    showConnections(node);
                }
            }, new go.Binding("visible", "visible"),
            $(go.Shape, "Ellipse", {
                fill: "lightblue"
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.TextBlock, {
                    margin: 1,
                    font: "11px sans-serif",
                    name: "Label",
                    width: 100,
                    wrap: go.TextBlock.WrapFit,
                    isMultiline: true,
                    overflow: go.TextBlock.OverflowEllipsis
                },
                new go.Binding("text", "text"))
        );

    // Node template for textbook
    var textbook_template =
        $(go.Node, "Auto", {
                click: function(e, node) {
                    showConnections(node);
                }
            }, new go.Binding("visible", "visible"),
            $(go.Shape, "Ellipse", {
                fill: "lightblue"
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.TextBlock, {
                    margin: 1,
                    font: "11px sans-serif",
                    name: "Label",
                    width: 100,
                    wrap: go.TextBlock.WrapFit,
                    isMultiline: true,
                    overflow: go.TextBlock.OverflowEllipsis
                },
                new go.Binding("text", "text"))
        );

    // Node template for doctoral thesis
    var doctoral_thesis_template =
        $(go.Node, "Auto", {
                click: function(e, node) {
                    showConnections(node);
                }
            }, new go.Binding("visible", "visible"),
            $(go.Shape, "Ellipse", {
                fill: "lightblue"
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.TextBlock, {
                    margin: 1,
                    font: "11px sans-serif",
                    name: "Label",
                    width: 100,
                    wrap: go.TextBlock.WrapFit,
                    isMultiline: true,
                    overflow: go.TextBlock.OverflowEllipsis
                },
                new go.Binding("text", "text"))
        );

    // Node template for publication
    var publication_template =
        $(go.Node, "Auto", {
                click: function(e, node) {
                    showConnections(node);
                }
            }, new go.Binding("visible", "visible"),
            $(go.Shape, "Ellipse", {
                fill: "lightblue"
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.TextBlock, {
                    margin: 1,
                    font: "11px sans-serif",
                    name: "Label",
                    width: 100,
                    wrap: go.TextBlock.WrapFit,
                    isMultiline: true,
                    overflow: go.TextBlock.OverflowEllipsis
                },
                new go.Binding("text", "text"))
        );

    // Node template for doctoral thesis
    var author_template =
        $(go.Node, "Auto", {
                click: function(e, node) {
                    showConnections(node);
                }
            }, new go.Binding("visible", "visible"),
            $(go.Shape, "RoundedRectangle", {
                fill: "lightgreen"
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.TextBlock, {
                    margin: 1,
                    font: "11px sans-serif",
                    name: "Label",
                    width: 100,
                    wrap: go.TextBlock.WrapFit,
                    isMultiline: true,
                    overflow: go.TextBlock.OverflowEllipsis
                },
                new go.Binding("text", "text"))
        );

    // Others
    var blank_template =
        $(go.Node, "Auto", {
                click: function(e, node) {
                    showConnections(node);
                }
            }, new go.Binding("visible", "visible"),
            $(go.Shape, "RoundedRectangle", {
                fill: "lightblue"
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.TextBlock, {
                    margin: 1,
                    font: "11px sans-serif",
                    name: "Label",
                    width: 100,
                    wrap: go.TextBlock.WrapFit,
                    isMultiline: true,
                    overflow: go.TextBlock.OverflowEllipsis
                },
                new go.Binding("text", "text"))
        );

    var templmap = new go.Map("string", go.Node);
    templmap.add("scientific article", article_template);
    templmap.add("science book", science_book_template);
    templmap.add("CreativeWorkSeries", academic_journal_template);
    templmap.add("report", report_template);
    templmap.add("textbook", textbook_template);
    templmap.add("doctoral thesis", doctoral_thesis_template);
    templmap.add("publication", publication_template);
    templmap.add("Person", author_template);
    templmap.add("none", blank_template);

    myDiagram.nodeTemplateMap = templmap;

    myDiagram.linkTemplate =
        $(go.Link, {
                curve: go.Link.JumpGap
            },
            $(go.Shape, {
                strokeWidth: 1
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.Shape, {
                toArrow: "OpenTriangle"
            }, new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject()),
            $(go.TextBlock, {
                font: "11px sans-serif",
                segmentOffset: new go.Point(0, -10)
            }, new go.Binding("text", "text"), new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? "red" : "black";
            }).ofObject())

        );


    myDiagram.model = new go.GraphLinksModel([{
            text: canvas_dict[divname]['name'],
            key: 1,
            category: "scientific article"
    }]);
    setTimeout(function(){parseJSON(divname, myDiagram)},1);
    // get(divname,d);

    myDiagram.click = function(e) {
        myDiagram.startTransaction("no highlighteds");
        myDiagram.clearHighlighteds();
        myDiagram.commitTransaction("no highlighteds");
    };

    myDiagram.addDiagramListener("ObjectDoubleClicked",
        function(e) {
            var part = e.subject.part;
            k = part.data.key;
            for (var key in maping_dict[divname])
                if (maping_dict[divname][key]['id'] == k) {
                    f = key
                }
            get(divname, f, myDiagram)
            // if (!(part instanceof go.Link)) alert("Clicked on " + part.data.key);
        });

    diag_objects[divname] = myDiagram;
    return myDiagram;
}
// setupDiagram("well_1");

// TO comment, for test only. first publication




// parseJSON("Q1",datajson,d)
//if (node.data.key === "Beta") continue; //skip Beta, just to contrast
//node.scale = 0.4; // shrink each node
// }


function handleClick(elem) {
    var id = elem.id;
    var itr = d.nodes;
    var display = elem.checked ? true : false
    while (itr.next()) {
        var node = itr.value;
        if (node.category == id) {
            node.visible = display;
        }
        //console.log(node.data.key)
    }
}    

function buildRDFA(jsonldlist) {

    bigbigDiv = document.createElement("div");
    bigbigDiv.setAttribute("id", "results");
    var contor = 0;
    for (var i in jsonldlist["results"]) {
        contor++;
        var jsonld = jsonldlist["results"][i];
        var s = String(jsonldlist["results"][i]['identifier']);

        maping_dict["well_"+contor] = { };
        maping_dict["well_"+contor][s] = {'id':1, 'clicked':0}
        canvas_dict["well_"+contor] = $.extend({},jsonld);
        //First Container Fluid - with Presentation Name --------------------
        publication_identifier = jsonld["identifier"];

        baseDiv = document.createElement("div");
        baseDiv.setAttribute("class", "panel panel-default");

        headDiv = document.createElement("div");
        headDiv.setAttribute("class", "panel-heading edit-plugin-heading");
        headDiv.setAttribute("id", "panel_" + contor);
        headDiv.setAttribute("data-toggle", "collapse");
        headDiv.setAttribute("data-parent", "#accordion");
        headDiv.setAttribute("href", "#collapse_" + contor);

        title = document.createElement("h4");
        title.setAttribute("class", "panel-title edit-plugin-title");

        titleName = document.createElement("a");
        titleName.setAttribute("href", "#collapse_" + contor);
        titleName.textContent = jsonld["name"];

        collapseDiv = document.createElement("div");
        collapseDiv.setAttribute("class", "panel-collapse collapse");
        collapseDiv.setAttribute("id", "collapse_" + contor);


        bigDiv = document.createElement("div");
        bigDiv.setAttribute("id", "accordion_plugin" + contor);
        bigDiv.setAttribute("class", "panel-body");
        bigDiv.setAttribute("vocab", "http://schema.org/");
        bigDiv.setAttribute("typeof", "CreativeWork");
        bigDiv.setAttribute("resource", publication_identifier);
        //-------------------------------------------------------
        //first container-fluid
        var containerfluidDiv = document.createElement("div");
        containerfluidDiv.setAttribute("class", "container-fluid");

        //colmd2----
        var colmd2Div = document.createElement("div");
        colmd2Div.setAttribute("class", "col-md-2");
        h41 = document.createElement("h4");
        label = document.createElement("label");
        label.textContent = "Title:";
        h41.appendChild(label);
        colmd2Div.appendChild(h41);
        //----------

        //colmd10----
        var colmd10Div = document.createElement("div");
        colmd10Div.setAttribute("class", "col-md-10");

        var h42 = document.createElement("h4");
        h42.setAttribute("style", "width: 102.5%; margin-left: -2%;");

        var small = document.createElement("small");
        var span = document.createElement("span");
        span.setAttribute("property", "name");
        span.textContent = jsonld["name"];
        var aResource = document.createElement("a");
        aResource.setAttribute("href", "http://scira.tk/publications/" + publication_identifier);
        aResource.setAttribute("style", "text-decoration: none");
        aResource.setAttribute("target", "_blank");
        aResource.appendChild(span);
        small.appendChild(aResource);
        h42.appendChild(small);
        colmd10Div.appendChild(h42);
        //------------

        containerfluidDiv.appendChild(colmd2Div);
        containerfluidDiv.appendChild(colmd10Div);
        bigDiv.appendChild(containerfluidDiv);
        //-----------------------------------------------------------------------------------------


        //Second Container Fluid - Authors --------------------------------------------------------
        var cfDiv1 = document.createElement("div");
        cfDiv1.setAttribute("class", "container-fluid");

        colmd2Div = document.createElement("div");
        colmd2Div.setAttribute("class", "col-md-2");
        h41 = document.createElement("h4");
        label = document.createElement("label");
        label.textContent = "Authors:";
        h41.appendChild(label);
        colmd2Div.appendChild(h41);
        cfDiv1.appendChild(colmd2Div);

        colmd10Div = document.createElement("div");
        colmd10Div.setAttribute("class", "col-md-10");
        colmd10Div.setAttribute("property", "authorList");
        colmd10Div.setAttribute("typeof", "ItemList");
        colmd10Div.setAttribute("resource", "authorList");

        var list_authors = jsonld["author"]
        if (list_authors.length == 0) {
            div = document.createElement("div");
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.textContent = "-";
            small.appendChild(span);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else if (list_authors.length == 1) {
            item = list_authors[0]["item"];
            name = item["name"];
            type = item["@type"];
            if ("identifier" in item) {
                resource = item["identifier"];
            } else {
                resource = name.split(' ').join('_');
            }

            div = document.createElement("div");
            div.setAttribute("property", "author");
            div.setAttribute("typeof", type);
            div.setAttribute("resource", resource);

            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.setAttribute("property", "name");
            span.textContent = name;
            small.appendChild(span);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else {
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            ul = document.createElement("ul");
            ul.setAttribute("class", "list-group");

            for (var i in list_authors) {
                item = list_authors[i]["item"];
                name = item["name"];
                type = item["@type"];
                if ("identifier" in item) {
                    resource = item["identifier"];
                } else {
                    resource = name.split(' ').join('_');
                }
                li = document.createElement("li");
                li.setAttribute("class", "list-group-item");
                div = document.createElement("div");
                div.setAttribute("property", "author");
                div.setAttribute("typeof", type);
                div.setAttribute("resource", resource);
                span = document.createElement("span");
                span.setAttribute("property", "name");
                span.textContent = name;
                div.appendChild(span);
                li.appendChild(div);
                ul.appendChild(li);
            }
            small.appendChild(ul);
            h4.appendChild(small);
            colmd10Div.appendChild(h4);
        }
        cfDiv1.appendChild(colmd10Div);
        bigDiv.appendChild(cfDiv1);

        //------------------------------------------------------------------
        //3 Container Fluid - Authors --------------------------------------------------------

        var cfDiv2 = document.createElement("div");
        cfDiv2.setAttribute("class", "container-fluid");

        colmd2Div = document.createElement("div");
        colmd2Div.setAttribute("class", "col-md-2");
        h41 = document.createElement("h4");
        label = document.createElement("label");
        label.textContent = "Citations:";
        h41.appendChild(label);
        colmd2Div.appendChild(h41);
        cfDiv2.appendChild(colmd2Div);

        colmd10Div = document.createElement("div");
        colmd10Div.setAttribute("class", "col-md-10");
        colmd10Div.setAttribute("property", "citationList");
        colmd10Div.setAttribute("typeof", "ItemList");
        colmd10Div.setAttribute("resource", "citationList");

        var list_citation = jsonld["citation"]
        if (list_citation.length == 0) {
            div = document.createElement("div");
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.textContent = "-";
            small.appendChild(span);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else if (list_citation.length == 1) {
            item = list_citation[0]["item"];
            name = item["name"];
            type = item["@type"];
            resource = item["identifier"];

            div = document.createElement("div");
            div.setAttribute("property", "citation");
            div.setAttribute("typeof", type);
            div.setAttribute("resource", resource);

            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.setAttribute("property", "name");
            span.textContent = name;

            var aResource = document.createElement("a");
            aResource.setAttribute("href", "http://scira.tk/publications/" + resource);
            aResource.setAttribute("style", "text-decoration: none");
            aResource.setAttribute("target", "_blank");
    
            aResource.appendChild(span);
            small.appendChild(aResource);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else {
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            ul = document.createElement("ul");
            ul.setAttribute("class", "list-group");
            var contor_citation = 0;
            for (var i in list_citation) {
                contor_citation += 1;
                item = list_citation[i]["item"];
                name = item["name"];
                type = item["@type"];
                resource = item["identifier"];

                li = document.createElement("li");
                li.setAttribute("class", "list-group-item");
                div = document.createElement("div");
                if (contor_citation > 10) {
                    li.setAttribute("style", "display: none;");
                }
                div.setAttribute("property", "citation");
                div.setAttribute("typeof", type);
                div.setAttribute("resource", resource);
                span = document.createElement("span");
                span.setAttribute("property", "name");
                span.textContent = name;
                
                var aResource = document.createElement("a");
                aResource.setAttribute("href", "http://scira.tk/publications/" + resource);
                aResource.setAttribute("style", "text-decoration: none");
                aResource.setAttribute("target", "_blank");
        
                aResource.appendChild(span);
                div.appendChild(aResource);
                li.appendChild(div);
                ul.appendChild(li);
            }
            //show_more = document.createElement("li");
            //show_more = show_more.textContent = "+";
            //ul.appendChild(show_more);
            small.appendChild(ul);
            h4.appendChild(small);
            colmd10Div.appendChild(h4);
        }
        cfDiv2.appendChild(colmd10Div);
        bigDiv.appendChild(cfDiv2);
        //--------------------------------------------------------------------
        //--------------------------------------------------------------------


        var cfDiv3 = document.createElement("div");
        cfDiv3.setAttribute("class", "container-fluid");

        colmd2Div = document.createElement("div");
        colmd2Div.setAttribute("class", "col-md-2");
        h41 = document.createElement("h4");
        label = document.createElement("label");
        label.textContent = "Cited:";
        h41.appendChild(label);
        colmd2Div.appendChild(h41);
        cfDiv3.appendChild(colmd2Div);

        colmd10Div = document.createElement("div");
        colmd10Div.setAttribute("class", "col-md-10");
        colmd10Div.setAttribute("property", "subjectOfList");
        colmd10Div.setAttribute("typeof", "ItemList");
        colmd10Div.setAttribute("resource", "subjectOfList");

        var list_subjectOf = jsonld["subjectOf"];
        if (list_subjectOf.length == 0) {
            div = document.createElement("div");
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.textContent = "-";
            small.appendChild(span);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else if (list_subjectOf.length == 1) {

            item = list_subjectOf[0]["item"];
            name = item["name"];
            type = item["@type"];
            resource = item["identifier"];

            div = document.createElement("div");
            div.setAttribute("property", "subjectOf");
            div.setAttribute("typeof", type);
            div.setAttribute("resource", resource);

            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.setAttribute("property", "name");
            span.textContent = name;
            var aResource = document.createElement("a");
            aResource.setAttribute("href", "http://scira.tk/publications/" + resource);
            aResource.setAttribute("style", "text-decoration: none");
            aResource.setAttribute("target", "_blank");
            aResource.appendChild(span);
            small.appendChild(aResource);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else {
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            ul = document.createElement("ul");
            ul.setAttribute("class", "list-group");

            for (var i in list_subjectOf) {
                item = list_subjectOf[i]["item"];
                name = item["name"];
                type = item["@type"];
                resource = item["identifier"];

                li = document.createElement("li");
                li.setAttribute("class", "list-group-item");
                div = document.createElement("div");
                div.setAttribute("property", "subjectOf");
                div.setAttribute("typeof", type);
                div.setAttribute("resource", resource);
                span = document.createElement("span");
                span.setAttribute("property", "name");
                span.textContent = name;
                var aResource = document.createElement("a");
                aResource.setAttribute("href", "http://scira.tk/publications/" + resource);
                aResource.setAttribute("style", "text-decoration: none");
                aResource.setAttribute("target", "_blank");
                aResource.appendChild(span);
                div.appendChild(aResource);
                li.appendChild(div);
                ul.appendChild(li);
            }
            small.appendChild(ul);
            h4.appendChild(small);
            colmd10Div.appendChild(h4);
        }
        cfDiv3.appendChild(colmd10Div);
        bigDiv.appendChild(cfDiv3);
        //-----------------------------------------------------------
        //-----------------------------------------------------------

        var cfDiv4 = document.createElement("div");
        cfDiv4.setAttribute("class", "container-fluid");

        colmd2Div = document.createElement("div");
        colmd2Div.setAttribute("class", "col-md-2");
        h41 = document.createElement("h4");
        label = document.createElement("label");
        label.textContent = "Date:";
        h41.appendChild(label);
        colmd2Div.appendChild(h41);
        cfDiv4.appendChild(colmd2Div);

        colmd10Div = document.createElement("div");
        colmd10Div.setAttribute("class", "col-md-10");
        colmd10Div.setAttribute("property", "datePublishedList");
        colmd10Div.setAttribute("typeof", "ItemList");
        colmd10Div.setAttribute("resource", "datePublishedList");

        var list_dates = jsonld["datePublished"];
        if (list_dates.length == 0) {
            div = document.createElement("div");
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.textContent = "-";
            small.appendChild(span);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else if (list_dates.length == 1) {

            item = list_dates[0]["item"];
            name = item["dateCreated"];
            type = item["@type"];

            if ("identifier" in item) {
                resource = item["identifier"];
            } else {
                resource = name;
            }

            div = document.createElement("div");
            div.setAttribute("property", "datePublished");
            div.setAttribute("typeof", type);
            div.setAttribute("resource", resource);

            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.setAttribute("property", "dateCreated");
            span.textContent = name;
            small.appendChild(span);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else {
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            ul = document.createElement("ul");
            ul.setAttribute("class", "list-group");

            for (var i in list_dates) {
                item = list_dates[i]["item"];
                name = item["dateCreated"];
                type = item["@type"];

                if ("identifier" in item) {
                    resource = item["identifier"];
                } else {
                    resource = name;
                }

                li = document.createElement("li");
                li.setAttribute("class", "list-group-item");
                div = document.createElement("div");
                div.setAttribute("property", "datePublished");
                div.setAttribute("typeof", type);
                div.setAttribute("resource", resource);
                span = document.createElement("span");
                span.setAttribute("property", "dateCreated");
                span.textContent = name;
                div.appendChild(span);
                li.appendChild(div);
                ul.appendChild(li);
            }
            small.appendChild(ul);
            h4.appendChild(small);
            colmd10Div.appendChild(h4);
        }
        cfDiv4.appendChild(colmd10Div);
        bigDiv.appendChild(cfDiv4);


        //--------------------------------------------------------------
        //--------------------------------------------------------------

        var cfDiv5 = document.createElement("div");
        cfDiv5.setAttribute("class", "container-fluid");

        colmd2Div = document.createElement("div");
        colmd2Div.setAttribute("class", "col-md-2");
        h41 = document.createElement("h4");
        label = document.createElement("label");
        label.textContent = "Published in:";
        h41.appendChild(label);
        colmd2Div.appendChild(h41);
        cfDiv5.appendChild(colmd2Div);

        colmd10Div = document.createElement("div");
        colmd10Div.setAttribute("class", "col-md-10");
        colmd10Div.setAttribute("property", "isPartOfList");
        colmd10Div.setAttribute("typeof", "ItemList");
        colmd10Div.setAttribute("resource", "isPartList");

        var list_dates = jsonld["isPartOf"];
        if (list_dates.length == 0) {
            div = document.createElement("div");
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.textContent = "-";
            small.appendChild(span);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else if (list_dates.length == 1) {

            item = list_dates[0]["item"];
            name = item["name"];
            type = item["@type"];
            resource = item["identifier"];

            div = document.createElement("div");
            div.setAttribute("property", "isPartOf");
            div.setAttribute("typeof", type);
            div.setAttribute("resource", resource);

            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.setAttribute("property", "name");
            span.textContent = name;
            small.appendChild(span);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else {
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            ul = document.createElement("ul");
            ul.setAttribute("class", "list-group");

            for (var i in list_dates) {
                item = list_dates[i]["item"];
                name = item["name"];
                type = item["@type"];
                resource = item["identifier"];

                li = document.createElement("li");
                li.setAttribute("class", "list-group-item");
                div = document.createElement("div");
                div.setAttribute("property", "isPartOf");
                div.setAttribute("typeof", type);
                div.setAttribute("resource", resource);
                span = document.createElement("span");
                span.setAttribute("property", "name");
                span.textContent = name;
                div.appendChild(span);
                li.appendChild(div);
                ul.appendChild(li);
            }
            small.appendChild(ul);
            h4.appendChild(small);
            colmd10Div.appendChild(h4);
        }
        cfDiv5.appendChild(colmd10Div);
        bigDiv.appendChild(cfDiv5);

        //------------------------------------------------------
        //------------------------------------------------------

        var cfDiv6 = document.createElement("div");
        cfDiv6.setAttribute("class", "container-fluid");

        colmd2Div = document.createElement("div");
        colmd2Div.setAttribute("class", "col-md-2");
        h41 = document.createElement("h4");
        label = document.createElement("label");
        label.textContent = "Subjects:";
        h41.appendChild(label);
        colmd2Div.appendChild(h41);
        cfDiv6.appendChild(colmd2Div);

        colmd10Div = document.createElement("div");
        colmd10Div.setAttribute("class", "col-md-10");
        colmd10Div.setAttribute("property", "keywordsList");
        colmd10Div.setAttribute("typeof", "ItemList");
        colmd10Div.setAttribute("resource", "keywordsList");

        var list_dates = jsonld["keywords"];
        if (list_dates.length == 0) {
            div = document.createElement("div");
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.textContent = "-";
            small.appendChild(span);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else if (list_dates.length == 1) {

            item = list_dates[0]["item"];
            name = item["name"];
            type = item["@type"];
            resource = item["identifier"];

            div = document.createElement("div");
            div.setAttribute("property", "keywords");
            div.setAttribute("typeof", type);
            div.setAttribute("resource", resource);

            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            span = document.createElement("span");
            span.setAttribute("property", "name");
            span.textContent = name;
            small.appendChild(span);
            h4.appendChild(small);
            div.appendChild(h4);
            colmd10Div.appendChild(div);

        } else {
            h4 = document.createElement("h4");
            h4.setAttribute("style", "width: 102.5%; margin-left: -2%;");
            small = document.createElement("small");
            ul = document.createElement("ul");
            ul.setAttribute("class", "list-group");

            for (var i in list_dates) {
                item = list_dates[i]["item"];
                name = item["name"];
                type = item["@type"];
                resource = item["identifier"];

                li = document.createElement("li");
                li.setAttribute("class", "list-group-item");
                div = document.createElement("div");
                div.setAttribute("property", "keywords");
                div.setAttribute("typeof", type);
                div.setAttribute("resource", resource);
                span = document.createElement("span");
                span.setAttribute("property", "name");
                span.textContent = name;
                div.appendChild(span);
                li.appendChild(div);
                ul.appendChild(li);
            }
            small.appendChild(ul);
            h4.appendChild(small);
            colmd10Div.appendChild(h4);
        }
        divcfgraph = document.createElement("div");
        divcfgraph.setAttribute("class", "container-fluid");

        divcol = document.createElement("div");
        divcol.setAttribute("class", "col-md-2");
        divcol.setAttribute("style", "float: right");

        button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("class", "btn btn-primary btn-outline");
        button.setAttribute("data-toggle", "collapse");
        button.setAttribute("data-target", "#collapseGraph_" + contor);
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("data-controls", "collapseGraph_" + contor);
        button.setAttribute("onclick","setupDiagram(\"well_"+contor+"\")");
        button.textContent = "View graph";

        div_graph = document.createElement("div");
        div_graph.setAttribute('class', 'collapse');
        div_graph.setAttribute('style', 'width:100%; height:700px');
        div_graph.setAttribute('id', "collapseGraph_" + contor);

        div_body = document.createElement("div");
        div_body.setAttribute('class', 'well');
        div_body.setAttribute('id', "well_" + contor);
        div_body.setAttribute('style', 'width:100%; height:700px');

        div_graph.appendChild(div_body);
        divcol.appendChild(button);
        divcfgraph.appendChild(divcol);

        cfDiv6.appendChild(colmd10Div);
        bigDiv.appendChild(cfDiv6);
        bigDiv.appendChild(divcfgraph);
        bigDiv.appendChild(document.createElement("br"));
        bigDiv.appendChild(div_graph);
        collapseDiv.appendChild(bigDiv);

        title.appendChild(titleName);
        headDiv.appendChild(title);

        baseDiv.appendChild(headDiv);
        baseDiv.appendChild(collapseDiv);

        bigbigDiv.appendChild(baseDiv);
    }

    document.getElementById('accordion').appendChild(bigbigDiv);

    if(window.location.href.indexOf("/publications/") != -1) {
        //start remove collapse
        document.getElementById("collapse_1").classList.remove("collapse");
        document.getElementById("collapse_1").classList.remove("panel-collapse");

    } else {
        document.getElementById('pag').classList.remove("hidden");
    }
}

