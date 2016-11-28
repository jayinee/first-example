#!/usr/bin/env babel-node

var path = require('path');
var fs = require('fs-extra');

var pa1 = path.join(process.cwd(), 'project-assignment-1');
var pa2 = path.join(process.cwd(), 'project-assignment-2');
var pa3 = path.join(process.cwd(), 'project-assignment-3');
var pa4 = path.join(process.cwd(), 'project-assignment-4');
var pa5 = path.join(process.cwd(), 'project-assignment-5');
var pa6 = path.join(process.cwd(), 'project-assignment-6');
var dist = path.join(process.cwd(), 'dist');
var pub = path.join(process.cwd(), 'public');

fs.removeSync(dist);

function filter(file) {
    if (file.includes('sass')) {
        return false;
    }
    return true;
}

fs.copy(pub, dist, function () {});
fs.copy(pa1, dist, filter, function () {});

fs.copy(pa2, path.join(dist, 'two'), filter, function () {});
fs.copy(pa3, path.join(dist, 'three'), filter, function () {});
fs.copy(pa4, path.join(dist, 'four'), filter, function () {});
fs.copy(pa5, path.join(dist, 'five'), filter, function () {});
fs.copy(pa6, path.join(dist, 'six'), filter, function () {});

console.log('Complete');
