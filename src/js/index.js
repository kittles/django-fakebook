require("./autoCurry.js")();
var compose = require("./compose.js");
var songs = require("./songs.js");
var lunr = require("lunr");

// song pages
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

var addPage = compose(appendEl(document.body), 
                      addClass("song-page"), 
                      makeImg, 
                      makeSrc);


// search
var idx = lunr(function () {
    this.field("title");
});
Object.keys(songs).map(function (key) {
    console.log(key);
    idx.add({
        title: key,
        id: key
    });
});
window.idx = idx;
