var pages = [];

function textUpdated(id) {
    var textbox = document.getElementById(id);
    var value = textbox.value;

    pages = [];
    var selector = parseInt(Math.random() * 10000000);
    $("#content").empty();
    $("#content").append("<div id=\"" + selector + "\"></div>");
    visitPageWithTitle(value, "#" + selector);
}

function visitPageWithTitle(title, selector) {
    if ($(selector).length === 0) return;

    $(selector).prepend("<p>" + title + "</p>");
    if (title === "philosophy") {
        return $(selector).prepend("<p>Got to Philosophy in " + pages.length + " pages!</p>");
    }
    pages.push(title);

    if (pages.length >= 3 && pages[pages.length - 1] === pages[pages.length - 3]) {
        return $(selector).prepend("<p>Stuck in loop between: " + pages[pages.length - 3] + " and: " + pages[pages.length - 1] + "</p>");
    }

    $.ajax({
        type: "GET",
        url: "http://en.wikipedia.org/w/api.php?format=json&action=query&titles=" + escape(title) + "&prop=revisions&rvprop=content&callback=jsonp",
        dataType: "jsonp",
        success: function(data) {
            var page = data.query.pages[Object.keys(data.query.pages)[0]].revisions;
            if (typeof page === "object") {
                var pageData = data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]["*"];
                var firstExtract = pageData;
                var currentParenCount = 0;
                var currentBracketCount = 0;
                var currentlyInFile = false;

                var nextSearchWord = "did not find";

                for (var i = 0; i < firstExtract.length; i++) {
                    if ("({".indexOf(firstExtract.charAt(i)) !== -1) currentParenCount++;
                    else if (")}".indexOf(firstExtract.charAt(i)) !== -1) currentParenCount--;
                    else if (firstExtract.charAt(i) === '[' && currentParenCount === 0) currentBracketCount++;
                    else if (firstExtract.charAt(i) === ']' && currentBracketCount !== 0) currentBracketCount--;

                    if (currentBracketCount === 0 && currentlyInFile) {
                        currentlyInFile = false;
                    }

                    if (currentParenCount === 0 && currentBracketCount === 2) {
                        var finalExtract = firstExtract.substr(i - 1, firstExtract.length);
                        if (finalExtract.substr(0, 7) === "[[File:" || finalExtract.substr(0, 8) === "[[Image:" || finalExtract.substr(0, 5) === "[[WP:" || finalExtract.substr(0, 12) === "[[Wikipedia:" || finalExtract.substr(0, 12) === "[[:Category:" || finalExtract.substr(0, 11) === "[[Category:") {
                            currentlyInFile = true;
                        } else if (!currentlyInFile) {
                            nextSearchWord = finalExtract.match(/\[\[((?:(?!File:).).*?)\]\]/)[1].replace(/\|.*/, '');
                            return visitPageWithTitle(nextSearchWord, selector);
                        }
                    }
                }

                return $(selector).prepend("<p>Can't do anything from here :/</p>");
            }
        }
    });
}
