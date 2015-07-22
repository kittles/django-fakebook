require("./autoCurry.js")();
require("./trim.js")();
var compose = require("./compose.js");
var songs = require("./songs.js");
var lunr = require("lunr");

var config = {
    CLICK_EVENTS: [
        "click",
        "touchend"
    ],
    DOUBLE_TAP_MS: 200
};


// make sure dragged touches don't fire click events
var dragging = false;
document.body.addEventListener("touchstart", function () {
    dragging = false;
});
document.body.addEventListener("touchmove", function () {
    dragging = true;
});


// double tap
var lastTap = -1000;


var search = document.getElementById("search");
var toggleSearch = document.getElementById("toggle-search");
var searchContainer = document.getElementById("search-container");
var searchInput = document.getElementById("search-input");
var searchResults = document.getElementById("search-results");
var searchDismiss = document.getElementById("search-dismiss");
var songContainer = document.getElementById("song-container");

var makeEl = function makeEl (tagName) {
    return document.createElement(tagName);
};

var makeImg = function makeImg (src) {
    var img = makeEl("img");
    img.src = src;
    return img;
};

var makeSrc = function makeSrc (number) {
    return "/public/img/fakebook-" + number + ".png";
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

var removeChildren = function removeChildren (el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
};

var clearSongContainer = removeChildren.bind(null, songContainer);

var addClickHandler = function addClickHandler (fn, el) {
    config.CLICK_EVENTS.map(function (evt) {
        el.addEventListener(evt, fn);
    });
}.autoCurry();


// make song pages
var addPage = compose(appendEl(document.getElementById("song-container")), 
                      addClass("song-page"), 
                      makeImg, 
                      makeSrc);


// make song options
var songNames = Object.keys(songs).sort();

var addResultClass = addClass("result");
var addResultInnerClass = addClass("result-inner");
var makeOptEl = function makeOptEl (name) {
    var parent = makeEl("div");
    var child = makeEl("div");
    child.appendChild(document.createTextNode(name));
    addResultClass(parent); 
    addResultInnerClass(child); 
    parent.appendChild(child);
    parent.songName = name; // used by click handler
    return parent;
};

var appendToResults = appendEl(searchResults);
var addSongClickHandler = addClickHandler(function () {
    if (!dragging) {
        clearSongContainer();
        songs[this.songName].map(addPage);
    }
});
var makeResult = compose(addSongClickHandler, appendToResults, makeOptEl);
songNames.map(makeResult);


// search
var idx = lunr(function () {
    this.field("title");
});
songNames.map(function (key) {
    idx.add({
        title: key,
        id: key
    });
});


// ui handlers
var toggleSearchOpen = swapClass.bind(null, "open", "closed", search);
addClickHandler(toggleSearchOpen, searchDismiss);
addClickHandler(function (e) {
    var oldTap = lastTap;
    lastTap = new Date();
    if (lastTap - oldTap < config.DOUBLE_TAP_MS) {
        toggleSearchOpen();
        e.preventDefault();
    }
}, songContainer);
searchInput.addEventListener("input", function () {
    var candidates = idx.search(this.value).map(prop("ref"));
    var results = window.toArray(document.getElementsByClassName("result"));

    if (this.value.length === 0) {
        results.map(function (result) {
            result.style.display = "block";
        });
    } else {
        results.map(function (result) {
            if (candidates.indexOf(result.songName) > -1) {
                result.style.display = "block";
            } else {
                result.style.display = "none";
            }
        });
    }
});
