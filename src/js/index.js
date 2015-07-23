require("./autoCurry.js")();
require("./trim.js")();
require("./docReady.js")();
var compose = require("./compose.js");
var songs = require("./songs.js");
var lunr = require("lunr");
var songNames = Object.keys(songs).sort();

var CLICK_EVENTS = [
    "click",
    "touchend"
];
var DOUBLE_TAP_MS = 200;
var SONG_IMG_BASEPATH = "/public/img/fakebook-";
var SONG_IMG_FILETYPE = ".png";

// for double tap
var lastTap = -1000;

// make sure dragged touches don't fire click events
var dragging = false;
document.body.addEventListener("touchstart", function () {
    dragging = false;
});
document.body.addEventListener("touchmove", function () {
    dragging = true;
});

// dom node references
var search = document.getElementById("search");
var toggleSearch = document.getElementById("toggle-search");
var searchContainer = document.getElementById("search-container");
var searchInput = document.getElementById("search-input");
var searchResults = document.getElementById("search-results");
var searchDismiss = document.getElementById("search-dismiss");
var songContainer = document.getElementById("song-container");

// utility functions
var makeEl = function makeEl (tagName) {
    return document.createElement(tagName);
};
var makeImg = function makeImg (src) {
    var img = makeEl("img");
    img.src = src;
    return img;
};
var makeSrc = function makeSrc (number) {
    return SONG_IMG_BASEPATH + number + SONG_IMG_FILETYPE;
};
var appendEl = function appendEl (parent, child) {
    parent.appendChild(child);
    return child;
}.autoCurry();
var addClass = function addClass (name, el) {
    if (el.className.indexOf(name) < 0) {
        if (el.className) {
            el.className += " ";
        }
        el.className += name;
    }
    return el;
}.autoCurry();
var removeClass = function removeClass (name, el) {
    el.className = el.className.replace(name, "").trim();
    return el;
}.autoCurry();
var swapClass = function swapClass (one, two, el) {
    if (el.className.indexOf(one) >= 0) {
        removeClass(one, el);
        addClass(two, el);
    } else {
        removeClass(two, el);
        addClass(one, el);
    }
};
var prop = function prop (name, obj) {
    return obj[name];
}.autoCurry();
var setStyle = function setStyle (attr, value, el) {
    el.style[attr] = value;
}.autoCurry();
var hideEl = setStyle("display", "none");
var showEl = setStyle("display", "block");
var removeChildren = function removeChildren (el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
};
var clearSongContainer = removeChildren.bind(null, songContainer);
var addClickHandler = function addClickHandler (fn, el) {
    CLICK_EVENTS.map(function (evt) {
        el.addEventListener(evt, fn);
    });
    return el;
}.autoCurry();
var addPage = compose(appendEl(document.getElementById("song-container")), 
                      addClass("song-page"), 
                      makeImg, 
                      makeSrc);
var addResultClass = addClass("result");
var addResultInnerClass = addClass("result-inner");
var makeOptEl = function makeOptEl (name) {
    var parent = makeEl("div");
    var child = makeEl("div");
    child.appendChild(document.createTextNode(name));
    addResultClass(parent); 
    addResultInnerClass(child); 
    parent.appendChild(child);
    parent.songName = name; // used by click handler to know which images to load
    return parent;
};
var appendToResults = appendEl(searchResults);
var addSongClickHandler = addClickHandler(function () {
    if (!dragging) {
        clearSongContainer();
        songs[this.songName].map(addPage);
        toggleSearchOpen();
    }
});
var makeResult = compose(addSongClickHandler, appendToResults, makeOptEl);
var toggleSearchOpen = swapClass.bind(null, "open", "closed", search);

// init
window.docReady(init);

function init () {
    lunr.stopWordFilter.stopWords.elements = []; // remove stopwords so single letters have results
    var idx = lunr(function () {
        this.field("title");
    });
    var results = window.toArray(songNames.map(makeResult));
    songNames.map(function (key) {
        idx.add({
            title: key,
            id: key
        });
    });

    // ui handlers
    addClickHandler(toggleSearchOpen, searchDismiss);
    addClickHandler(function (e) {
        var oldTap = lastTap;
        lastTap = new Date();
        if (lastTap - oldTap < DOUBLE_TAP_MS) {
            toggleSearchOpen();
            e.preventDefault();
        }
    }, songContainer);
    searchInput.addEventListener("input", function () {
        var candidates = idx.search(this.value).map(prop("ref"));
        
        if (this.value.length === 0) {
            // show the whole list if there's no search term
            results.map(function (result) {
                showEl(result);
            });
        } else {
            // show the songs that show up in the search result
            results.map(function (result) {
                if (candidates.indexOf(result.songName) > -1) {
                    showEl(result);
                } else {
                    hideEl(result);
                }
            });
        }
    });
}
