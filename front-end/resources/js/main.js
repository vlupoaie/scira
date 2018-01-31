$("#searchButton").click(function(e) {
    var baseUrl = "http://example.com/search";

    var simpleSearch = document.getElementById("simpleSearch").value;
    var author = document.getElementById("author").value;
    var title = document.getElementById("title").value;
    var coauthor = document.getElementById("coauthor").value;
    var topic = document.getElementById("topic").value;
    var date = document.getElementById("date").value;
    var type = document.getElementById("type").value;

    if (author || title || coauthor || topic || date || type) {
        baseUrl +="/advanced?author=" + author + "&title=" + title + "&coauthor=" + coauthor +
                "&topic=" + topic + "&date=" + date + "&type=" + type;
        console.log(baseUrl);
    }
    else if (simpleSearch) {
        baseUrl += "?query=" + simpleSearch;
        console.log(baseUrl);
    }
    document.getElementById("search").action = baseUrl;
    document.getElementById("search").submit();
});


$(window).scroll(function () {
    $('#summary-list').width($('#summary-container').width() - 3);
});

$(window).resize(function () {
    $('#summary-list').width($('#summary-container').width() - 3);
});
