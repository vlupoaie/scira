$("#searchButton").click(function (e) {
    var baseUrl = "file:///home/ronesim/Projects/scira-front/index.html";

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

    if (author || title || coauthor || topic || afterDate || beforeDate ||
        journal || article || book || publication || report || textbook || thesis) {
        baseUrl += "?author=" + author + "&title=" + title + "&coauthor=" + coauthor +
            "&topic=" + topic + "&afterDate=" + afterDate + "&beforeDate=" + beforeDate +
            "&academic journal article=" + journal + "&scientific article=" + article + "&science book=" + book + "&publication=" + publication +
            "&report=" + report + "&textbook=" + textbook + "&doctoral thesis=" + thesis;

        doAdvancedQuery(baseUrl, 1);
    }
    else if (simpleSearch) {
        baseUrl += "?query=" + simpleSearch;
        doSimpleQuery(baseUrl, 1);
    }

});

function doAdvancedQuery(url, page) {
    var newUrl = url.split("&page=")[0];
    console.log(newUrl+"&page=" + page);
    window.location.replace(newUrl+"&page=" + page);
}

function doSimpleQuery(url, page) {
    var newUrl = url.split("&page=")[0];
    console.log(newUrl+"&page=" + page);
    window.location.replace(newUrl+"&page=" + page);
}
$(document).ready(function () {
    var findPage = window.location.href.split("&page=")[1];
    var page = 1;
    if (findPage > 1) page = findPage;
    if(page == 1) {
        var prev = document.getElementById("prev");
        prev.classList.add("disabled");
    } else {
        var prev = document.getElementById("prev");
        prev.classList.remove("disabled");
    }

    $('.next').on('click', function () {
        page++;
        var url = window.location.href;
        doSimpleQuery(url, page);
    })

    $('.previous').on('click', function () {
        page--;
        var url = window.location.href;
        doAdvancedQuery(url, page);
    })  
});

$(window).scroll(function () {
    $('#summary-list').width($('#summary-container').width() - 3);
});

$(window).resize(function () {
    $('#summary-list').width($('#summary-container').width() - 3);
});
