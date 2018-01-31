
function buildRDFA(jsonldlist) {

    bigbigDiv = document.createElement("div");
    bigbigDiv.setAttribute("id", "results");
    var contor = 0;
    for (var i in jsonldlist["results"]) {
        contor++;
        jsonld = jsonldlist["results"][i]
        //First Container Fluid - with Presentation Name --------------------
        publication_identifier = jsonld["identifier"];

        baseDiv = document.createElement("div");
        baseDiv.setAttribute("class", "panel panel-default");

        headDiv = document.createElement("div");
        headDiv.setAttribute("class", "panel-heading edit-plugin-heading");
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

        small.appendChild(span);
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
            }
            else {
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
                }
                else {
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

            for (var i in list_citation) {
                item = list_citation[i]["item"];
                name = item["name"];
                type = item["@type"];
                resource = item["identifier"];

                li = document.createElement("li");
                li.setAttribute("class", "list-group-item");
                div = document.createElement("div");
                div.setAttribute("property", "citation");
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

            for (var i in list_subjectOf) {
                item = list_citation[i]["item"];
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
                div.appendChild(span);
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
            }
            else {
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
                }
                else {
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
        button.setAttribute("class","btn btn-primary btn-outline");
        button.textContent = "View graph";

        divcol.appendChild(button);
        divcfgraph.appendChild(divcol);

        cfDiv6.appendChild(colmd10Div);
        bigDiv.appendChild(cfDiv6);
        bigDiv.appendChild(divcfgraph);
        collapseDiv.appendChild(bigDiv);

        title.appendChild(titleName);
        headDiv.appendChild(title);

        baseDiv.appendChild(headDiv);
        baseDiv.appendChild(collapseDiv);

        bigbigDiv.appendChild(baseDiv);
    }

    document.getElementById('accordion').appendChild(bigbigDiv);
    document.getElementById('pag').classList.remove("hidden");
}