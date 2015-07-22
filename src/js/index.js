var $ = require("jquery");
var R = require("ramda");
require("./autoCurry.js")();

var makeEl = function makeEl (tagName) {
    return $("<" + tagName + "></" + tagName + ">");
};
var setAttr = function setAttr (attributeName, el, value) {
    el.attr(attributeName, value);
    return el;
}.autoCurry();

window.makeImg = setAttr("src")(makeEl("img"));
