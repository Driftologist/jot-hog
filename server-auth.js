var User = require( './user' )
var express = require( 'express' )
var jwt = require( 'jwt-simple' )
var _ = require( 'lodash' )
var app = express()
var bcrypt = require( 'bcrypt' )
app.use( require( 'body-parser' ).json() )

var users = [{username: 'drift', password: '$2a$10$fcT1M2wL7VFZJqKRZ9/QLu.5fVL3njkPXa9sp7KvO75tAG5Kyj6GS'}]
var secretKey = 'supersecretkey'

function findUserByUsername( username ) {
    return _.find( users, { username: username } )
}

function validateUser( user, password ) {
    return user.password === password
}

app.post( '/session', function( req, res, next ) {
    User.findOne( { username: req.body.username })
        .select( 'password' )
        .exec(function( err, user ) {
            if ( err ) {
                return next( err )
            }
            if ( !user ) {
                return res.send( 401 )
            }
            bcrypt.compare(
                req.body.password, user.password, function( err, valid) {
                    if ( err ) {
                        return next( err )
                    }
                    if ( !valid ) {
                        return res.send( 401 )
                    }
                    var token = jwt.encode(
                        { username: user.username }, secretKey )
                    res.json( token )
                })
    })
})

app.get( '/user', function( req, res ) {
    var token = req.headers[ 'x-auth' ]
    var user = jwt.decode( token, secretKey )
    User.findOne( { username: auth.username }, function( err, user ) {
        res.json( user )
    })
})

app.post( '/user', function( req, res, next ) {
    var user = new User({
        username: req.body.username
    })
    bcrypt.hash( req.body.password, 10, function( err, hash ) {
        user.password = hash
        user.save( function( err ) {
            if ( err ) {
                throw next( err )
            }
            res.send( 201 )
        })
    })
})

app.listen(3000)