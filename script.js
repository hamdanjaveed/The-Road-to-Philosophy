function textUpdated(id) {
    var textbox = document.getElementById(id);
    var value = textbox.value;
    
    $("#content").empty();
    visitPageWithTitle(value);
}

function visitPageWithTitle(title) {
    $.ajax({
        type: "GET",
        url: "http://en.wikipedia.org/w/api.php?format=json&action=query&titles=" + escape(title) + "&prop=revisions&rvprop=content&callback=jsonp",
        dataType: "jsonp",
        success: function(data) {
            var page = data.query.pages[Object.keys(data.query.pages)[0]].revisions;
            if (typeof page === "object") {
                var pageData = data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]["*"];
                $("#content").append("<p>Page found with content: " + pageData + "</p>");
            } else {
                $("#content").append("<p>No page found</p>");
            }
        }
    });
}