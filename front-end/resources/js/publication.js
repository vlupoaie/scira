$("#searchButton").click(function (e) {
                                                 
    var baseUrl = "file:///home/ronesim/Projects/scira/front-end/index.html";

    var simpleSearch = document.getElementById("simpleSearch").value;
    var author = document.getElementById("author").value;
    var title = document.getElementById("title").value;
    var coauthor = document.getElementById("coauthor").value;
    var topic = document.getElementById("topic").value;
    var afterDate = document.getElementById("afterDate").value;
    var beforeDate = document.getElementById("beforeDate").value;

    var journal = document.getElementById("journal").checked;
    var article = document.getElementById("article").checked;
    var book = document.getElementById("book").checked;
    var publication = document.getElementById("publication").checked;
    var report = document.getElementById("report").checked;
    var textbook = document.getElementById("textbook").checked;
    var thesis = document.getElementById("thesis").checked;

    var datasource = document.querySelector('input[name="datasource"]:checked').value;
    document.cookie = "datasource=" + datasource;

    if (author || title || coauthor || topic || afterDate || beforeDate ||
        journal || article || book || publication || report || textbook || thesis) {
        baseUrl += "?author=" + author + "&title=" + title + "&coauthor=" + coauthor +
            "&topic=" + topic + "&afterDate=" + afterDate + "&beforeDate=" + beforeDate +
            "&academic journal article=" + journal + "&scientific article=" + article + "&science book=" + book + "&publication=" + publication +
            "&report=" + report + "&textbook=" + textbook + "&doctoral thesis=" + thesis;
        window.location.replace(baseUrl + "&page=1");
    }
    else if (simpleSearch) {
        baseUrl += "?query=" + simpleSearch;
        window.location.replace(baseUrl + "&page=1");
    }

});

window.onload = function() {
    var url = window.location.href
    var searchPublication = url.indexOf("/publications/");

    var baseUrlApi = "http://scira.tk/api/publications/" +  url.split("/publications/")[1];
    if (searchPublication != -1) {
        $.get(baseUrlApi, function (data) {
            buildRDFA(data);
        }, "json");
    }
}
