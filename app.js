var express = require('express');
var path = require('path');
var morgan = require('morgan');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
io.on('connection', function(socket) {
  socket.on('roomer',function(drat){
    socket.roomy = drat;
    socket.join(drat);
  })
  socket.on('communism',function(){
    io.sockets.in(socket.roomy).emit('pokemon', `Someone has poked ${socket.roomy}`);
  })
});
